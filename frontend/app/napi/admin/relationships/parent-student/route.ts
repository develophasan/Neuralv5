// Admin: Parent-Student Relationship Management
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { handleApiError } from '@/lib/api/errors'
import { getBody } from '@/lib/api/middleware'
import { successResponse } from '@/lib/api/utils'
import { z } from 'zod'

const AddParentToStudentSchema = z.object({
  parentId: z.string().uuid(),
  studentId: z.string().uuid(),
  relationship: z.string().default('parent'),
})

const RemoveParentFromStudentSchema = z.object({
  parentId: z.string().uuid(),
  studentId: z.string().uuid(),
})

// POST /api/admin/relationships/parent-student - Add parent to student
export async function POST(request: NextRequest) {
  try {
    const bodyResult = await getBody(request, AddParentToStudentSchema)
    if (!bodyResult.success) {
      return NextResponse.json({ success: false, error: bodyResult.error }, { status: 400 })
    }

    const parentStudent = await prisma.parentStudent.create({
      data: bodyResult.data,
      include: {
        parent: {
          select: { id: true, fullName: true, email: true },
        },
        student: true,
      },
    })

    return successResponse(parentStudent, 'Parent added to student successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/admin/relationships/parent-student - Remove parent from student
export async function DELETE(request: NextRequest) {
  try {
    const bodyResult = await getBody(request, RemoveParentFromStudentSchema)
    if (!bodyResult.success) {
      return NextResponse.json({ success: false, error: bodyResult.error }, { status: 400 })
    }

    await prisma.parentStudent.deleteMany({
      where: {
        parentId: bodyResult.data.parentId,
        studentId: bodyResult.data.studentId,
      },
    })

    return successResponse(null, 'Parent removed from student successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

