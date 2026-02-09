import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// Get development trends for a student
export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const { studentId } = params

    const trends = await prisma.childDevelopmentTrend.findMany({
      where: { studentId },
      orderBy: { periodStart: 'desc' },
      take: 20,
    })

    // Group by domain
    const trendsByDomain: Record<string, typeof trends> = {}
    trends.forEach((trend) => {
      if (!trendsByDomain[trend.domain]) {
        trendsByDomain[trend.domain] = []
      }
      trendsByDomain[trend.domain].push(trend)
    })

    return NextResponse.json({
      trends,
      byDomain: trendsByDomain,
    })
  } catch (error) {
    console.error('Error fetching trends:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trends' },
      { status: 500 }
    )
  }
}

