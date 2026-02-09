import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { handleApiError } from '@/lib/api/errors'
import { successResponse } from '@/lib/api/utils'
import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { logAudit } from '@/lib/api/audit'

// GET /api/admin/users - List all users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}
    if (role) where.role = role
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
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
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.user.count({ where }),
    ])

    return successResponse({ users, total, limit, offset })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/admin/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const body = await request.json()
    const { email, password, fullName, role, phone, avatarUrl, studentId } = body

    if (!email || !password || !fullName || !role) {
      return NextResponse.json(
        { success: false, error: 'Email, şifre, ad soyad ve rol gerekli' },
        { status: 400 }
      )
    }

    // Check if email exists
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Bu e-posta zaten kullanımda' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        role,
        phone,
        avatarUrl,
        // If parent role, connect to student
        ...(role === 'parent' && studentId ? {
          parentStudents: {
            create: {
              studentId: studentId,
              relationship: 'parent'
            }
          }
        } : {})
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        phone: true,
        createdAt: true,
      },
    })

    // Log the action
    try {
      const session = await getServerSession(authOptions)
      if (session?.user?.id) {
        await logAudit({
          userId: session.user.id,
          action: 'create',
          entity: 'User',
          entityId: user.id,
          details: { email, role, fullName, studentId },
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
