// Netlify Function - Teacher Classes API
// Neon veritabanı ile çalışır

import type { Handler } from '@netlify/functions'
import { PrismaClient } from '@prisma/client'

// Prisma client'ı global olarak cache'le (Netlify Functions için)
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
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  }

  // OPTIONS request için CORS
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
      where: {
        teacherId,
      },
      include: {
        class: {
          include: {
            classStudents: {
              where: {
                isActive: true,
              },
              include: {
                student: true,
              },
            },
          },
        },
      },
    })

    const classes = teacherClasses.map((tc) => ({
      ...tc.class,
      students: tc.class.classStudents.map((cs) => cs.student),
      student_count: tc.class.classStudents.length,
    }))

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(classes),
    }
  } catch (error) {
    console.error('Error fetching classes:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}

