import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const { studentId } = params

    // Get development trends from last 30 days
    const trends = await prisma.childDevelopmentTrend.findMany({
      where: {
        studentId,
        periodStart: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { periodStart: 'asc' },
    })

    // If no trends, try to calculate from assessments
    if (trends.length === 0) {
      const assessments = await prisma.assessment.findMany({
        where: {
          studentId,
          assessmentDate: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        include: {
          scores: {
            include: { domain: true },
          },
        },
        orderBy: { assessmentDate: 'asc' },
      })

      const trendData = assessments.map((assess) => {
        const scores = assess.scores.reduce((acc: any, score) => {
          const domainCode = score.domain.code
          const value = score.percentage || (score.score ? (score.score / 5) * 100 : 0)
          acc[domainCode] = value
          return acc
        }, {})

        return {
          date: assess.assessmentDate,
          executiveScore: scores.executive_functions || 0,
          languageScore: scores.language || 0,
          emotionalScore: scores.social_emotional || 0,
          grossMotorScore: scores.gross_motor || 0,
          fineMotorScore: scores.fine_motor || 0,
        }
      })

      return NextResponse.json(trendData)
    }

    // Group trends by domain and date
    const trendMap: { [key: string]: any } = {}
    trends.forEach((t) => {
      const dateKey = t.periodStart.toISOString().split('T')[0]
      if (!trendMap[dateKey]) {
        trendMap[dateKey] = {
          date: t.periodStart,
          executiveScore: 50,
          languageScore: 50,
          emotionalScore: 50,
          grossMotorScore: 50,
          fineMotorScore: 50,
        }
      }
      const score = 50 + (t.delta * 10)
      if (t.domain === 'executive_functions') trendMap[dateKey].executiveScore = score
      else if (t.domain === 'language') trendMap[dateKey].languageScore = score
      else if (t.domain === 'social_emotional') trendMap[dateKey].emotionalScore = score
      else if (t.domain === 'gross_motor') trendMap[dateKey].grossMotorScore = score
      else if (t.domain === 'fine_motor') trendMap[dateKey].fineMotorScore = score
    })
    
    const trendData = Object.values(trendMap).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    return NextResponse.json(trendData)
  } catch (error: any) {
    console.error('Error fetching development trends:', error)
    // If table doesn't exist, return empty array
    if (error.code === 'P2021' || error.message?.includes('does not exist')) {
      return NextResponse.json([])
    }
    return NextResponse.json([], { status: 200 })
  }
}

