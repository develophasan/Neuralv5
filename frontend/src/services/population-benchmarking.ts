/**
 * 🌍 POPULATION BENCHMARKING SERVICE
 * 
 * Aggregated, anonymized statistics for:
 * - Regional comparisons
 * - Age-group norms
 * - Domain-specific benchmarks
 * - Research data export
 */

import { prisma } from '@/lib/db/prisma'

export interface PopulationBenchmark {
  ageGroup: string // e.g., "24-36 months"
  domain: string
  mean: number
  median: number
  stdDev: number
  percentile25: number
  percentile75: number
  sampleSize: number
}

export interface RegionalBenchmark extends PopulationBenchmark {
  region?: string
  anonymized: true
}

/**
 * Calculate population benchmarks for an age group
 */
export async function calculateAgeGroupBenchmarks(
  ageMin: number,
  ageMax: number
): Promise<PopulationBenchmark[]> {
  // Get all students in age range
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
  })

  if (profiles.length < 10) {
    // Need at least 10 samples for benchmarking
    return []
  }

  const domains = [
    { field: 'executiveScore', domain: 'executive_functions' },
    { field: 'languageScore', domain: 'language_communication' },
    { field: 'emotionalScore', domain: 'social_emotional' },
    { field: 'grossMotorScore', domain: 'gross_motor' },
    { field: 'fineMotorScore', domain: 'fine_motor' },
    { field: 'logicScore', domain: 'logical_numerical' },
    { field: 'creativeScore', domain: 'creative_expression' },
    { field: 'spatialScore', domain: 'spatial_awareness' },
    { field: 'discoveryScore', domain: 'discovery_world' },
    { field: 'independenceScore', domain: 'self_help' },
  ]

  const benchmarks: PopulationBenchmark[] = []

  for (const { field, domain } of domains) {
    const values = profiles
      .map(p => p[field as keyof typeof p] as number)
      .filter(v => v > 0)
      .sort((a, b) => a - b)

    if (values.length < 10) continue

    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
    const stdDev = Math.sqrt(variance)

    const median = values[Math.floor(values.length / 2)]
    const percentile25 = values[Math.floor(values.length * 0.25)]
    const percentile75 = values[Math.floor(values.length * 0.75)]

    benchmarks.push({
      ageGroup: `${ageMin}-${ageMax} months`,
      domain,
      mean,
      median,
      stdDev,
      percentile25,
      percentile75,
      sampleSize: values.length,
    })
  }

  return benchmarks
}

/**
 * Get all age group benchmarks
 */
export async function getAllBenchmarks(): Promise<PopulationBenchmark[]> {
  const ageGroups = [
    { min: 24, max: 36 },
    { min: 36, max: 48 },
    { min: 48, max: 60 },
    { min: 60, max: 72 },
  ]

  const allBenchmarks: PopulationBenchmark[] = []

  for (const group of ageGroups) {
    const benchmarks = await calculateAgeGroupBenchmarks(group.min, group.max)
    allBenchmarks.push(...benchmarks)
  }

  return allBenchmarks
}

/**
 * Export anonymized data for research
 */
export async function exportAnonymizedData(): Promise<{
  benchmarks: PopulationBenchmark[]
  totalSamples: number
  ageGroups: string[]
  domains: string[]
  exportDate: Date
}> {
  const benchmarks = await getAllBenchmarks()
  
  const totalSamples = benchmarks.reduce((sum, b) => sum + b.sampleSize, 0)
  const ageGroups = [...new Set(benchmarks.map(b => b.ageGroup))]
  const domains = [...new Set(benchmarks.map(b => b.domain))]

  return {
    benchmarks,
    totalSamples,
    ageGroups,
    domains,
    exportDate: new Date(),
  }
}

/**
 * Compare student to population benchmark
 */
export async function compareToBenchmark(
  studentId: string
): Promise<{
  domain: string
  studentScore: number
  benchmarkMean: number
  percentile: number
  comparison: 'above' | 'at' | 'below'
}[]> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { neuroProfile: true },
  })

  if (!student || !student.neuroProfile) {
    return []
  }

  const ageInMonths = Math.floor(
    (Date.now() - student.dateOfBirth.getTime()) / (365.25 * 30 * 24 * 60 * 60 * 1000)
  )

  // Determine age group
  let ageMin = 24
  let ageMax = 36
  if (ageInMonths >= 36 && ageInMonths < 48) {
    ageMin = 36
    ageMax = 48
  } else if (ageInMonths >= 48 && ageInMonths < 60) {
    ageMin = 48
    ageMax = 60
  } else if (ageInMonths >= 60) {
    ageMin = 60
    ageMax = 72
  }

  const benchmarks = await calculateAgeGroupBenchmarks(ageMin, ageMax)

  const comparisons = []

  const domainMap = [
    { field: 'executiveScore', domain: 'executive_functions' },
    { field: 'languageScore', domain: 'language_communication' },
    { field: 'emotionalScore', domain: 'social_emotional' },
    { field: 'grossMotorScore', domain: 'gross_motor' },
    { field: 'fineMotorScore', domain: 'fine_motor' },
    { field: 'logicScore', domain: 'logical_numerical' },
    { field: 'creativeScore', domain: 'creative_expression' },
    { field: 'spatialScore', domain: 'spatial_awareness' },
    { field: 'discoveryScore', domain: 'discovery_world' },
    { field: 'independenceScore', domain: 'self_help' },
  ]

  for (const { field, domain } of domainMap) {
    const studentScore = student.neuroProfile[field as keyof typeof student.neuroProfile] as number
    const benchmark = benchmarks.find(b => b.domain === domain)

    if (!benchmark) continue

    // Calculate percentile
    const zScore = (studentScore - benchmark.mean) / benchmark.stdDev
    const percentile = zScore > 0
      ? 50 + (1 - Math.exp(-zScore * zScore / 2)) * 50
      : 50 - (1 - Math.exp(-zScore * zScore / 2)) * 50

    let comparison: 'above' | 'at' | 'below' = 'at'
    if (studentScore > benchmark.percentile75) comparison = 'above'
    else if (studentScore < benchmark.percentile25) comparison = 'below'

    comparisons.push({
      domain,
      studentScore,
      benchmarkMean: benchmark.mean,
      percentile,
      comparison,
    })
  }

  return comparisons
}

