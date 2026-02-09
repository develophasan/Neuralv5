// Teacher: List and create assessments
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { handleApiError } from '@/lib/api/errors'
import { getBody } from '@/lib/api/middleware'
import { CreateAssessmentWithScoresSchema } from '@/lib/validations'
import { successResponse } from '@/lib/api/utils'

// GET /api/teacher/assessments - List assessments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')
    const studentId = searchParams.get('studentId')

    if (!teacherId) {
      return NextResponse.json({ success: false, error: 'Teacher ID required' }, { status: 400 })
    }

    // Öğretmenin sınıflarındaki öğrencileri bul
    const teacherClasses = await prisma.classTeacher.findMany({
      where: { teacherId },
      include: {
        class: {
          include: {
            classStudents: {
              where: { isActive: true },
              select: { studentId: true },
            },
          },
        },
      },
    })

    const studentIds = teacherClasses.flatMap((tc) =>
      tc.class.classStudents.map((cs) => cs.studentId)
    )

    if (studentIds.length === 0) {
      return successResponse([])
    }

    const whereClause: any = {
      studentId: { in: studentIds },
    }

    if (studentId) {
      whereClause.studentId = studentId
    }

    const assessments = await prisma.assessment.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        assessor: {
          select: { id: true, fullName: true },
        },
        scores: {
          include: { domain: true },
        },
      },
      orderBy: {
        assessmentDate: 'desc',
      },
    })

    return successResponse(assessments)
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/teacher/assessments - Create assessment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, scores, notes, assessedBy } = body

    if (!studentId || !scores || scores.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Student ID and scores are required' },
        { status: 400 }
      )
    }

    // Get a teacher ID if not provided
    let teacherId = assessedBy
    if (!teacherId) {
      const teacher = await prisma.user.findFirst({
        where: { role: 'teacher' },
        select: { id: true },
      })
      teacherId = teacher?.id
    }

    if (!teacherId) {
      return NextResponse.json(
        { success: false, error: 'No teacher found to assign assessment' },
        { status: 400 }
      )
    }

    const assessment = await prisma.assessment.create({
      data: {
        studentId,
        assessedBy: teacherId,
        assessmentDate: new Date(),
        notes: notes || null,
        scores: {
          create: scores.map((s: any) => ({
            domainId: s.domainId,
            score: s.score,
          })),
        },
      },
      include: {
        student: true,
        scores: {
          include: { domain: true },
        },
      },
    })

    return successResponse(assessment, 'Assessment created successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

