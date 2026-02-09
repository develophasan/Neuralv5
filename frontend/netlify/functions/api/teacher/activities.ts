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
              select: { studentId: true },
            },
          },
        },
      },
    })

    const studentIds = teacherClasses.flatMap((tc) =>
      tc.class.classStudents.map((cs) => cs.studentId)
    )

    const recommendations = await prisma.activityRecommendation.findMany({
      where: {
        studentId: { in: studentIds },
        status: 'pending',
        recommendedTo: { in: ['teacher', 'both'] },
      },
      include: {
        activity: true,
        student: true,
        domain: true,
      },
      orderBy: {
        recommendedAt: 'desc',
      },
      take: 5,
    })

    const activities = recommendations.map((rec) => ({
      activity: {
        ...rec,
        activity_details: {
          title: rec.activity.title,
          description: rec.activity.description,
          domain: rec.domain,
        },
      },
      student: rec.student,
      priority:
        rec.currentScore && rec.thresholdScore
          ? rec.currentScore < rec.thresholdScore - 1
            ? 'high'
            : 'medium'
          : 'low',
    }))

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(activities),
    }
  } catch (error) {
    console.error('Error fetching activities:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}

