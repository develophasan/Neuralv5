// Teacher: List students in teacher's classes
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { handleApiError } from '@/lib/api/errors'
import { successResponse } from '@/lib/api/utils'

// GET /api/teacher/students - List students in teacher's classes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')

    // If no teacherId, return all students (for demo)
    if (!teacherId) {
      const students = await prisma.student.findMany({
        where: { isActive: true },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          dateOfBirth: true,
          gender: true,
          photoUrl: true,
        },
        orderBy: { firstName: 'asc' },
        take: 100,
      })
      return successResponse(students)
    }

    // Get students in teacher's classes
    const teacherClasses = await prisma.classTeacher.findMany({
      where: { teacherId },
      include: {
        class: {
          include: {
            classStudents: {
              where: { isActive: true },
              include: {
                student: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    dateOfBirth: true,
                    gender: true,
                    photoUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    const students = teacherClasses.flatMap((tc) =>
      tc.class.classStudents.map((cs) => cs.student)
    )

    // Remove duplicates
    const uniqueStudents = Array.from(
      new Map(students.map((s) => [s.id, s])).values()
    )

    return successResponse(uniqueStudents)
  } catch (error) {
    return handleApiError(error)
  }
}
