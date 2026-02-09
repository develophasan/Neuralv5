import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { handleApiError } from '@/lib/api/errors'
import { successResponse } from '@/lib/api/utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')

    if (!teacherId) {
      return NextResponse.json({ success: false, error: 'Teacher ID required' }, { status: 400 })
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
      id: tc.class.id,
      name: tc.class.name,
      ageGroup: tc.class.ageGroup,
      capacity: tc.class.capacity,
      academicYear: tc.class.academicYear,
      isActive: tc.class.isActive,
      student_count: tc.class.classStudents.length,
      students: tc.class.classStudents.map((cs) => cs.student),
    }))

    return successResponse(classes)
  } catch (error) {
    return handleApiError(error)
  }
}

