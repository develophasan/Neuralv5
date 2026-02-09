import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('👪 Testing Parent Loop & Gamification...')

    // 1. Get a student
    const student = await prisma.student.findFirst()
    if (!student) {
        console.error('❌ No student found. Run seed first.')
        return
    }
    console.log(`👤 Testing with student: ${student.firstName} ${student.lastName} (Points: ${student.neuroPoints})`)
    const initialPoints = student.neuroPoints

    // 2. Get a domain
    const domain = await prisma.developmentDomain.findFirst()
    if (!domain) {
        console.error('❌ No domain found.')
        return
    }

    // 3. Create a dummy activity if needed (or find one)
    let activity = await prisma.activity.findFirst()
    if (!activity) {
        console.log('🛠 Creating test activity...')
        activity = await prisma.activity.create({
            data: {
                title: 'Test Activity',
                domainId: domain.id,
                ageMin: 3,
                ageMax: 6
            }
        })
    }

    // 4. Create a Recommendation
    console.log('📝 Creating Activity Recommendation...')
    const recommendation = await prisma.activityRecommendation.create({
        data: {
            studentId: student.id,
            activityId: activity.id,
            domainId: domain.id,
            recommendedTo: 'parent',
            status: 'pending'
        }
    })
    console.log(`✅ Recommendation created: ${recommendation.id}`)

    // 5. Simulate "Complete Activity" (The Logic in /napi/activity/complete)
    console.log('🏆 Parent clicks "Complete" -> Awarding Points...')

    const result = await prisma.$transaction(async (tx) => {
        // Update Rec
        const updatedRec = await tx.activityRecommendation.update({
            where: { id: recommendation.id },
            data: {
                status: 'completed',
                completedAt: new Date()
            }
        })

        // Award Points
        const POINTS = 10
        const updatedStudent = await tx.student.update({
            where: { id: student.id },
            data: {
                neuroPoints: { increment: POINTS }
            }
        })

        return { updatedRec, updatedStudent }
    })

    // 6. Verify
    console.log(`🎉 Activity status: ${result.updatedRec.status}`)
    console.log(`💰 New Points: ${result.updatedStudent.neuroPoints}`)

    if (result.updatedStudent.neuroPoints === initialPoints + 10) {
        console.log('✅ TEST PASSED: Points awarded correctly.')
    } else {
        console.error('❌ TEST FAILED: Points mismatch.')
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
