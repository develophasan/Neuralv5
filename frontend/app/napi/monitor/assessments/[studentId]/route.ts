import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const { studentId } = params

    const assessments = await prisma.assessment.findMany({
      where: {
        studentId,
        assessmentDate: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        scores: true,
      },
      orderBy: { assessmentDate: 'asc' },
    })

    const assessmentData = assessments.map((assess) => {
      const avgScore = assess.scores.length > 0
        ? assess.scores.reduce((sum, s) => sum + (s.percentage || (s.score ? (s.score / 5) * 100 : 0)), 0) / assess.scores.length
        : 0

      return {
        date: assess.assessmentDate,
        avgScore: Math.round(avgScore),
      }
    })

    return NextResponse.json(assessmentData)
  } catch (error) {
    console.error('Error fetching assessment history:', error)
    return NextResponse.json([], { status: 200 })
  }
}

