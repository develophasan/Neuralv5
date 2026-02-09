// @ts-nocheck
import { prisma } from '../src/lib/db/prisma'

async function main() {
    console.log('🧪 Testing Quick Assessment Flow (Assessment 2.0)...')

    // 1. Fetch Domains
    console.log('\n--- 1. Fetching Domains ---')
    const domains = await prisma.developmentDomain.findMany({
        take: 3
    })

    if (domains.length === 0) {
        console.error('❌ No domains found. Seed DB first.')
        return
    }

    console.log(`✅ Found ${domains.length} domains (showing first 3):`)
    domains.forEach(d => console.log(`   - [${d.code}] ${d.nameTr}`))

    // 2. Select a Student
    console.log('\n--- 2. Selecting Student ---')
    const student = await prisma.student.findFirst({
        where: { isActive: true },
        include: { parentStudents: true }
    })

    if (!student) {
        console.error('❌ No active student found.')
        return
    }
    console.log(`✅ Selected Student: ${student.firstName} ${student.lastName} (${student.id})`)

    // 3. Select a Teacher (Assessor)
    const teacher = await prisma.user.findFirst({
        where: { role: 'teacher' }
    })
    const assessorId = teacher?.id || 'simulated-teacher-id'
    console.log(`✅ Assessor ID: ${assessorId}`)

    // 4. Simulate Quick Assessment Submission
    const targetDomain = domains[0]
    const score = 5 // "İyi"

    console.log(`\n--- 3. Submitting Assessment for '${targetDomain.nameTr}' ---`)
    console.log(`   Score: ${score}`)

    // Logic from /napi/assessment/quick/route.ts
    // 4a. Find/Create Assessment
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    let assessment = await prisma.assessment.findFirst({
        where: {
            studentId: student.id,
            assessmentDate: {
                gte: today,
                lt: tomorrow
            }
        }
    })

    if (!assessment) {
        console.log('   ℹ️ Creating new daily assessment record...')
        assessment = await prisma.assessment.create({
            data: {
                studentId: student.id,
                assessedBy: assessorId,
                assessmentDate: new Date(),
            }
        })
    } else {
        console.log('   ℹ️ Found existing daily assessment record.')
    }

    // 4b. Upsert Score
    const assessmentScore = await prisma.assessmentScore.upsert({
        where: {
            assessmentId_domainId: {
                assessmentId: assessment.id,
                domainId: targetDomain.id
            }
        },
        update: {
            score: score,
            percentage: (score / 5) * 100,
            observationNotes: 'TEST: Quick assessment via One-Tap interface'
        },
        create: {
            assessmentId: assessment.id,
            domainId: targetDomain.id,
            score: score,
            percentage: (score / 5) * 100,
            observationNotes: 'TEST: Quick assessment via One-Tap interface'
        }
    })

    console.log('✅ Assessment Score Saved:', assessmentScore)

    // 5. Verification
    console.log('\n--- 4. Verification Read ---')
    const verify = await prisma.assessmentScore.findUnique({
        where: { id: assessmentScore.id },
        include: { domain: true, assessment: true }
    })

    if (verify && verify.score === score && verify.assessment.studentId === student.id) {
        console.log('🎉 SUCCESS: Assessment flow verified correctly.')
    } else {
        console.error('❌ FAILURE: Verification read mismatch.')
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
