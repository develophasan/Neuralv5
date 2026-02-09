/**
 * 📊 Z-SCORE ENGINE - Harmoni OS V3
 * 
 * Statistical normalization engine:
 * - Age-based Z-score calculation
 * - Percentile ranking
 * - Weekly Z-profile generation
 */

import { prisma } from '@/lib/db/prisma'

// Domain codes
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

type DomainCode = typeof DOMAINS[number]

// Domain to profile field mapping
const DOMAIN_TO_FIELD: Record<DomainCode, keyof {
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
 * Calculate age in months from date of birth
 */
export function calculateAgeInMonths(dateOfBirth: Date): number {
  const today = new Date()
  const years = today.getFullYear() - dateOfBirth.getFullYear()
  const months = today.getMonth() - dateOfBirth.getMonth()
  return years * 12 + months
}

/**
 * Get or create age norm for a domain
 */
async function getAgeNorm(ageInMonths: number, domain: DomainCode): Promise<{ mean: number; stdDev: number }> {
  // Round to nearest 6-month interval (24, 30, 36, 42, 48, 54, 60, 66, 72)
  const roundedAge = Math.round(ageInMonths / 6) * 6
  const clampedAge = Math.max(24, Math.min(72, roundedAge))

  let norm = await prisma.neuroNormTable.findUnique({
    where: {
      ageInMonths_domain: {
        ageInMonths: clampedAge,
        domain,
      },
    },
  })

  // If norm doesn't exist, create placeholder values
  if (!norm) {
    // Placeholder: mean = 60%, stdDev = 15%
    // In production, these should come from real population data
    norm = await prisma.neuroNormTable.create({
      data: {
        ageInMonths: clampedAge,
        domain,
        mean: 60.0,
        stdDev: 15.0,
        sampleSize: 1000,
      },
    })
  }

  return {
    mean: norm.mean,
    stdDev: norm.stdDev,
  }
}

/**
 * Calculate Z-score: z = (score - mean) / stdDev
 */
export function calculateZScore(score: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0
  return (score - mean) / stdDev
}

/**
 * Convert Z-score to percentile using normal distribution
 */
export function zScoreToPercentile(zScore: number): number {
  // Approximation of cumulative distribution function
  // Using error function approximation
  const t = 1 / (1 + 0.2316419 * Math.abs(zScore))
  const d = 0.3989423 * Math.exp(-zScore * zScore / 2)
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
  
  if (zScore > 0) {
    return (1 - p) * 100
  } else {
    return p * 100
  }
}

/**
 * Calculate Z-profile for a student for current week
 */
export async function calculateZProfile(studentId: string): Promise<void> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { neuroProfile: true },
  })

  if (!student || !student.neuroProfile) {
    return
  }

  const ageInMonths = calculateAgeInMonths(student.dateOfBirth)
  
  // Get Monday of current week
  const today = new Date()
  const dayOfWeek = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  monday.setHours(0, 0, 0, 0)

  // Calculate Z-scores for each domain
  for (const domain of DOMAINS) {
    const field = DOMAIN_TO_FIELD[domain]
    const rawScore = student.neuroProfile[field] as number

    // Get age norm
    const { mean, stdDev } = await getAgeNorm(ageInMonths, domain)

    // Calculate Z-score
    const zScore = calculateZScore(rawScore, mean, stdDev)

    // Calculate percentile
    const percentile = zScoreToPercentile(zScore)

    // Upsert Z-profile
    await prisma.childNeuroZProfile.upsert({
      where: {
        studentId_domain_weekStart: {
          studentId,
          domain,
          weekStart: monday,
        },
      },
      update: {
        rawScore,
        zScore,
        percentile,
        ageInMonths,
      },
      create: {
        studentId,
        domain,
        rawScore,
        zScore,
        percentile,
        ageInMonths,
        weekStart: monday,
      },
    })
  }
}

/**
 * Get Z-profile history for a student (last N weeks)
 */
export async function getZProfileHistory(
  studentId: string,
  weeks: number = 8
): Promise<Array<{
  weekStart: Date
  domain: string
  zScore: number
  percentile: number
  rawScore: number
}>> {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const currentMonday = new Date(today)
  currentMonday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  currentMonday.setHours(0, 0, 0, 0)

  const weekStart = new Date(currentMonday)
  weekStart.setDate(currentMonday.getDate() - (weeks - 1) * 7)

  const profiles = await prisma.childNeuroZProfile.findMany({
    where: {
      studentId,
      weekStart: {
        gte: weekStart,
      },
    },
    orderBy: {
      weekStart: 'asc',
    },
  })

  return profiles.map(p => ({
    weekStart: p.weekStart,
    domain: p.domain,
    zScore: p.zScore,
    percentile: p.percentile,
    rawScore: p.rawScore,
  }))
}

/**
 * Initialize age norms with placeholder data
 * In production, this should be populated from real research data
 */
export async function initializeAgeNorms(): Promise<void> {
  const ages = [24, 30, 36, 42, 48, 54, 60, 66, 72] // 2-6 years in 6-month intervals

  for (const age of ages) {
    for (const domain of DOMAINS) {
      // Check if exists
      const exists = await prisma.neuroNormTable.findUnique({
        where: {
          ageInMonths_domain: {
            ageInMonths: age,
            domain,
          },
        },
      })

      if (!exists) {
        // Placeholder values - should be replaced with real data
        // Mean increases with age, stdDev stays relatively constant
        const mean = 50 + (age - 24) * 0.5 // 50% at 24 months, 74% at 72 months
        const stdDev = 15.0

        await prisma.neuroNormTable.create({
          data: {
            ageInMonths: age,
            domain,
            mean,
            stdDev,
            sampleSize: 1000,
          },
        })
      }
    }
  }
}

/**
 * Process all students: calculate Z-profiles
 */
export async function processAllZProfiles(): Promise<{
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
        await calculateZProfile(student.id)
        processed++
      }
    } catch (error) {
      console.error(`Error processing Z-profile for student ${student.id}:`, error)
      errors++
    }
  }

  return { processed, errors }
}

