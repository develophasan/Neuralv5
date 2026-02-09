/**
 * Population Benchmarking API
 */

import { NextRequest, NextResponse } from 'next/server'
import { compareToBenchmark } from '@/services/population-benchmarking'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params

    const comparison = await compareToBenchmark(studentId)

    return NextResponse.json({
      success: true,
      comparison,
    })
  } catch (error: any) {
    console.error('Error fetching benchmark comparison:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}

