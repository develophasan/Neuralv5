import { NextRequest, NextResponse } from 'next/server'
import { runJob, sendActivityRecommendationsToParents, sendDailySummariesToParents, registerJobController, cancelJob } from '@/lib/cron/cron-service'

// POST /api/cron/run - Manually trigger a cron job with streaming support
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { job, secret, action = 'start' } = body

    // Simple security check (in production, use proper authentication)
    const cronSecret = process.env.CRON_SECRET || 'harmoni-cron-secret'
    if (secret !== cronSecret) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Handle Stop Action
    if (action === 'stop') {
      const cancelled = cancelJob(job)
      return NextResponse.json({ success: true, message: cancelled ? 'Job cancelled' : 'Job not running' })
    }

    // Validate job
    if (!['activity-recommendations', 'daily-summaries'].includes(job)) {
      return NextResponse.json(
        { success: false, error: 'Unknown job' },
        { status: 400 }
      )
    }

    // Initialize Streaming Response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        // Create AbortController for this job
        const abortController = new AbortController()
        registerJobController(job, abortController)

        const sendChunk = (data: any) => {
          try {
            controller.enqueue(encoder.encode(JSON.stringify(data) + '\n'))
          } catch (e) {
            // Controller might be closed
          }
        }

        try {
          // Progress callback
          const onProgress = (log: any) => {
            sendChunk({ type: 'progress', log })
          }

          let result
          if (job === 'activity-recommendations') {
            result = await sendActivityRecommendationsToParents({ onProgress, signal: abortController.signal })
          } else {
            result = await sendDailySummariesToParents({ onProgress, signal: abortController.signal })
          }

          sendChunk({ type: 'complete', result })
        } catch (error: any) {
          sendChunk({ type: 'error', error: error.message })
        } finally {
          try {
            cancelJob(job) // Cleanup controller map
            controller.close()
          } catch (e) { }
        }
      }
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'application/json',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error: any) {
    console.error('[CRON API] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// GET /api/cron/run - Get cron job status
export async function GET() {
  return NextResponse.json({
    success: true,
    jobs: [
      {
        name: 'activity-recommendations',
        schedule: '0 9 * * * (Daily at 09:00)',
        description: 'AI aktivite \u00f6nerilerini velilere g\u00f6nderir',
      },
      {
        name: 'daily-summaries',
        schedule: '0 18 * * * (Daily at 18:00)',
        description: 'G\u00fcnl\u00fck geli\u015fim \u00f6zetlerini velilere g\u00f6nderir',
      },
    ],
    usage: {
      method: 'POST',
      body: {
        job: 'activity-recommendations | daily-summaries',
        secret: 'CRON_SECRET from .env',
      },
    },
  })
}
