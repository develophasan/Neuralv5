// Teacher: Get student details
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { handleApiError } from '@/lib/api/errors'
import { successResponse } from '@/lib/api/utils'

// GET /api/teacher/student/[id] - Get student details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const student = await prisma.student.findUnique({
      where: { id: params.id },
      include: {
        classStudents: {
          include: { class: true },
        },
        parentStudents: {
          include: {
            parent: {
              select: { id: true, fullName: true, email: true, phone: true },
            },
          },
        },
        assessments: {
          orderBy: { assessmentDate: 'desc' },
          include: {
            assessor: {
              select: { fullName: true },
            },
            scores: {
              include: { domain: true },
            },
          },
        },
        dailyLogs: {
          take: 10,
          orderBy: { logDate: 'desc' },
          include: {
            class: true,
          },
        },
        moodTrackers: {
          take: 10,
          orderBy: { logDate: 'desc' },
        },
        activityRecommendations: {
          where: { status: 'pending' },
          include: {
            activity: {
              include: { domain: true },
            },
            domain: true,
          },
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

