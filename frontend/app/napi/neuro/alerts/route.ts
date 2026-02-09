import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// Get all alerts for a user (admin, teacher, or parent)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const role = searchParams.get('role')
    const studentId = searchParams.get('studentId')
    const resolved = searchParams.get('resolved')

    let where: any = {}

    if (studentId) {
      where.studentId = studentId
    }

    if (resolved === 'false' || resolved === 'true') {
      where.isResolved = resolved === 'true'
    }

    // If parent, only show alerts for their children
    if (role === 'parent' && userId) {
      const parentStudents = await prisma.parentStudent.findMany({
        where: { parentId: userId },
        select: { studentId: true },
      })
      where.studentId = {
        in: parentStudents.map((ps) => ps.studentId),
      }
    }

    // If teacher, only show alerts for their students
    if (role === 'teacher' && userId) {
      const teacherClasses = await prisma.classTeacher.findMany({
        where: { teacherId: userId },
        select: { classId: true },
      })
      const classStudents = await prisma.classStudent.findMany({
        where: {
          classId: { in: teacherClasses.map((tc) => tc.classId) },
          isActive: true,
        },
        select: { studentId: true },
      })
      where.studentId = {
        in: classStudents.map((cs) => cs.studentId),
      }
    }

    const alerts = await prisma.neuroAlert.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

// Create a new alert (usually by background job)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, domain, severity, message } = body

    const alert = await prisma.neuroAlert.create({
      data: {
        studentId,
        domain,
        severity,
        message,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    return NextResponse.json(alert)
  } catch (error) {
    console.error('Error creating alert:', error)
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    )
  }
}

