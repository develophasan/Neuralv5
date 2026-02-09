import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { handleApiError } from '@/lib/api/errors'
import { successResponse } from '@/lib/api/utils'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { logAudit } from '@/lib/api/audit'

// GET /api/admin/classes/[id] - Get single class
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const classData = await prisma.class.findUnique({
      where: { id },
      include: {
        classTeachers: {
          include: { teacher: { select: { id: true, fullName: true, email: true } } },
        },
        classStudents: {
          where: { isActive: true },
          include: { student: true },
        },
      },
    })

    if (!classData) {
      return NextResponse.json(
        { success: false, error: 'Sınıf bulunamadı' },
        { status: 404 }
      )
    }

    return successResponse(classData)
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/admin/classes/[id] - Update class
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, ageGroup, capacity, academicYear, description, isActive } = body

    const updateData: any = {}
    if (name) updateData.name = name
    if (ageGroup) updateData.ageGroup = ageGroup
    if (capacity) updateData.capacity = capacity
    if (academicYear) updateData.academicYear = academicYear
    if (description !== undefined) updateData.description = description
    if (isActive !== undefined) updateData.isActive = isActive

    const classData = await prisma.class.update({
      where: { id },
      data: updateData,
    })

    // Log the action
    try {
      const session = await getServerSession(authOptions)
      if (session?.user?.id) {
        await logAudit({
          userId: session.user.id,
          action: 'update',
          entity: 'Class',
          entityId: classData.id,
          details: { name, ageGroup, capacity, isActive },
        })
      }
    } catch (auditError) {
      console.error('Audit log failed:', auditError)
    }

    return successResponse(classData)
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/admin/classes/[id] - Delete class
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Soft delete
    await prisma.class.update({
      where: { id },
      data: { isActive: false },
    })

    // Log the action
    try {
      const session = await getServerSession(authOptions)
      if (session?.user?.id) {
        await logAudit({
          userId: session.user.id,
          action: 'delete',
          entity: 'Class',
          entityId: id,
          details: { softDelete: true },
        })
      }
    } catch (auditError) {
      console.error('Audit log failed:', auditError)
    }

    return successResponse({ deleted: true })
  } catch (error) {
    return handleApiError(error)
  }
}
