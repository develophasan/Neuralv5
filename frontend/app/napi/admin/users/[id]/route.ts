import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { handleApiError } from '@/lib/api/errors'
import { successResponse } from '@/lib/api/utils'
import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { logAudit } from '@/lib/api/audit'

// GET /api/admin/users/[id] - Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        phone: true,
        avatarUrl: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        parentStudents: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              }
            }
          }
        }
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    return successResponse(user)
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/admin/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const { id } = await params
    const body = await request.json()
    const { email, password, fullName, role, phone, isActive, studentId } = body

    const updateData: any = {}
    if (email) updateData.email = email
    if (fullName) updateData.fullName = fullName
    if (role) updateData.role = role
    if (phone !== undefined) updateData.phone = phone
    if (isActive !== undefined) updateData.isActive = isActive
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    })

    // If parent role and studentId provided, update relationship
    if (role === 'parent' && studentId) {
      // Simple approach: delete existing relationship for this parent and create new one
      // (In a more complex system, we might want to keep multiple relationships)
      await prisma.parentStudent.deleteMany({
        where: { parentId: id }
      })

      await prisma.parentStudent.create({
        data: {
          parentId: id,
          studentId: studentId,
          relationship: 'parent'
        }
      })
    }

    // Log the action
    try {
      const session = await getServerSession(authOptions)
      if (session?.user?.id) {
        await logAudit({
          userId: session.user.id,
          action: 'update',
          entity: 'User',
          entityId: user.id,
          details: { email, role, fullName, isActive, studentId },
          ipAddress: ip,
          userAgent: userAgent
        })
      }
    } catch (auditError) {
      console.error('Audit log failed:', auditError)
    }

    return successResponse(user)
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const { id } = await params

    await prisma.user.delete({ where: { id } })

    // Log the action
    try {
      const session = await getServerSession(authOptions)
      if (session?.user?.id) {
        await logAudit({
          userId: session.user.id,
          action: 'delete',
          entity: 'User',
          entityId: id,
          ipAddress: ip,
          userAgent: userAgent
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
