// @ts-nocheck
import { prisma } from '../src/lib/db/prisma'
import { processZScores } from '../src/lib/cron/z-score-engine'

async function main() {
    console.log('🧪 Testing Neuro-Intelligence V3 (Z-Score Engine)...')

    // 1. Setup: Find a student and ensure age is known
    // We'll use Osman again or finding one.
    const student = await prisma.student.findFirst({
        where: { isActive: true },
        select: { id: true, firstName: true, dateOfBirth: true }
    })

    if (!student) {
        console.error('❌ No active student found.')
        return
    }

    console.log(`👤 Student: ${student.firstName} (${student.id})`)

    // Calculate age
    const ageInAllMonths = Math.floor((new Date().getTime() - new Date(student.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 30.44))
    console.log(`📅 Age: ${ageInAllMonths} months`)

    // 2. Setup: Ensure we have domains
    const domains = await prisma.developmentDomain.findMany()
    if (domains.length === 0) {
        console.error('❌ No domains found.')
        return
    }
    const testDomain = domains[0]
    console.log(`📚 Domain: ${testDomain.code} (${testDomain.nameTr})`)

    // 3. Setup: Create Mock Assessments for this student to ensure we have data
    console.log('\n--- 1. Creating Mock Assessment Data ---')

    // Get a valid user for assessor
    const assessor = await prisma.user.findFirst()
    if (!assessor) {
        console.error('❌ No user found to be assessor.')
        return
    }

    // Create an assessment 1 day ago
    const assessment = await prisma.assessment.create({
        data: {
            studentId: student.id,
            assessedBy: assessor.id,
            assessmentDate: new Date(),
        }
    })

    // Add a score of 4 (Above average?)
    const rawScore = 4.5
    await prisma.assessmentScore.create({
        data: {
            assessmentId: assessment.id,
            domainId: testDomain.id,
            score: 5, // 5 out of 5, mapped to high percentage
            percentage: 90,
            observationNotes: 'TEST Z-SCORE DATA'
        }
    })

    // We need to ensure the engine picks this up. The engine uses groupBy _avg of score.
    // We just added one score of 5. So avg will be 5.
    console.log(`✅ Added mock score: 5 for ${testDomain.code}`)

    // 4. Run Engine
    console.log('\n--- 2. Running Z-Score Engine ---')
    await processZScores()

    // 5. Verify
    console.log('\n--- 3. Verification ---')

    // Find the Z-Profile
    const profile = await prisma.childNeuroZProfile.findFirst({
        where: {
            studentId: student.id,
            domain: testDomain.code
        },
        orderBy: { calculatedAt: 'desc' }
    })

    if (!profile) {
        console.error('❌ No Z-Profile created!')
        // Double check if norms exist for this age
        const norm = await prisma.neuroNorm.findFirst({
            where: { domainCode: testDomain.code }
        })
        console.log('DEBUG: Norm exists?', !!norm, norm)
    } else {
        console.log('🎉 SUCCESS: Z-Profile created.')
        console.log(profile)
        console.log(`   Raw Score: ${profile.rawScore}`)
        console.log(`   Z-Score: ${profile.zScore.toFixed(2)}`)
        console.log(`   Percentile: ${profile.percentile.toFixed(2)}%`)

        // Interpretation
        if (profile.zScore > 0) console.log('   📈 Above Average')
        else if (profile.zScore < 0) console.log('   📉 Below Average')
        else console.log('   ➖ Average')
    }

    // Cleanup (optional)
    // await prisma.assessmentScore.deleteMany({ where: { observationNotes: 'TEST Z-SCORE DATA' }})
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
