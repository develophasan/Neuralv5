// Parent: Get child details
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { handleApiError } from '@/lib/api/errors'
import { successResponse } from '@/lib/api/utils'

// GET /api/parent/child/[id] - Get child details for parent
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Verify parent has access to this student
    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get('parentId')

    if (!parentId) {
      return NextResponse.json({ success: false, error: 'Parent ID required' }, { status: 400 })
    }

    // Verify parent-student relationship
    const relationship = await prisma.parentStudent.findFirst({
      where: {
        parentId,
        studentId: params.id,
      },
    })

    if (!relationship) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 })
    }

    const student = await prisma.student.findUnique({
      where: { id: params.id },
      include: {
        classStudents: {
          where: { isActive: true },
          include: { class: true },
        },
        assessments: {
          orderBy: { assessmentDate: 'desc' },
          include: {
            scores: {
              include: { domain: true },
            },
          },
        },
        dailyLogs: {
          take: 30,
          orderBy: { logDate: 'desc' },
          include: {
            class: true,
          },
        },
        moodTrackers: {
          take: 30,
          orderBy: { logDate: 'desc' },
        },
        activityRecommendations: {
          where: { status: 'pending', recommendedTo: { in: ['parent', 'both'] } },
          include: {
            activity: {
              include: { domain: true },
            },
            domain: true,
          },
        },
        healthRecords: {
          orderBy: { recordDate: 'desc' },
          take: 10,
        },
      },
    })

    if (!student) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 })
    }

    return successResponse(student)
  } catch (error) {
    return handleApiError(error)
  }
}

