import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { handleApiError } from '@/lib/api/errors'
import { successResponse } from '@/lib/api/utils'

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

    // Bekleyen aktivite önerilerini yükle
    const whereClause: any = {
      studentId: { in: studentIds },
      status: 'pending',
      recommendedTo: { in: ['teacher', 'both'] },
    }

    if (studentId) {
      whereClause.studentId = studentId
    }

    const recommendations = await prisma.activityRecommendation.findMany({
      where: whereClause,
      include: {
        activity: {
          include: {
            domain: true,
          },
        },
        student: true,
        domain: true,
      },
      orderBy: {
        recommendedAt: 'desc',
      },
    })

    const activities = recommendations.map((rec) => ({
      id: rec.id,
      activity: {
        id: rec.activity.id,
        title: rec.activity.title,
        description: rec.activity.description,
        domain: rec.activity.domain,
      },
      student: {
        id: rec.student.id,
        firstName: rec.student.firstName,
        lastName: rec.student.lastName,
      },
      domain: rec.domain,
      reason: rec.reason,
      priority:
        rec.currentScore && rec.thresholdScore
          ? rec.currentScore < rec.thresholdScore - 1
            ? 'high'
            : 'medium'
          : 'low',
    }))

    return successResponse(activities)
  } catch (error) {
    return handleApiError(error)
  }
}

