import type { Handler } from '@netlify/functions'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    }
  }

  try {
    const teacherId = event.queryStringParameters?.teacherId

    if (!teacherId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Teacher ID required' }),
      }
    }

    const teacherClasses = await prisma.classTeacher.findMany({
      where: { teacherId },
      include: {
        class: {
          include: {
            classStudents: {
              where: { isActive: true },
            },
          },
        },
      },
    })

    const totalClasses = teacherClasses.length
    const totalStudents = teacherClasses.reduce(
      (sum, tc) => sum + tc.class.classStudents.length,
      0
    )

    const studentIds = teacherClasses.flatMap((tc) =>
      tc.class.classStudents.map((cs) => cs.studentId)
    )

    const pendingActivities = await prisma.activityRecommendation.count({
      where: {
        studentId: { in: studentIds },
        status: 'pending',
        recommendedTo: { in: ['teacher', 'both'] },
      },
    })

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentAssessments = await prisma.assessment.findMany({
      where: {
        studentId: { in: studentIds },
        assessmentDate: { gte: sevenDaysAgo },
      },
      select: { studentId: true },
      distinct: ['studentId'],
    })

    const assessedStudentIds = recentAssessments.map((a) => a.studentId)
    const pendingAssessments = studentIds.filter((id) => !assessedStudentIds.includes(id)).length

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        total_students: totalStudents,
        total_classes: totalClasses,
        pending_assessments: pendingAssessments,
        pending_activities: pendingActivities,
      }),
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}

