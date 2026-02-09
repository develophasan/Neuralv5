// Admin: Daily Logs CRUD
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { handleApiError } from '@/lib/api/errors'
import { getQueryParams, getBody } from '@/lib/api/middleware'
import { CreateDailyLogSchema } from '@/lib/validations'
import { PaginationSchema } from '@/lib/api/types'
import { successResponse, createPaginatedResponse } from '@/lib/api/utils'
import { z } from 'zod'

// GET /api/admin/daily-logs - List all daily logs
export async function GET(request: NextRequest) {
  try {
    const queryResult = getQueryParams(request, PaginationSchema.extend({
      studentId: z.string().uuid().optional(),
      classId: z.string().uuid().optional(),
      date: z.string().optional(),
    }).passthrough())

    if (!queryResult.success) {
      return NextResponse.json({ success: false, error: queryResult.error }, { status: 400 })
    }

    const { page = 1, limit = 20, studentId, classId, date } = queryResult.data
    const skip = (page - 1) * limit

    const where: any = {}
    if (studentId) where.studentId = studentId
    if (classId) where.classId = classId
    if (date) {
      const dateObj = new Date(date)
      where.logDate = {
        gte: new Date(dateObj.setHours(0, 0, 0, 0)),
        lt: new Date(dateObj.setHours(23, 59, 59, 999)),
      }
    }

    const [logs, total] = await Promise.all([
      prisma.dailyLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { logDate: 'desc' },
        include: {
          student: true,
          class: true,
          logger: {
            select: { id: true, fullName: true },
          },
        },
      }),
      prisma.dailyLog.count({ where }),
    ])

    return successResponse(createPaginatedResponse(logs, total, { page, limit }))
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/admin/daily-logs - Create daily log
export async function POST(request: NextRequest) {
  try {
    const bodyResult = await getBody(request, CreateDailyLogSchema)
    if (!bodyResult.success) {
      return NextResponse.json({ success: false, error: bodyResult.error }, { status: 400 })
    }

    const data = {
      ...bodyResult.data,
      logDate: bodyResult.data.logDate ? new Date(bodyResult.data.logDate) : new Date(),
      loggedBy: (bodyResult.data as any).loggedBy || '00000000-0000-0000-0000-000000000000', // Default user ID
    }

    const log = await prisma.dailyLog.create({
      data,
      include: {
        student: true,
        class: true,
      },
    })

    return successResponse(log, 'Daily log created successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

