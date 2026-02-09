// Admin: Assessments CRUD
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { handleApiError } from '@/lib/api/errors'
import { getQueryParams, getBody } from '@/lib/api/middleware'
import { CreateAssessmentWithScoresSchema } from '@/lib/validations'
import { PaginationSchema } from '@/lib/api/types'
import { successResponse, createPaginatedResponse } from '@/lib/api/utils'
import { z } from 'zod'

// GET /api/admin/assessments - List all assessments
export async function GET(request: NextRequest) {
  try {
    const queryResult = getQueryParams(request, PaginationSchema.extend({
      studentId: z.string().uuid().optional(),
      assessedBy: z.string().uuid().optional(),
      classId: z.string().optional(),
    }).passthrough())

    if (!queryResult.success) {
      return NextResponse.json({ success: false, error: queryResult.error }, { status: 400 })
    }

    const { page = 1, limit = 20, studentId, assessedBy, classId } = queryResult.data
    const skip = (page - 1) * limit

    const where: any = {}
    if (studentId) where.studentId = studentId
    if (assessedBy) where.assessedBy = assessedBy
    if (classId) {
      where.student = {
        classStudents: {
          some: {
            classId: classId,
            isActive: true
          }
        }
      }
    }

    const [assessments, total] = await Promise.all([
      prisma.assessment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { assessmentDate: 'desc' },
        include: {
          student: true,
          assessor: {
            select: { id: true, fullName: true, email: true },
          },
          scores: {
            include: { domain: true },
          },
        },
      }),
      prisma.assessment.count({ where }),
    ])

    return successResponse(createPaginatedResponse(assessments, total, { page, limit }))
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/admin/assessments - Create assessment with scores
export async function POST(request: NextRequest) {
  try {
    const bodyResult = await getBody(request, CreateAssessmentWithScoresSchema)
    if (!bodyResult.success) {
      return NextResponse.json({ success: false, error: bodyResult.error }, { status: 400 })
    }

    const { scores, ...assessmentData } = bodyResult.data

    const assessment = await prisma.assessment.create({
      data: {
        ...assessmentData,
        assessmentDate: assessmentData.assessmentDate
          ? new Date(assessmentData.assessmentDate)
          : new Date(),
        scores: {
          create: scores,
        },
      },
      include: {
        student: true,
        assessor: {
          select: { id: true, fullName: true, email: true },
        },
        scores: {
          include: { domain: true },
        },
      },
    })

    return successResponse(assessment, 'Assessment created successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

