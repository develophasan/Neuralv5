import { prisma } from '../db/prisma'

// Standard Normal Cumulative Distribution Function
function errorFunction(x: number): number {
    const t = 1 / (1 + 0.5 * Math.abs(x))
    const tau = t * Math.exp(-x * x - 1.26551223 +
        t * (1.00002368 +
            t * (0.37409196 +
                t * (0.09678418 +
                    t * (-0.18628806 +
                        t * (0.27886807 +
                            t * (-1.13520398 +
                                t * (1.48851587 +
                                    t * (-0.82215223 +
                                        t * 0.17087277)))))))))
    if (x >= 0) return 1 - tau / 2
    return tau / 2
}

function calculatePercentile(zScore: number): number {
    // Using error function approximation for normal distribution
    return errorFunction(zScore / Math.sqrt(2)) * 100
}

export async function processZScores() {
    console.log('🧠 Starting Z-Score Calculation Engine...')

    // 1. Get all active students
    const students = await prisma.student.findMany({
        where: { isActive: true },
        select: { id: true, dateOfBirth: true }
    })

    console.log(`📊 Processing ${students.length} students...`)

    // Get start of current week (Monday)
    const today = new Date()
    const day = today.getDay()
    const diff = today.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
    const weekStart = new Date(today.setDate(diff))
    weekStart.setHours(0, 0, 0, 0)

    // Look back window (e.g., 30 days) to get 'current' ability
    const lookBackDate = new Date()
    lookBackDate.setDate(lookBackDate.getDate() - 30)

    let processedCount = 0

    for (const student of students) {
        // Calculate age in months
        const ageInMilliseconds = new Date().getTime() - new Date(student.dateOfBirth).getTime()
        const ageInMonths = Math.floor(ageInMilliseconds / (1000 * 60 * 60 * 24 * 30.44))

        // Find closest norm age bucket (36, 48, 60, 72)
        // We'll support interpolation later, for now prompt nearest
        // Available: 36, 48, 60, 72. 
        // Logic: Find the norm with ageMonth <= studentAge (or closest)
        // For simplicity in Phase 3 verification, we'll try to find exact match or closest floor

        // 2. Aggregate scores per domain for last 30 days
        const scores = await prisma.assessmentScore.groupBy({
            by: ['domainId'],
            where: {
                assessment: {
                    studentId: student.id,
                    assessmentDate: { gte: lookBackDate }
                }
            },
            _avg: {
                score: true,
                percentage: true
            }
        })

        if (scores.length === 0) continue

        for (const scoreAgg of scores) {
            if (!scoreAgg._avg.score) continue

            const rawScore = scoreAgg._avg.score

            // Get Domain Code
            const domain = await prisma.developmentDomain.findUnique({
                where: { id: scoreAgg.domainId }
            })

            if (!domain) continue

            // 3. Fetch Norm
            // Find closest age norm (simple logic: max age that is <= student age, default to lowest if too young)
            // Actually we seeded 36, 48, 60, 72.
            // If student is 40 months -> use 36? or 48? 
            // Let's find the one with min abs diff
            const allNorms = await prisma.neuroNorm.findMany({
                where: { domainCode: domain.code }
            })

            if (allNorms.length === 0) continue

            const norm = allNorms.reduce((prev, curr) => {
                return (Math.abs(curr.ageMonth - ageInMonths) < Math.abs(prev.ageMonth - ageInMonths) ? curr : prev)
            })

            // 4. Calculate Z-Score
            let zScore = (rawScore - norm.mean) / norm.stdDev

            // Cap Z-Score for sanity (-3 to +3 generally)
            zScore = Math.max(-3, Math.min(3, zScore))

            const percentile = calculatePercentile(zScore)

            // 5. Save Profile
            await prisma.childNeuroZProfile.upsert({
                where: {
                    studentId_domain_weekStart: {
                        studentId: student.id,
                        domain: domain.code,
                        weekStart: weekStart
                    }
                },
                update: {
                    rawScore,
                    zScore,
                    percentile,
                    ageInMonths,
                    calculatedAt: new Date()
                },
                create: {
                    studentId: student.id,
                    domain: domain.code,
                    weekStart,
                    rawScore,
                    zScore,
                    percentile,
                    ageInMonths,
                }
            })
        }
        processedCount++
    }

    console.log(`✅ Z-Score calculation complete. Processed ${processedCount} students.`)
}
