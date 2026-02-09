// Teacher: Get class details with students
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { handleApiError } from '@/lib/api/errors'
import { successResponse } from '@/lib/api/utils'

// GET /api/teacher/class/[id] - Get class details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const classData = await prisma.class.findUnique({
      where: { id: params.id },
      include: {
        classTeachers: {
          include: {
            teacher: {
              select: { id: true, fullName: true, email: true },
            },
          },
        },
        classStudents: {
          where: { isActive: true },
          include: {
            student: {
              include: {
                parentStudents: {
                  include: {
                    parent: {
                      select: { id: true, fullName: true, email: true, phone: true },
                    },
                  },
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
              },
            },
          },
        },
      },
    })

    if (!classData) {
      return NextResponse.json({ success: false, error: 'Class not found' }, { status: 404 })
    }

    return successResponse(classData)
  } catch (error) {
    return handleApiError(error)
  }
}

