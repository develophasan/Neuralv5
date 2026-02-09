import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { handleApiError } from '@/lib/api/errors'
import { successResponse } from '@/lib/api/utils'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { logAudit } from '@/lib/api/audit'

// GET /api/admin/students/[id] - Get single student
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        classStudents: {
          where: { isActive: true },
          include: { class: true },
        },
        parentStudents: {
          include: { parent: { select: { id: true, fullName: true, email: true } } },
        },
        assessments: {
          take: 5,
          orderBy: { assessmentDate: 'desc' },
        },
      },
    })

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Öğrenci bulunamadı' },
        { status: 404 }
      )
    }

    return successResponse(student)
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/admin/students/[id] - Update student (full update)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { firstName, lastName, dateOfBirth, gender, classId, healthNotes, allergies, isActive } = body

    const updateData: any = {}
    if (firstName) updateData.firstName = firstName
    if (lastName) updateData.lastName = lastName
    if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth)
    if (gender) updateData.gender = gender
    if (healthNotes !== undefined) updateData.healthNotes = healthNotes
    if (allergies) updateData.allergies = allergies
    if (isActive !== undefined) updateData.isActive = isActive

    const student = await prisma.student.update({
      where: { id },
      data: updateData,
      include: {
        classStudents: {
          where: { isActive: true },
          include: { class: true },
        },
      },
    })

    // Handle class assignment
    if (classId !== undefined) {
      // Deactivate current class
      await prisma.classStudent.updateMany({
        where: { studentId: id, isActive: true },
        data: { isActive: false },
      })

      // Assign to new class if provided
      if (classId) {
        await prisma.classStudent.create({
          data: {
            studentId: id,
            classId,
            isActive: true,
          },
        })
      }
    }

    // Log the action
    try {
      const session = await getServerSession(authOptions)
      if (session?.user?.id) {
        await logAudit({
          userId: session.user.id,
          action: 'update',
          entity: 'Student',
          entityId: student.id,
          details: { firstName, lastName, classId },
        })
      }
    } catch (auditError) {
      console.error('Audit log failed:', auditError)
    }

    return successResponse(student)
  } catch (error) {
    return handleApiError(error)
  }
}

// PATCH /api/admin/students/[id] - Partial update student
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Build update data from all possible fields
    const updateData: any = {}

    // Basic info
    if (body.firstName !== undefined) updateData.firstName = body.firstName
    if (body.lastName !== undefined) updateData.lastName = body.lastName
    if (body.dateOfBirth !== undefined) updateData.dateOfBirth = new Date(body.dateOfBirth)
    if (body.gender !== undefined) updateData.gender = body.gender
    if (body.isActive !== undefined) updateData.isActive = body.isActive

    // Identity
    if (body.tcNo !== undefined) updateData.tcNo = body.tcNo
    if (body.birthPlace !== undefined) updateData.birthPlace = body.birthPlace
    if (body.nationality !== undefined) updateData.nationality = body.nationality

    // Address
    if (body.address !== undefined) updateData.address = body.address
    if (body.city !== undefined) updateData.city = body.city
    if (body.district !== undefined) updateData.district = body.district
    if (body.postalCode !== undefined) updateData.postalCode = body.postalCode

    // Mother info
    if (body.motherName !== undefined) updateData.motherName = body.motherName
    if (body.motherPhone !== undefined) updateData.motherPhone = body.motherPhone
    if (body.motherEmail !== undefined) updateData.motherEmail = body.motherEmail
    if (body.motherJob !== undefined) updateData.motherJob = body.motherJob
    if (body.motherTcNo !== undefined) updateData.motherTcNo = body.motherTcNo

    // Father info
    if (body.fatherName !== undefined) updateData.fatherName = body.fatherName
    if (body.fatherPhone !== undefined) updateData.fatherPhone = body.fatherPhone
    if (body.fatherEmail !== undefined) updateData.fatherEmail = body.fatherEmail
    if (body.fatherJob !== undefined) updateData.fatherJob = body.fatherJob
    if (body.fatherTcNo !== undefined) updateData.fatherTcNo = body.fatherTcNo

    // Emergency contact
    if (body.emergencyContact !== undefined) updateData.emergencyContact = body.emergencyContact
    if (body.emergencyPhone !== undefined) updateData.emergencyPhone = body.emergencyPhone
    if (body.emergencyRelation !== undefined) updateData.emergencyRelation = body.emergencyRelation

    // Health info
    if (body.bloodType !== undefined) updateData.bloodType = body.bloodType
    if (body.allergies !== undefined) updateData.allergies = body.allergies
    if (body.chronicDiseases !== undefined) updateData.chronicDiseases = body.chronicDiseases
    if (body.medications !== undefined) updateData.medications = body.medications
    if (body.doctorName !== undefined) updateData.doctorName = body.doctorName
    if (body.doctorPhone !== undefined) updateData.doctorPhone = body.doctorPhone

    // Registration
    if (body.isFullRegistration !== undefined) updateData.isFullRegistration = body.isFullRegistration
    if (body.registrationNotes !== undefined) updateData.registrationNotes = body.registrationNotes

    const student = await prisma.student.update({
      where: { id },
      data: updateData,
    })

    return successResponse(student)
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/admin/students/[id] - Delete student
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const isHardDelete = searchParams.get('hard') === 'true'

    if (isHardDelete) {
      // Hard delete
      await prisma.student.delete({
        where: { id },
      })

      // Log the action
      try {
        const session = await getServerSession(authOptions)
        if (session?.user?.id) {
          await logAudit({
            userId: session.user.id,
            action: 'delete',
            entity: 'Student',
            entityId: id,
            details: { permanent: true },
          })
        }
      } catch (auditError) {
        console.error('Audit log failed:', auditError)
      }

      return successResponse({ deleted: true, permanent: true })
    }

    // Soft delete - just mark as inactive
    await prisma.student.update({
      where: { id },
      data: { isActive: false },
    })

    // Log the action
    try {
      const session = await getServerSession(authOptions)
      if (session?.user?.id) {
        await logAudit({
          userId: session.user.id,
          action: 'update',
          entity: 'Student',
          entityId: id,
          details: { isActive: false },
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
