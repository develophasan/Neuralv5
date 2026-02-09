import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// Revenue Dashboard - Analytics only (no payments)
export async function GET(request: NextRequest) {
  try {
    // Get all students
    const students = await prisma.student.findMany({
      where: { isActive: true },
      include: {
        classStudents: {
          where: { isActive: true },
          include: {
            class: true,
          },
        },
      },
    })

    const totalStudents = students.length

    // Calculate retention (students enrolled more than 3 months ago still active)
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

    const oldStudents = students.filter(
      (s) => new Date(s.enrollmentDate) < threeMonthsAgo
    )
    const retentionRate =
      oldStudents.length > 0
        ? (oldStudents.filter((s) => s.isActive).length / oldStudents.length) *
          100
        : 100

    // Calculate churn (students who left in last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const inactiveStudents = await prisma.student.findMany({
      where: {
        isActive: false,
        updatedAt: {
          gte: thirtyDaysAgo,
        },
      },
    })

    const churnRate =
      totalStudents > 0 ? (inactiveStudents.length / totalStudents) * 100 : 0

    // Monthly growth (students enrolled in last 30 days)
    const newStudents = students.filter(
      (s) => new Date(s.enrollmentDate) >= thirtyDaysAgo
    ).length

    const growthRate =
      totalStudents > 0 ? (newStudents / totalStudents) * 100 : 0

    // Average stay duration
    const activeStudents = students.filter((s) => s.isActive)
    const avgStayDuration =
      activeStudents.length > 0
        ? activeStudents.reduce((sum, s) => {
            const days =
              (new Date().getTime() - new Date(s.enrollmentDate).getTime()) /
              (1000 * 60 * 60 * 24)
            return sum + days
          }, 0) / activeStudents.length
        : 0

    // Monthly trends (last 6 months)
    const monthlyTrends = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date()
      monthStart.setMonth(monthStart.getMonth() - i)
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)

      const monthEnd = new Date(monthStart)
      monthEnd.setMonth(monthEnd.getMonth() + 1)

      const enrolledInMonth = students.filter(
        (s) =>
          new Date(s.enrollmentDate) >= monthStart &&
          new Date(s.enrollmentDate) < monthEnd
      ).length

      monthlyTrends.push({
        month: monthStart.toLocaleDateString('tr-TR', {
          month: 'short',
          year: 'numeric',
        }),
        count: enrolledInMonth,
      })
    }

    return NextResponse.json({
      metrics: {
        totalStudents,
        retentionRate: Math.round(retentionRate * 10) / 10,
        churnRate: Math.round(churnRate * 10) / 10,
        growthRate: Math.round(growthRate * 10) / 10,
        avgStayDuration: Math.round(avgStayDuration),
        newStudentsLast30Days: newStudents,
      },
      monthlyTrends,
    })
  } catch (error) {
    console.error('Error fetching revenue data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch revenue data' },
      { status: 500 }
    )
  }
}

