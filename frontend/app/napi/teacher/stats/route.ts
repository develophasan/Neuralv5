import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { handleApiError } from '@/lib/api/errors'
import { successResponse } from '@/lib/api/utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')

    if (!teacherId) {
      return NextResponse.json({ success: false, error: 'Teacher ID required' }, { status: 400 })
    }

    // Öğretmenin sınıfları
    const teacherClasses = await prisma.classTeacher.findMany({
      where: { teacherId },
      include: {
        class: {
          include: {
            classStudents: {
              where: { isActive: true },
            },
          },
        },
      },
    })

    const totalClasses = teacherClasses.length
    const totalStudents = teacherClasses.reduce(
      (sum, tc) => sum + tc.class.classStudents.length,
      0
    )

    const studentIds = teacherClasses.flatMap((tc) =>
      tc.class.classStudents.map((cs) => cs.studentId)
    )

    // Bekleyen aktiviteler
    const pendingActivities = await prisma.activityRecommendation.count({
      where: {
        studentId: { in: studentIds },
        status: 'pending',
        recommendedTo: { in: ['teacher', 'both'] },
      },
    })

    // Bekleyen değerlendirmeler (son 7 gün içinde yapılmamış)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentAssessments = await prisma.assessment.findMany({
      where: {
        studentId: { in: studentIds },
        assessmentDate: { gte: sevenDaysAgo },
      },
      select: { studentId: true },
      distinct: ['studentId'],
    })

    const assessedStudentIds = recentAssessments.map((a) => a.studentId)
    const pendingAssessments = studentIds.filter((id) => !assessedStudentIds.includes(id)).length

    return successResponse({
      total_students: totalStudents,
      total_classes: totalClasses,
      pending_assessments: pendingAssessments,
      pending_activities: pendingActivities,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

