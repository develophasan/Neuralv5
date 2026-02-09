// Parent: Get my children
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { handleApiError } from '@/lib/api/errors'
import { getQueryParams } from '@/lib/api/middleware'
import { successResponse } from '@/lib/api/utils'
import { z } from 'zod'

// GET /api/parent/children - Get parent's children
export async function GET(request: NextRequest) {
  try {
    // TODO: Get parent ID from auth
    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get('parentId')

    if (!parentId) {
      return NextResponse.json({ success: false, error: 'Parent ID required' }, { status: 400 })
    }

    const parentStudents = await prisma.parentStudent.findMany({
      where: { parentId },
      include: {
        student: {
          include: {
            classStudents: {
              where: { isActive: true },
              include: { class: true },
            },
            assessments: {
              take: 1,
              orderBy: { assessmentDate: 'desc' },
              include: {
                scores: {
                  include: { domain: true },
                },
              },
            },
            activityRecommendations: {
              where: { status: 'pending', recommendedTo: { in: ['parent', 'both'] } },
              include: {
                activity: true,
                domain: true,
              },
            },
          },
        },
      },
    })

    const children = parentStudents.map((ps) => ps.student)

    return successResponse(children)
  } catch (error) {
    return handleApiError(error)
  }
}

