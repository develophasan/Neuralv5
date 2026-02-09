import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { handleApiError } from '@/lib/api/errors'
import { successResponse } from '@/lib/api/utils'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { logAudit } from '@/lib/api/audit'

// GET /api/admin/classes - List all classes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const academicYear = searchParams.get('academicYear')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = { isActive: true }
    if (academicYear) where.academicYear = academicYear

    const [classes, total] = await Promise.all([
      prisma.class.findMany({
        where,
        include: {
          classTeachers: {
            include: { teacher: { select: { id: true, fullName: true } } },
          },
          _count: {
            select: {
              classStudents: { where: { isActive: true } },
            },
          },
        },
        orderBy: { name: 'asc' },
        take: limit,
        skip: offset,
      }),
      prisma.class.count({ where }),
    ])

    const classesWithCount = classes.map((c) => ({
      ...c,
      studentCount: c._count.classStudents,
    }))

    return successResponse({ classes: classesWithCount, total, limit, offset })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/admin/classes - Create new class
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, ageGroup, capacity, academicYear } = body

    if (!name || !ageGroup || !capacity || !academicYear) {
      return NextResponse.json(
        { success: false, error: 'Sınıf adı, yaş grubu, kapasite ve akademik yıl gerekli' },
        { status: 400 }
      )
    }

    const classData = await prisma.class.create({
      data: {
        name,
        ageGroup,
        capacity,
        academicYear,
        currentEnrollment: 0,
      },
    })

    // Log the action
    try {
      const session = await getServerSession(authOptions)
      if (session?.user?.id) {
        await logAudit({
          userId: session.user.id,
          action: 'create',
          entity: 'Class',
          entityId: classData.id,
          details: { name, ageGroup, capacity, academicYear },
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
