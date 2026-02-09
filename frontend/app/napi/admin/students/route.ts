import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { handleApiError } from '@/lib/api/errors'
import { successResponse } from '@/lib/api/utils'

// GET /api/admin/students - List all students
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}
    if (classId) {
      where.classStudents = { some: { classId, isActive: true } }
    }
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          classStudents: {
            where: { isActive: true },
            include: { class: true },
          },
          parentStudents: {
            include: { parent: { select: { id: true, fullName: true, email: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.student.count({ where }),
    ])

    return successResponse({ students, total, limit, offset })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/admin/students - Create new student
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, dateOfBirth, gender, classId, photoUrl } = body

    if (!firstName || !lastName || !dateOfBirth || !gender) {
      return NextResponse.json(
        { success: false, error: 'Ad, soyad, doğum tarihi ve cinsiyet gerekli' },
        { status: 400 }
      )
    }

    const student = await prisma.student.create({
      data: {
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        photoUrl: photoUrl || null,
        classStudents: classId ? {
          create: { classId, isActive: true }
        } : undefined,
      },
      include: {
        classStudents: {
          include: { class: true },
        },
      },
    })

    return successResponse(student)
  } catch (error) {
    return handleApiError(error)
  }
}
