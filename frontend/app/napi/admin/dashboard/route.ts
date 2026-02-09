import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { successResponse, errorResponse } from '@/lib/api/utils'

export async function GET() {
  try {
    // İstatistikleri topla
    const [
      totalUsers,
      totalStudents,
      activeStudents,
      totalClasses,
      totalTeachers,
      totalParents,
      totalActivities,
      activeClasses,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.student.count(),
      prisma.student.count({ where: { isActive: true } }),
      prisma.class.count(),
      prisma.user.count({ where: { role: 'teacher' } }),
      prisma.user.count({ where: { role: 'parent' } }),
      prisma.activity.count(),
      prisma.class.count({ where: { isActive: true } }),
    ])

    // Son 30 günde oluşturulan değerlendirmeleri say
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const pendingAssessments = await prisma.assessment.count({
      where: {
        assessmentDate: {
          gte: thirtyDaysAgo,
        },
      },
    })

    const stats = {
      totalUsers,
      totalStudents,
      activeStudents,
      totalClasses,
      totalTeachers,
      totalParents,
      activeClasses,
      pendingAssessments,
      totalActivities,
    }

    return successResponse({ stats })
  } catch (error: any) {
    console.error('Error fetching admin dashboard stats:', error)
    return errorResponse('Dashboard verileri yüklenirken hata oluştu', 500)
  }
}
