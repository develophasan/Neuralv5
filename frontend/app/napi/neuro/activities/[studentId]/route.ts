/**
 * Activity Recommendations API
 */

import { NextRequest, NextResponse } from 'next/server'
import { recommendActivities, getRecommendationsWithRisk } from '@/services/activity-recommender'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '5')

    const data = await getRecommendationsWithRisk(studentId)

    return NextResponse.json({
      success: true,
      recommendations: data.recommendations.slice(0, limit),
      riskDomains: data.riskDomains,
      overallRisk: data.overallRisk,
    })
  } catch (error: any) {
    console.error('Error fetching activity recommendations:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}

