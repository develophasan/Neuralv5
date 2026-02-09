// Cron Job Service - Automatic AI Activity Recommendations
import * as cron from 'node-cron'
import { prisma } from '@/lib/db/prisma'
import { generateActivityRecommendations, generateDevelopmentSummary, selectBestActivity } from '@/lib/ai/gemini-service'

// Types for detailed logging
export interface JobLog {
  student: string
  parent: string
  status: 'success' | 'skipped' | 'error' | 'sent'
  message: string
  type?: string
  timestamp?: Date
  studentId?: string // Added to match usage
}

export interface CronJobResult {
  success: boolean
  sentCount: number
  logs: JobLog[]
  error?: any
  message?: string // Added to match usage
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
      // Initial check for missing data
      if (!parent || !student) {
        logs.push({
          student: student?.firstName || 'Unknown', // Added to satisfy interface
          studentId: student?.id || 'Unknown',
          parent: parent?.email || 'Unknown',
          status: 'skipped',
          message: 'Parent or Student data missing',
          type: 'activity',
          timestamp: new Date()
        })
        options?.onProgress?.(logs[logs.length - 1])
        continue
      }

      // Calculate age
      const birthDate = new Date(student.dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()

      // Process single student
      const result = await processStudentActivityRecommendation(student, parent, age, logs, options)
      if (result) sentCount++

      // Rate limiting - wait between API calls
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log(`[CRON] Completed! Sent ${sentCount} notifications.`)
    return { success: true, sentCount, logs, message: `Sent ${sentCount} activity recommendations` }
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

// Process single student activity recommendation
export async function processStudentActivityRecommendation(
  student: any,
  parent: any,
  age: number,
  logs: JobLog[],
  options?: JobOptions
): Promise<boolean> {
  const logEntry: JobLog = {
    student: student.firstName,
    parent: parent.email,
    status: 'skipped',
    message: ''
  }

  // Find weak domains (score < 3)
  // Store full domain objects to query DB
  const weakDomainIds: string[] = []
  const weakDomainNames: string[] = []
  const lastAssessment = student.assessments?.[0]

  if (lastAssessment?.scores) {
    lastAssessment.scores.forEach((score: any) => {
      if (score.score && score.score < 3) {
        if (score.domain) {
          weakDomainIds.push(score.domain.id)
          weakDomainNames.push(score.domain.nameTr)
        }
      }
    })
  }

  // Skip if no weak domains
  if (weakDomainIds.length === 0) {
    logEntry.message = 'No weak domains found'
    logs.push(logEntry)
    options?.onProgress?.(logEntry)
    return false
  }

  try {
    const recommendations: any[] = []

    // Strategy: Try to find vetted DB activities for the first weak domain
    // If not found, fall back to generative AI
    const targetDomainId = weakDomainIds[0]
    const targetDomainName = weakDomainNames[0]

    const dbActivities = await prisma.activity.findMany({
      where: {
        domainId: targetDomainId,
        ageMin: { lte: age },
        ageMax: { gte: age },
        isActive: true,
      }
    })

    if (dbActivities.length > 0) {
      // VETTED PATH: Select best from DB
      console.log(`[CRON] Found ${dbActivities.length} vetted activities for ${student.firstName} in ${targetDomainName}`)
      const bestActivity = await selectBestActivity(
        {
          firstName: student.firstName,
          lastName: student.lastName,
          age,
          assessments: student.assessments,
        },
        targetDomainName,
        dbActivities
      )

      if (bestActivity) {
        recommendations.push({
          name: bestActivity.title,
          description: bestActivity.description,
          reasoning: bestActivity.aiReasoning || `Bu aktivite ${targetDomainName} gelişimini destekler.`,
          dbId: bestActivity.id
        })

        // Create recommendation record in DB
        await prisma.activityRecommendation.create({
          data: {
            studentId: student.id,
            activityId: bestActivity.id,
            domainId: targetDomainId,
            reason: bestActivity.aiReasoning || 'AI tarafından seçildi',
            recommendedTo: 'parent',
            status: 'pending'
          }
        })
      }
    } else {
      // HALLUCINATION PATH (Fallback): Generate new
      console.log(`[CRON] No vetted activities found for ${targetDomainName}. Falling back to generation.`)
      const generated = await generateActivityRecommendations(
        {
          firstName: student.firstName,
          lastName: student.lastName,
          age,
          assessments: student.assessments,
        },
        [targetDomainName]
      )
      if (generated && generated.length > 0) {
        recommendations.push(...generated)
      }
    }

    if (recommendations.length > 0) {
      // Create notification for parent
      const activityNames = recommendations.map((r: any) => r.name).join(', ')
      const firstRec = recommendations[0]

      await prisma.notification.create({
        data: {
          recipientId: parent.id,
          studentId: student.id,
          type: 'activity',
          senderType: 'ai',
          title: `${student.firstName} için Özel Aktivite Önerisi`,
          message: firstRec.reasoning
            ? `${firstRec.reasoning} Önerilen: ${firstRec.name}`
            : `${student.firstName}'in ${targetDomainName} gelişimi için öneri: ${firstRec.name}`,
          actionUrl: `/parent/children/${student.id}`,
          metadata: JSON.stringify({
            weakDomains: weakDomainNames,
            recommendations: recommendations,
            isVetted: !!firstRec.dbId
          }),
        },
      })

      logEntry.status = 'success'
      logEntry.message = `Sent recommended activities: ${activityNames}`
      logs.push(logEntry)
      options?.onProgress?.(logEntry)
      return true
    } else {
      logEntry.message = 'No recommendations generated'
      logs.push(logEntry)
      options?.onProgress?.(logEntry)
      return false
    }

  } catch (error) {
    logEntry.status = 'error'
    logEntry.message = `Error processing student: ${error}`
    logs.push(logEntry)
    options?.onProgress?.(logEntry)
    return false
  }
}
