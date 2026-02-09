/**
 * 🔄 BACKGROUND JOB: AI Summary Generation
 * 
 * This endpoint should be called by a cron job to generate daily AI summaries
 * for all active students.
 * 
 * Schedule: Daily at 6 PM (after school day ends)
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateAllSummaries } from '@/services/ai-worker'

// Security: Only allow from cron or with secret key
const CRON_SECRET = process.env.CRON_SECRET || 'harmoni-cron-secret-2024'

export async function POST(request: NextRequest) {
  try {
    // Verify secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🤖 Starting AI summary generation...')
    const result = await generateAllSummaries()

    return NextResponse.json({
      success: true,
      message: 'AI summary generation completed',
      result,
    })
  } catch (error) {
    console.error('Error in AI summary cron:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Also allow GET for manual triggering (development)
export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 })
  }

  try {
    console.log('🤖 Starting AI summary generation (manual)...')
    const result = await generateAllSummaries()

    return NextResponse.json({
      success: true,
      message: 'AI summary generation completed',
      result,
    })
  } catch (error) {
    console.error('Error in AI summary cron:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

