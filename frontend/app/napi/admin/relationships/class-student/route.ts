// Admin: Class-Student Relationship Management
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { handleApiError } from '@/lib/api/errors'
import { getBody } from '@/lib/api/middleware'
import { successResponse } from '@/lib/api/utils'
import { z } from 'zod'

const AddStudentToClassSchema = z.object({
  classId: z.string().uuid(),
  studentId: z.string().uuid(),
  enrollmentDate: z.string().or(z.date()).optional(),
})

const RemoveStudentFromClassSchema = z.object({
  classId: z.string().uuid(),
  studentId: z.string().uuid(),
})

// POST /api/admin/relationships/class-student - Add student to class
export async function POST(request: NextRequest) {
  try {
    const bodyResult = await getBody(request, AddStudentToClassSchema)
    if (!bodyResult.success) {
      return NextResponse.json({ success: false, error: bodyResult.error }, { status: 400 })
    }

    const { classId, studentId, enrollmentDate } = bodyResult.data

    const classStudent = await prisma.classStudent.create({
      data: {
        classId,
        studentId,
        enrollmentDate: enrollmentDate ? new Date(enrollmentDate) : new Date(),
        isActive: true,
      },
      include: {
        class: true,
        student: true,
      },
    })

    // Update class enrollment count
    const count = await prisma.classStudent.count({
      where: { classId, isActive: true },
    })
    await prisma.class.update({
      where: { id: classId },
      data: { currentEnrollment: count },
    })

    return successResponse(classStudent, 'Student added to class successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/admin/relationships/class-student - Remove student from class
export async function DELETE(request: NextRequest) {
  try {
    const bodyResult = await getBody(request, RemoveStudentFromClassSchema)
    if (!bodyResult.success) {
      return NextResponse.json({ success: false, error: bodyResult.error }, { status: 400 })
    }

    const { classId, studentId } = bodyResult.data

    await prisma.classStudent.deleteMany({
      where: { classId, studentId },
    })

    // Update class enrollment count
    const count = await prisma.classStudent.count({
      where: { classId, isActive: true },
    })
    await prisma.class.update({
      where: { id: classId },
      data: { currentEnrollment: count },
    })

    return successResponse(null, 'Student removed from class successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

