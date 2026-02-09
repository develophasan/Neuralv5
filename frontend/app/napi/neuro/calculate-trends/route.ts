import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// Background job to calculate trends - should be called weekly via cron
export async function POST(request: NextRequest) {
  try {
    const students = await prisma.student.findMany({
      where: { isActive: true },
    })

    const domainCodes = [
      'executive_functions',
      'language_communication',
      'social_emotional',
      'gross_motor',
      'fine_motor',
      'logical_numerical',
      'creative_expression',
      'spatial_awareness',
      'discovery_world',
      'self_help',
    ]

    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    const createdTrends = []

    for (const student of students) {
      for (const domainCode of domainCodes) {
        // Get assessments from last 2 weeks
        const recentAssessments = await prisma.assessment.findMany({
          where: {
            studentId: student.id,
            assessmentDate: {
              gte: twoWeeksAgo,
            },
          },
          include: {
            scores: {
              where: {
                domain: { code: domainCode },
              },
            },
          },
        })

        if (recentAssessments.length >= 2) {
          // Calculate average scores for each week
          const week1Scores = recentAssessments
            .filter((a) => a.assessmentDate >= weekAgo)
            .flatMap((a) => a.scores)
            .map((s) => s.percentage ?? (s.score ? (s.score / 5) * 100 : 0))

          const week2Scores = recentAssessments
            .filter((a) => a.assessmentDate < weekAgo && a.assessmentDate >= twoWeeksAgo)
            .flatMap((a) => a.scores)
            .map((s) => s.percentage ?? (s.score ? (s.score / 5) * 100 : 0))

          if (week1Scores.length > 0 && week2Scores.length > 0) {
            const week1Avg = week1Scores.reduce((a, b) => a + b, 0) / week1Scores.length
            const week2Avg = week2Scores.reduce((a, b) => a + b, 0) / week2Scores.length

            const delta = week1Avg - week2Avg

            // Check if trend already exists for this period
            const existingTrend = await prisma.childDevelopmentTrend.findFirst({
              where: {
                studentId: student.id,
                domain: domainCode,
                periodStart: twoWeeksAgo,
              },
            })

            if (!existingTrend) {
              const trend = await prisma.childDevelopmentTrend.create({
                data: {
                  studentId: student.id,
                  domain: domainCode,
                  delta: Math.round(delta * 10) / 10,
                  periodStart: twoWeeksAgo,
                  periodEnd: weekAgo,
                },
              })

              createdTrends.push(trend)
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      trendsCreated: createdTrends.length,
      trends: createdTrends,
    })
  } catch (error) {
    console.error('Error calculating trends:', error)
    return NextResponse.json(
      { error: 'Failed to calculate trends' },
      { status: 500 }
    )
  }
}

