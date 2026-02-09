/**
 * 🧠 COHORT-BASED Z-SCORE ENGINE - Production Grade
 * 
 * Clinical-grade Z-score calculation using same-age cohort statistics.
 * Compatible with CDC/Bayley developmental scales.
 */

import { prisma } from '@/lib/db/prisma'

const DOMAINS = [
  'executive_functions',
  'language_communication',
  'social_emotional',
  'gross_motor',
  'fine_motor',
  'logical_numerical',
  'creative_expression',
  'spatial_awareness',
  'discovery_world',
  'self_help',
] as const

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

/**
 * Calculate age in months
 */
function calculateAgeInMonths(dateOfBirth: Date): number {
  const today = new Date()
  const years = today.getFullYear() - dateOfBirth.getFullYear()
  const months = today.getMonth() - dateOfBirth.getMonth()
  return years * 12 + months
}

/**
 * Get same-age cohort for a student
 * Cohort = students within ±3 months of age
 */
async function getCohort(ageInMonths: number): Promise<Array<{
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
}>> {
  const ageMin = ageInMonths - 3
  const ageMax = ageInMonths + 3

  const dateMin = new Date()
  dateMin.setFullYear(dateMin.getFullYear() - Math.floor(ageMax / 12))
  dateMin.setMonth(dateMin.getMonth() - (ageMax % 12))

  const dateMax = new Date()
  dateMax.setFullYear(dateMax.getFullYear() - Math.floor(ageMin / 12))
  dateMax.setMonth(dateMax.getMonth() - (ageMin % 12))

  const profiles = await prisma.childNeuroProfile.findMany({
    where: {
      student: {
        dateOfBirth: {
          gte: dateMin,
          lte: dateMax,
        },
        isActive: true,
      },
    },
    select: {
      executiveScore: true,
      languageScore: true,
      emotionalScore: true,
      grossMotorScore: true,
      fineMotorScore: true,
      logicScore: true,
      creativeScore: true,
      spatialScore: true,
      discoveryScore: true,
      independenceScore: true,
    },
  })

  return profiles
}

/**
 * Calculate mean and standard deviation for a domain
 */
function calculateStats(values: number[]): { mean: number; std: number } | null {
  if (values.length < 5) return null // Need at least 5 samples for statistical validity

  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
  const std = Math.sqrt(variance)

  return { mean, std }
}

/**
 * Calculate Z-score: z = (score - mean) / std
 */
function calculateZScore(score: number, mean: number, std: number): number {
  if (std === 0) return 0
  return (score - mean) / std
}

/**
 * Calculate and store domain statistics for a student
 */
export async function calculateDomainStats(studentId: string): Promise<void> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { neuroProfile: true },
  })

  if (!student || !student.neuroProfile) {
    return
  }

  const ageInMonths = calculateAgeInMonths(student.dateOfBirth)
  const cohort = await getCohort(ageInMonths)

  if (cohort.length < 5) {
    console.warn(`Insufficient cohort size (${cohort.length}) for student ${studentId}`)
    return
  }

  // Calculate stats for each domain
  for (const domain of DOMAINS) {
    const field = DOMAIN_TO_FIELD[domain]
    const currentScore = student.neuroProfile[field] as number

    // Extract cohort values for this domain
    const cohortValues = cohort.map(p => p[field] as number).filter(v => v > 0)

    const stats = calculateStats(cohortValues)
    if (!stats) continue

    // Store domain stats
    await prisma.childDomainStats.upsert({
      where: {
        studentId_domain: {
          studentId,
          domain,
        },
      },
      update: {
        mean: stats.mean,
        std: stats.std,
        cohortSize: cohortValues.length,
        ageInMonths,
      },
      create: {
        studentId,
        domain,
        mean: stats.mean,
        std: stats.std,
        cohortSize: cohortValues.length,
        ageInMonths,
      },
    })
  }
}

/**
 * Calculate Z-scores using cohort statistics
 */
export async function calculateCohortZScores(studentId: string): Promise<Record<string, number>> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      neuroProfile: true,
      domainStats: true,
    },
  })

  if (!student || !student.neuroProfile) {
    return {}
  }

  const zScores: Record<string, number> = {}

  for (const domain of DOMAINS) {
    const field = DOMAIN_TO_FIELD[domain]
    const currentScore = student.neuroProfile[field] as number

    // Get domain stats
    const stats = student.domainStats.find(s => s.domain === domain)
    if (!stats || stats.std === 0) {
      zScores[domain] = 0
      continue
    }

    // Calculate Z-score
    zScores[domain] = calculateZScore(currentScore, stats.mean, stats.std)
  }

  return zScores
}

/**
 * Process all students: calculate domain stats and Z-scores
 */
export async function processAllCohortZScores(): Promise<{
  processed: number
  errors: number
}> {
  const students = await prisma.student.findMany({
    where: { isActive: true },
    include: { neuroProfile: true },
  })

  let processed = 0
  let errors = 0

  for (const student of students) {
    try {
      if (student.neuroProfile) {
        await calculateDomainStats(student.id)
        processed++
      }
    } catch (error) {
      console.error(`Error processing cohort Z-scores for student ${student.id}:`, error)
      errors++
    }
  }

  return { processed, errors }
}

