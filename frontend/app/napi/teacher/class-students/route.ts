// Teacher: Manage class students (add/remove)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { handleApiError } from '@/lib/api/errors'
import { successResponse } from '@/lib/api/utils'

// POST /napi/teacher/class-students - Add student to class
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { classId, studentId } = body

    if (!classId || !studentId) {
      return NextResponse.json(
        { success: false, error: 'classId ve studentId gerekli' },
        { status: 400 }
      )
    }

    // Check if already exists
    const existing = await prisma.classStudent.findUnique({
      where: {
        classId_studentId: { classId, studentId }
      }
    })

    if (existing) {
      // Reactivate if inactive
      if (!existing.isActive) {
        const updated = await prisma.classStudent.update({
          where: { id: existing.id },
          data: { isActive: true }
        })
        return successResponse(updated)
      }
      return NextResponse.json(
        { success: false, error: 'Ogrenci zaten bu sinifta' },
        { status: 400 }
      )
    }

    // Create new class-student relation
    const classStudent = await prisma.classStudent.create({
      data: {
        classId,
        studentId,
        isActive: true,
      }
    })

    return successResponse(classStudent)
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /napi/teacher/class-students - Remove student from class
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')
    const studentId = searchParams.get('studentId')

    if (!classId || !studentId) {
      return NextResponse.json(
        { success: false, error: 'classId ve studentId gerekli' },
        { status: 400 }
      )
    }

    // Soft delete - set isActive to false
    const classStudent = await prisma.classStudent.updateMany({
      where: { classId, studentId },
      data: { isActive: false }
    })

    return successResponse({ message: 'Ogrenci siniftan cikarildi' })
  } catch (error) {
    return handleApiError(error)
  }
}
