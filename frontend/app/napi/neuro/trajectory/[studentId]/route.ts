/**
 * Predictive Trajectory API
 */

import { NextRequest, NextResponse } from 'next/server'
import { predictTrajectory, getTrajectorySummary } from '@/services/predictive-trajectory'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params
    const { searchParams } = new URL(request.url)
    const months = parseInt(searchParams.get('months') || '3')

    const trajectory = await predictTrajectory(studentId, months)
    const summary = await getTrajectorySummary(studentId)

    return NextResponse.json({
      success: true,
      trajectory,
      summary,
    })
  } catch (error: any) {
    console.error('Error fetching trajectory:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}

