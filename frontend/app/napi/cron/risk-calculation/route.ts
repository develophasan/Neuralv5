/**
 * 🔄 BACKGROUND JOB: Risk Calculation
 * 
 * Calculate risk profiles for all active students
 * Schedule: Daily at 3 AM (after Z-score calculation)
 */

import { NextRequest, NextResponse } from 'next/server'
import { processAllRiskProfiles } from '@/services/risk-engine'

const CRON_SECRET = process.env.CRON_SECRET || 'harmoni-cron-secret-2024'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('⚠️ Starting risk calculation...')
    const result = await processAllRiskProfiles()

    return NextResponse.json({
      success: true,
      message: 'Risk calculation completed',
      result,
    })
  } catch (error) {
    console.error('Error in risk calculation cron:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 })
  }

  try {
    console.log('⚠️ Starting risk calculation (manual)...')
    const result = await processAllRiskProfiles()

    return NextResponse.json({
      success: true,
      message: 'Risk calculation completed',
      result,
    })
  } catch (error) {
    console.error('Error in risk calculation cron:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

