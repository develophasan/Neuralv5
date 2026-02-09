/**
 * 🧠 NEURO ENGINE - Harmoni OS V2
 * 
 * Core business logic for neurodevelopmental tracking:
 * - Weekly trend calculation
 * - Risk detection
 * - Profile aggregation
 * - Alert generation
 */

import { prisma } from '@/lib/db/prisma'

// Domain code to profile field mapping
const DOMAIN_TO_FIELD: Record<string, keyof {
  executiveScore: number
  languageScore: number
  emotionalScore: number
  grossMotorScore: number
  fineMotorScore: number
  logicScore: number
  creativeScore: number
  spatialScore: number
  discoveryScore: number
  independenceScore: number
}> = {
  executive_functions: 'executiveScore',
  language_communication: 'languageScore',
  social_emotional: 'emotionalScore',
  gross_motor: 'grossMotorScore',
  fine_motor: 'fineMotorScore',
  logical_numerical: 'logicScore',
  creative_expression: 'creativeScore',
  spatial_awareness: 'spatialScore',
  discovery_world: 'discoveryScore',
  self_help: 'independenceScore',
}

const DOMAIN_NAMES = [
  'Yürütücü İşlevler',
  'Dil ve İletişim',
  'Sosyal ve Duygusal',
  'Kaba Motor',
  'İnce Motor',
  'Mantıksal ve Sayısal',
  'Yaratıcı İfade',
  'Mekansal Farkındalık',
  'Dünya Keşfi',
  'Öz-Bakım ve Bağımsızlık',
]

interface TrendResult {
  domain: string
  delta: number
  periodStart: Date
  periodEnd: Date
}

interface RiskAlert {
  domain: string
  severity: 'low' | 'medium' | 'high'
  message: string
  score: number
}

/**
 * Calculate weekly trends for a student
 */
export async function calculateWeeklyTrends(
  studentId: string,
  weeks: number = 4
): Promise<TrendResult[]> {
  const today = new Date()
  const trends: TrendResult[] = []

  // Get profile
  const profile = await (prisma as any).childNeuroProfile.findUnique({
    where: { studentId },
  })

  if (!profile) {
    return trends
  }

  // For each week, calculate delta
  for (let week = 0; week < weeks; week++) {
    const periodStart = new Date(today)
    periodStart.setDate(today.getDate() - (week + 1) * 7)
    const periodEnd = new Date(periodStart)
    periodEnd.setDate(periodStart.getDate() + 7)

    // Get assessments in this period
    const assessments = await prisma.assessment.findMany({
      where: {
        studentId,
        assessmentDate: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      include: {
        scores: {
          include: { domain: true },
        },
      },
    })

    // Calculate average scores per domain for this period
    const domainScores: Record<string, number[]> = {}
    
    assessments.forEach((assessment) => {
      assessment.scores.forEach((score) => {
        const code = score.domain.code
        if (!domainScores[code]) {
          domainScores[code] = []
        }
        const value = score.percentage ?? (score.score ? (score.score / 5) * 100 : 0)
        domainScores[code].push(value)
      })
    })

    // Calculate deltas (current period vs previous period)
    Object.entries(domainScores).forEach(([code, scores]) => {
      const avg = scores.length > 0 
        ? scores.reduce((a, b) => a + b, 0) / scores.length 
        : 0
      
      const field = DOMAIN_TO_FIELD[code]
      if (field) {
        const currentScore = profile[field] as number
        const delta = avg - currentScore // Change from baseline
        
        trends.push({
          domain: code,
          delta: Math.round(delta * 100) / 100, // Round to 2 decimals
          periodStart,
          periodEnd,
        })
      }
    })
  }

  return trends
}

/**
 * Detect risks and generate alerts
 */
export async function detectRisks(studentId: string): Promise<RiskAlert[]> {
  const profile = await (prisma as any).childNeuroProfile.findUnique({
    where: { studentId },
  })

  if (!profile) {
    return []
  }

  const alerts: RiskAlert[] = []
  const scores = [
    { domain: 'executive_functions', name: 'Yürütücü İşlevler', score: profile.executiveScore },
    { domain: 'language_communication', name: 'Dil ve İletişim', score: profile.languageScore },
    { domain: 'social_emotional', name: 'Sosyal ve Duygusal', score: profile.emotionalScore },
    { domain: 'gross_motor', name: 'Kaba Motor', score: profile.grossMotorScore },
    { domain: 'fine_motor', name: 'İnce Motor', score: profile.fineMotorScore },
    { domain: 'logical_numerical', name: 'Mantıksal ve Sayısal', score: profile.logicScore },
    { domain: 'creative_expression', name: 'Yaratıcı İfade', score: profile.creativeScore },
    { domain: 'spatial_awareness', name: 'Mekansal Farkındalık', score: profile.spatialScore },
    { domain: 'discovery_world', name: 'Dünya Keşfi', score: profile.discoveryScore },
    { domain: 'self_help', name: 'Öz-Bakım ve Bağımsızlık', score: profile.independenceScore },
  ]

  const avgScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length

  scores.forEach(({ domain, name, score }) => {
    if (score < 35) {
      // High risk
      alerts.push({
        domain: name,
        severity: 'high',
        message: `${name} alanında ciddi düşük performans tespit edildi (${score.toFixed(1)}%). Acil destek önerilir.`,
        score,
      })
    } else if (score < 40) {
      // Medium risk
      alerts.push({
        domain: name,
        severity: 'medium',
        message: `${name} alanında düşük performans tespit edildi (${score.toFixed(1)}%). Ek destek önerilir.`,
        score,
      })
    } else if (score < avgScore * 0.8) {
      // Low risk
      alerts.push({
        domain: name,
        severity: 'low',
        message: `${name} alanında ortalama altı performans tespit edildi (${score.toFixed(1)}%). İzlenmesi önerilir.`,
        score,
      })
    }
  })

  return alerts
}

/**
 * Update or create ChildNeuroProfile from assessments
 */
export async function updateNeuroProfile(studentId: string): Promise<void> {
  // Get all assessments
  const assessments = await prisma.assessment.findMany({
    where: { studentId },
    include: {
      scores: {
        include: { domain: true },
      },
    },
    orderBy: { assessmentDate: 'desc' },
  })

  // Aggregate scores by domain
  const domainScores: Record<string, number[]> = {}
  
  assessments.forEach((assessment) => {
    assessment.scores.forEach((score) => {
      const code = score.domain.code
      if (!domainScores[code]) {
        domainScores[code] = []
      }
      const value = score.percentage ?? (score.score ? (score.score / 5) * 100 : 0)
      domainScores[code].push(value)
    })
  })

  // Calculate averages
  const profileData: any = {
    studentId,
    executiveScore: 0,
    languageScore: 0,
    emotionalScore: 0,
    grossMotorScore: 0,
    fineMotorScore: 0,
    logicScore: 0,
    creativeScore: 0,
    spatialScore: 0,
    discoveryScore: 0,
    independenceScore: 0,
  }

  Object.entries(domainScores).forEach(([code, scores]) => {
    const avg = scores.length > 0 
      ? scores.reduce((a, b) => a + b, 0) / scores.length 
      : 0
    const field = DOMAIN_TO_FIELD[code]
    if (field) {
      profileData[field] = Math.round(avg * 10) / 10 // Round to 1 decimal
    }
  })

  // Upsert profile
    await (prisma as any).childNeuroProfile.upsert({
    where: { studentId },
    update: profileData,
    create: profileData,
  })
}

/**
 * Merge QuickAssessment into profile
 */
export async function mergeQuickAssessment(
  studentId: string,
  domainCode: string,
  score: number
): Promise<void> {
  // Convert quick assessment score (1-5) to percentage
  const percentage = (score / 5) * 100

  // Get current profile
  const profile = await (prisma as any).childNeuroProfile.findUnique({
    where: { studentId },
  })

  if (!profile) {
    // Create new profile if doesn't exist
    await updateNeuroProfile(studentId)
    return
  }

  // Get field name
  const field = DOMAIN_TO_FIELD[domainCode]
  if (!field) {
    return
  }

  // Weighted average: 70% existing, 30% new
  const currentScore = profile[field] as number
  const newScore = currentScore * 0.7 + percentage * 0.3

  // Update profile
    await (prisma as any).childNeuroProfile.update({
    where: { studentId },
    data: {
      [field]: Math.round(newScore * 10) / 10,
    },
  })
}

/**
 * Process all students: update profiles, detect risks, create alerts
 */
export async function processAllStudents(): Promise<{
  profilesUpdated: number
  alertsCreated: number
  trendsCalculated: number
}> {
  const students = await prisma.student.findMany({
    where: { isActive: true },
  })

  let profilesUpdated = 0
  let alertsCreated = 0
  let trendsCalculated = 0

  for (const student of students) {
    try {
      // Update profile
      await updateNeuroProfile(student.id)
      profilesUpdated++

      // Calculate trends
      const trends = await calculateWeeklyTrends(student.id, 4)
      
      // Save trends
      for (const trend of trends) {
        await (prisma as any).childDevelopmentTrend.upsert({
          where: {
            studentId_domain_periodStart: {
              studentId: student.id,
              domain: trend.domain,
              periodStart: trend.periodStart,
            },
          },
          update: {
            delta: trend.delta,
            periodEnd: trend.periodEnd,
          },
          create: {
            studentId: student.id,
            domain: trend.domain,
            delta: trend.delta,
            periodStart: trend.periodStart,
            periodEnd: trend.periodEnd,
          },
        })
        trendsCalculated++
      }

      // Detect risks
      const risks = await detectRisks(student.id)
      
      // Create alerts for new risks
      for (const risk of risks) {
        // Check if alert already exists
        const existing = await (prisma as any).neuroAlert.findFirst({
          where: {
            studentId: student.id,
            domain: risk.domain,
            isResolved: false,
          },
        })

        if (!existing) {
          await (prisma as any).neuroAlert.create({
            data: {
              studentId: student.id,
              domain: risk.domain,
              severity: risk.severity,
              message: risk.message,
            },
          })
          alertsCreated++
        }
      }
    } catch (error) {
      console.error(`Error processing student ${student.id}:`, error)
    }
  }

  return {
    profilesUpdated,
    alertsCreated,
    trendsCalculated,
  }
}

