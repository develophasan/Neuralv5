import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const { studentId } = params

    const recommendations = await prisma.activityRecommendation.findMany({
      where: {
        studentId,
        recommendedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    })

    const completed = recommendations.filter((r) => r.status === 'completed').length
    const total = recommendations.length
    const recommended = recommendations.filter((r) => r.status === 'pending').length

    // Calculate average score from quick assessments
    const quickAssessments = await prisma.quickAssessment.findMany({
      where: {
        studentId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    })

    const avgScore = quickAssessments.length > 0
      ? quickAssessments.reduce((sum, q) => sum + q.score, 0) / quickAssessments.length
      : 0

    return NextResponse.json({
      completed,
      total,
      recommended,
      avgScore,
    })
  } catch (error: any) {
    console.error('Error fetching activity stats:', error)
    // If table doesn't exist, return default values
    if (error.code === 'P2021' || error.message?.includes('does not exist')) {
      return NextResponse.json({
        completed: 0,
        total: 0,
        recommended: 0,
        avgScore: 0,
      }, { status: 200 })
    }
    return NextResponse.json({
      completed: 0,
      total: 0,
      recommended: 0,
      avgScore: 0,
    }, { status: 200 })
  }
}

