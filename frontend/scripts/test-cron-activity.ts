// @ts-nocheck
import { prisma } from '../src/lib/db/prisma'
import { processStudentActivityRecommendation } from '../src/lib/cron/cron-service'

async function main() {
    const studentEmail = process.argv[2]

    console.log('🧪 Testing AI Activity Recommendations...')

    let student
    if (studentEmail) {
        // Try to find by parent email links -> complicate
        // Just find any student for now if no arg
        console.log('Finding student linked to email:', studentEmail)
        // simplifying for test: find FIRST student with assessments
    }

    // Find a student who has assessments
    student = await prisma.student.findFirst({
        where: {
            assessments: {
                some: {}
            }
        },
        include: {
            assessments: {
                orderBy: { assessmentDate: 'desc' },
                take: 1,
                include: {
                    scores: {
                        include: { domain: true }
                    }
                }
            },
            parentStudents: {
                include: {
                    parent: true
                }
            }
        }
    })

    if (!student) {
        console.error('❌ No student with assessments found in DB. Run seed first.')
        return
    }

    const parent = student.parentStudents?.[0]?.parent

    console.log(`👤 Testing for Student: ${student.firstName} ${student.lastName} (Age: ${new Date().getFullYear() - student.dateOfBirth.getFullYear()
        })`)

    if (!parent) {
        console.error('❌ Student has no parent linked.')
        return
    }

    // Calculate age
    const age = new Date().getFullYear() - student.dateOfBirth.getFullYear()
    const logs: any[] = []

    // Run the logic
    console.log('🔄 Running recommendation engine...')
    const success = await processStudentActivityRecommendation(
        student,
        parent,
        age,
        logs
    )

    console.log('✅ Processing Complete')
    console.log('Result:', success ? 'Recommendation Sent' : 'No Recommendation Sent')
    console.log('Logs:', JSON.stringify(logs, null, 2))

    // Verify DB
    if (success) {
        const recs = await prisma.activityRecommendation.findMany({
            where: { studentId: student.id },
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: { activity: true }
        })
        console.log('📝 Saved Recommendation:', recs[0]?.activity?.title, '| Reason:', recs[0]?.reason)
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
