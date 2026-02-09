/**
 * 🔄 BACKGROUND JOB: Z-Score Calculation
 * 
 * Calculate Z-profiles for all active students
 * Schedule: Weekly on Monday at 3 AM
 */

import { NextRequest, NextResponse } from 'next/server'
import { processAllZProfiles, initializeAgeNorms } from '@/services/z-score-engine'

const CRON_SECRET = process.env.CRON_SECRET || 'harmoni-cron-secret-2024'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('📊 Starting Z-score calculation...')
    
    // Initialize age norms if needed
    await initializeAgeNorms()
    
    const result = await processAllZProfiles()

    return NextResponse.json({
      success: true,
      message: 'Z-score calculation completed',
      result,
    })
  } catch (error) {
    console.error('Error in Z-score cron:', error)
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
    console.log('📊 Starting Z-score calculation (manual)...')
    await initializeAgeNorms()
    const result = await processAllZProfiles()

    return NextResponse.json({
      success: true,
      message: 'Z-score calculation completed',
      result,
    })
  } catch (error) {
    console.error('Error in Z-score cron:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

