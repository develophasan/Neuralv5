// Admin: Class-Teacher Relationship Management
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { handleApiError } from '@/lib/api/errors'
import { getBody } from '@/lib/api/middleware'
import { successResponse } from '@/lib/api/utils'
import { z } from 'zod'

const AddTeacherToClassSchema = z.object({
  classId: z.string().uuid(),
  teacherId: z.string().uuid(),
  isLeadTeacher: z.boolean().default(false),
})

const RemoveTeacherFromClassSchema = z.object({
  classId: z.string().uuid(),
  teacherId: z.string().uuid(),
})

// POST /api/admin/relationships/class-teacher - Add teacher to class
export async function POST(request: NextRequest) {
  try {
    const bodyResult = await getBody(request, AddTeacherToClassSchema)
    if (!bodyResult.success) {
      return NextResponse.json({ success: false, error: bodyResult.error }, { status: 400 })
    }

    const classTeacher = await prisma.classTeacher.create({
      data: bodyResult.data,
      include: {
        class: true,
        teacher: {
          select: { id: true, fullName: true, email: true },
        },
      },
    })

    return successResponse(classTeacher, 'Teacher added to class successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/admin/relationships/class-teacher - Remove teacher from class
export async function DELETE(request: NextRequest) {
  try {
    const bodyResult = await getBody(request, RemoveTeacherFromClassSchema)
    if (!bodyResult.success) {
      return NextResponse.json({ success: false, error: bodyResult.error }, { status: 400 })
    }

    await prisma.classTeacher.deleteMany({
      where: {
        classId: bodyResult.data.classId,
        teacherId: bodyResult.data.teacherId,
      },
    })

    return successResponse(null, 'Teacher removed from class successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

