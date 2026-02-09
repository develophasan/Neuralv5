// Admin: Manage class-teacher assignments
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { handleApiError } from '@/lib/api/errors'
import { successResponse } from '@/lib/api/utils'

// POST /napi/admin/class-teachers - Assign teacher to class
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { classId, teacherId, isLeadTeacher = false } = body

    if (!classId || !teacherId) {
      return NextResponse.json(
        { success: false, error: 'classId ve teacherId gerekli' },
        { status: 400 }
      )
    }

    // Check if already exists
    const existing = await prisma.classTeacher.findFirst({
      where: { classId, teacherId }
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Ogretmen zaten bu sinifa atanmis' },
        { status: 400 }
      )
    }

    // Create class-teacher relation
    const classTeacher = await prisma.classTeacher.create({
      data: {
        classId,
        teacherId,
        isLeadTeacher,
      }
    })

    return successResponse(classTeacher)
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /napi/admin/class-teachers - Remove teacher from class
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')
    const teacherId = searchParams.get('teacherId')

    if (!classId || !teacherId) {
      return NextResponse.json(
        { success: false, error: 'classId ve teacherId gerekli' },
        { status: 400 }
      )
    }

    await prisma.classTeacher.deleteMany({
      where: { classId, teacherId }
    })

    return successResponse({ message: 'Ogretmen siniftan cikarildi' })
  } catch (error) {
    return handleApiError(error)
  }
}
