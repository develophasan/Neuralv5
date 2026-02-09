/**
 * 🔄 BACKGROUND JOB: Neuro Engine Processing
 * 
 * This endpoint should be called by a cron job (e.g., Vercel Cron, Netlify Scheduled Functions)
 * to process all students: update profiles, calculate trends, detect risks
 * 
 * Schedule: Daily at 2 AM
 */

import { NextRequest, NextResponse } from 'next/server'
import { processAllStudents } from '@/services/neuro-engine'

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

    console.log('🧠 Starting Neuro Engine processing...')
    const result = await processAllStudents()

    return NextResponse.json({
      success: true,
      message: 'Neuro Engine processing completed',
      result,
    })
  } catch (error) {
    console.error('Error in Neuro Engine cron:', error)
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
    console.log('🧠 Starting Neuro Engine processing (manual)...')
    const result = await processAllStudents()

    return NextResponse.json({
      success: true,
      message: 'Neuro Engine processing completed',
      result,
    })
  } catch (error) {
    console.error('Error in Neuro Engine cron:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

