// Admin: Activities CRUD
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { handleApiError } from '@/lib/api/errors'
import { getQueryParams, getBody } from '@/lib/api/middleware'
import { CreateActivitySchema } from '@/lib/validations'
import { PaginationSchema } from '@/lib/api/types'
import { successResponse, createPaginatedResponse } from '@/lib/api/utils'
import { z } from 'zod'

// GET /api/admin/activities - List all activities
export async function GET(request: NextRequest) {
  try {
    const queryResult = getQueryParams(request, PaginationSchema.extend({
      search: z.string().optional(),
      domainId: z.string().uuid().optional(),
      isActive: z.boolean().optional(),
    }))

    if (!queryResult.success) {
      return NextResponse.json({ success: false, error: queryResult.error }, { status: 400 })
    }

    const { page = 1, limit = 20, search, domainId, isActive } = queryResult.data
    const skip = (page - 1) * limit

    const where: any = {}
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (domainId) where.domainId = domainId
    if (isActive !== undefined) where.isActive = isActive

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          domain: true,
        },
      }),
      prisma.activity.count({ where }),
    ])

    return successResponse(createPaginatedResponse(activities, total, { page, limit }))
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/admin/activities - Create activity
export async function POST(request: NextRequest) {
  try {
    const bodyResult = await getBody(request, CreateActivitySchema)
    if (!bodyResult.success) {
      return NextResponse.json({ success: false, error: bodyResult.error }, { status: 400 })
    }

    const activity = await prisma.activity.create({
      data: {
        ...bodyResult.data,
        materialsNeeded: bodyResult.data.materialsNeeded
          ? JSON.stringify(bodyResult.data.materialsNeeded)
          : null,
      },
      include: {
        domain: true,
      },
    })

    return successResponse(activity, 'Activity created successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

