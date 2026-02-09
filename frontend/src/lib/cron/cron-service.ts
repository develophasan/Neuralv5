// Cron Job Service - Automatic AI Activity Recommendations
import * as cron from 'node-cron'
import { prisma } from '@/lib/db/prisma'
import { generateActivityRecommendations, generateDevelopmentSummary } from '@/lib/ai/gemini-service'

// Types for detailed logging
export interface JobLog {
  student: string
  parent: string
  status: 'success' | 'skipped' | 'error'
  message: string
}

export interface CronJobResult {
  success: boolean
  sentCount: number
  logs: JobLog[]
  error?: any
}

export interface JobOptions {
  onProgress?: (log: JobLog) => void
  signal?: AbortSignal
}

// Store scheduled jobs and active controllers
const scheduledJobs: Map<string, cron.ScheduledTask> = new Map()
const jobControllers: Map<string, AbortController> = new Map()

// Register a controller for a job
export function registerJobController(jobId: string, controller: AbortController) {
  jobControllers.set(jobId, controller)
}

// Cancel a running job
export function cancelJob(jobId: string) {
  const controller = jobControllers.get(jobId)
  if (controller) {
    controller.abort()
    jobControllers.delete(jobId)
    console.log(`[CRON] Job ${jobId} cancelled.`)
    return true
  }
  return false
}

// Send activity recommendations to parents
export async function sendActivityRecommendationsToParents(options?: JobOptions): Promise<CronJobResult> {
  console.log('[CRON] Starting AI activity recommendations job...')
  const logs: JobLog[] = []
  let sentCount = 0

  try {
    // Get all parent-student relationships
    const parentStudents = await prisma.parentStudent.findMany({
      include: {
        parent: true,
        student: {
          include: {
            assessments: {
              take: 5,
              orderBy: { assessmentDate: 'desc' },
              include: {
                scores: {
                  include: { domain: true },
                },
              },
            },
          },
        },
      },
    })

    for (const ps of parentStudents) {
      // Check for cancellation
      if (options?.signal?.aborted) {
        console.log('[CRON] Job aborted by user.')
        break
      }

      const { parent, student } = ps

      const logEntry: JobLog = {
        student: student?.firstName || 'Unknown',
        parent: parent?.email || 'Unknown',
        status: 'skipped',
        message: ''
      }

      if (!parent || !student) {
        logEntry.message = 'Parent or Student data missing'
        logs.push(logEntry)
        options?.onProgress?.(logEntry)
        continue
      }

      // Update log entry with real names
      logEntry.student = `${student.firstName} ${student.lastName}`
      logEntry.parent = parent.email

      // Calculate age
      const birthDate = new Date(student.dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()

      // Find weak domains (score < 3)
      const weakDomains: string[] = []
      const lastAssessment = student.assessments?.[0]

      if (lastAssessment?.scores) {
        lastAssessment.scores.forEach((score: any) => {
          if (score.score && score.score < 3) {
            weakDomains.push(score.domain?.nameTr || 'Genel')
          }
        })
      }

      // Skip if no weak domains
      if (weakDomains.length === 0) {
        logEntry.message = 'No weak domains found'
        logs.push(logEntry)
        options?.onProgress?.(logEntry)
        continue
      }

      try {
        // Generate AI recommendations
        const recommendations = await generateActivityRecommendations(
          {
            firstName: student.firstName,
            lastName: student.lastName,
            age,
            assessments: student.assessments,
          },
          weakDomains
        )

        if (recommendations && recommendations.length > 0) {
          // Create notification for parent
          const activityNames = recommendations.slice(0, 2).map((r: any) => r.name).join(', ')

          await prisma.notification.create({
            data: {
              recipientId: parent.id,
              studentId: student.id,
              type: 'activity',
              senderType: 'ai',
              title: `${student.firstName} için Aktivite Önerisi`,
              message: `${student.firstName}'in gelişimi için önerilen aktiviteler: ${activityNames}. Detaylar için tıklayın.`,
              actionUrl: `/parent/children/${student.id}`,
              metadata: JSON.stringify({
                weakDomains,
                recommendations: recommendations.slice(0, 3),
              }),
            },
          })

          sentCount++
          logEntry.status = 'success'
          logEntry.message = `Sent: ${activityNames}`
          console.log(`[CRON] Sent recommendation to ${parent.email} for ${student.firstName}`)
        } else {
          logEntry.message = 'AI returned no recommendations'
        }
      } catch (aiError: any) {
        console.error(`[CRON] AI error for ${student.firstName}:`, aiError)
        logEntry.status = 'error'
        logEntry.message = `AI Error: ${aiError.message || aiError}`
      }

      logs.push(logEntry)
      options?.onProgress?.(logEntry)

      // Rate limiting - wait between API calls
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log(`[CRON] Completed! Sent ${sentCount} notifications.`)
    return { success: true, sentCount, logs }
  } catch (error: any) {
    console.error('[CRON] Error in activity recommendations job:', error)
    return { success: false, sentCount: 0, logs: [], error: error.message || error }
  }
}

// Send daily development summaries to parents
export async function sendDailySummariesToParents(options?: JobOptions): Promise<CronJobResult> {
  console.log('[CRON] Starting daily summaries job...')
  const logs: JobLog[] = []
  let sentCount = 0

  try {
    const parentStudents = await prisma.parentStudent.findMany({
      include: {
        parent: true,
        student: {
          include: {
            assessments: {
              take: 5,
              orderBy: { assessmentDate: 'desc' },
              include: {
                scores: { include: { domain: true } },
              },
            },
            neuroProfile: true,
          },
        },
      },
    })

    for (const ps of parentStudents) {
      if (options?.signal?.aborted) {
        console.log('[CRON] Daily summaries job aborted.')
        break
      }

      const { parent, student } = ps
      const logEntry: JobLog = {
        student: student?.firstName || 'Unknown',
        parent: parent?.email || 'Unknown',
        status: 'skipped',
        message: ''
      }

      if (!parent || !student) {
        logEntry.message = 'Data missing'
        logs.push(logEntry)
        options?.onProgress?.(logEntry)
        continue
      }

      logEntry.student = `${student.firstName} ${student.lastName}`
      logEntry.parent = parent.email

      const birthDate = new Date(student.dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()

      try {
        const summary = await generateDevelopmentSummary({
          firstName: student.firstName,
          lastName: student.lastName,
          age,
          assessments: student.assessments,
          neuroProfile: student.neuroProfile,
        })

        if (summary) {
          await prisma.notification.create({
            data: {
              recipientId: parent.id,
              studentId: student.id,
              type: 'ai_summary',
              senderType: 'ai',
              title: `${student.firstName}'in Günlük Gelişim Özeti`,
              message: summary.summary,
              actionUrl: `/parent/children/${student.id}`,
              metadata: JSON.stringify(summary),
            },
          })
          sentCount++
          logEntry.status = 'success'
          logEntry.message = 'Summary sent'
        } else {
          logEntry.status = 'skipped'
          logEntry.message = 'No summary generated'
        }
      } catch (aiError: any) {
        console.error(`[CRON] AI summary error for ${student.firstName}:`, aiError)
        logEntry.status = 'error'
        logEntry.message = `Error: ${aiError.message || aiError}`
      }

      logs.push(logEntry)
      options?.onProgress?.(logEntry)

      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log(`[CRON] Daily summaries complete! Sent ${sentCount} notifications.`)
    return { success: true, sentCount, logs }
  } catch (error: any) {
    console.error('[CRON] Error in daily summaries job:', error)
    return { success: false, sentCount: 0, logs: [], error: error.message || error }
  }
}

// Initialize cron jobs
export function initCronJobs() {
  // Activity recommendations - Every day at 9:00 AM
  const activityJob = cron.schedule('0 9 * * *', () => {
    sendActivityRecommendationsToParents()
  }, {
    timezone: 'Europe/Istanbul'
  })
  scheduledJobs.set('activity-recommendations', activityJob)

  // Daily summaries - Every day at 6:00 PM
  const summaryJob = cron.schedule('0 18 * * *', () => {
    sendDailySummariesToParents()
  }, {
    timezone: 'Europe/Istanbul'
  })
  scheduledJobs.set('daily-summaries', summaryJob)

  console.log('[CRON] Cron jobs initialized:')
  console.log('  - Activity recommendations: Daily at 09:00')
  console.log('  - Daily summaries: Daily at 18:00')
}

// Stop all cron jobs
export function stopCronJobs() {
  scheduledJobs.forEach((job, name) => {
    job.stop()
    console.log(`[CRON] Stopped job: ${name}`)
  })
  scheduledJobs.clear()
}

// Run a job manually
export async function runJob(jobName: 'activity-recommendations' | 'daily-summaries') {
  switch (jobName) {
    case 'activity-recommendations':
      return await sendActivityRecommendationsToParents()
    case 'daily-summaries':
      return await sendDailySummariesToParents()
    default:
      return { success: false, sentCount: 0, logs: [], error: 'Unknown job' }
  }
}
