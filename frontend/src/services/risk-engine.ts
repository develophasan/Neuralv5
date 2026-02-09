/**
 * ⚠️ RISK ENGINE - Harmoni OS V3
 * 
 * Statistical risk modeling:
 * - Multi-factor risk calculation
 * - Trend analysis
 * - Domain imbalance detection
 * - Emotional instability tracking
 */

import { prisma } from '@/lib/db/prisma'
import { getZProfileHistory } from './z-score-engine'

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

/**
 * Calculate linear regression slope for trend analysis
 * Returns slope (change per week)
 */
function calculateTrendSlope(values: number[]): number {
  if (values.length < 2) return 0

  const n = values.length
  const x = Array.from({ length: n }, (_, i) => i)
  const y = values

  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  return slope
}

/**
 * Calculate standard deviation
 */
function calculateStdDev(values: number[]): number {
  if (values.length === 0) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  return Math.sqrt(variance)
}

/**
 * Calculate variance
 */
function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
}

/**
 * Calculate risk score for a student
 */
export async function calculateRiskScore(studentId: string): Promise<{
  riskScore: number
  severity: 'low' | 'medium' | 'high'
  trendSlope: number
  domainImbalance: number
  emotionalInstability: number
  weakestDomain: string | null
  decliningDomain: string | null
  strongestDomain: string | null
}> {
  // 1. Get Z-profile history (last 4 weeks)
  const zHistory = await getZProfileHistory(studentId, 4)
  
  // 2. Get current Z-scores (average across domains)
  const currentZScores: number[] = []
  const domainZScores: Record<string, number[]> = {}

  for (const domain of DOMAINS) {
    const domainHistory = zHistory.filter(h => h.domain === domain)
    if (domainHistory.length > 0) {
      const latest = domainHistory[domainHistory.length - 1]
      currentZScores.push(latest.zScore)
      domainZScores[domain] = domainHistory.map(h => h.zScore)
    }
  }

  // 3. Calculate trend slope (average across all domains)
  const allTrendSlopes = Object.values(domainZScores)
    .map(scores => calculateTrendSlope(scores))
    .filter(slope => !isNaN(slope))
  
  const trendSlope = allTrendSlopes.length > 0
    ? allTrendSlopes.reduce((a, b) => a + b, 0) / allTrendSlopes.length
    : 0

  // 4. Calculate domain imbalance (std dev of current Z-scores)
  const domainImbalance = calculateStdDev(currentZScores)

  // 5. Calculate emotional instability (variance of mood scores)
  const emotionSnapshots = await prisma.dailyEmotionSnapshot.findMany({
    where: {
      studentId,
      date: {
        gte: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000), // Last 4 weeks
      },
    },
    select: { mood: true },
  })

  const moodScores = emotionSnapshots.map(s => s.mood)
  const emotionalInstability = calculateVariance(moodScores)

  // 6. Calculate average Z-score (for risk calculation)
  const avgZScore = currentZScores.length > 0
    ? currentZScores.reduce((a, b) => a + b, 0) / currentZScores.length
    : 0

  // 7. Calculate risk score
  // RiskScore = 0.4 * zScore + 0.3 * trendSlope + 0.2 * domainImbalance + 0.1 * emotionalInstability
  // Note: Negative values indicate risk (lower is worse)
  const riskScore = 
    0.4 * (-avgZScore) + // Negative Z-score = risk
    0.3 * (-trendSlope) + // Negative slope = declining = risk
    0.2 * domainImbalance + // High imbalance = risk
    0.1 * emotionalInstability // High variance = risk

  // 8. Determine severity
  let severity: 'low' | 'medium' | 'high'
  if (riskScore < -1.5) {
    severity = 'high'
  } else if (riskScore < -0.8) {
    severity = 'medium'
  } else {
    severity = 'low'
  }

  // 9. Find weakest, strongest, and declining domains
  const domainAverages: Array<{ domain: string; avgZ: number; trend: number }> = []
  
  for (const domain of DOMAINS) {
    const scores = domainZScores[domain] || []
    if (scores.length > 0) {
      const avgZ = scores.reduce((a, b) => a + b, 0) / scores.length
      const trend = calculateTrendSlope(scores)
      domainAverages.push({ domain, avgZ, trend })
    }
  }

  domainAverages.sort((a, b) => a.avgZ - b.avgZ)
  const weakestDomain = domainAverages[0]?.domain || null
  const strongestDomain = domainAverages[domainAverages.length - 1]?.domain || null

  domainAverages.sort((a, b) => a.trend - b.trend)
  const decliningDomain = domainAverages[0]?.trend < -0.1 ? domainAverages[0].domain : null

  return {
    riskScore,
    severity,
    trendSlope,
    domainImbalance,
    emotionalInstability,
    weakestDomain,
    decliningDomain,
    strongestDomain,
  }
}

/**
 * Calculate and store risk profile for a student
 */
export async function updateRiskProfile(studentId: string): Promise<void> {
  const riskData = await calculateRiskScore(studentId)

  await prisma.neuroRiskProfile.upsert({
    where: { studentId },
    update: {
      riskScore: riskData.riskScore,
      severity: riskData.severity,
      trendSlope: riskData.trendSlope,
      domainImbalance: riskData.domainImbalance,
      emotionalInstability: riskData.emotionalInstability,
      weakestDomain: riskData.weakestDomain,
      decliningDomain: riskData.decliningDomain,
      strongestDomain: riskData.strongestDomain,
    },
    create: {
      studentId,
      ...riskData,
    },
  })
}

/**
 * Process all students: calculate risk profiles
 */
export async function processAllRiskProfiles(): Promise<{
  processed: number
  errors: number
}> {
  const students = await prisma.student.findMany({
    where: { isActive: true },
  })

  let processed = 0
  let errors = 0

  for (const student of students) {
    try {
      await updateRiskProfile(student.id)
      processed++
    } catch (error) {
      console.error(`Error processing risk profile for student ${student.id}:`, error)
      errors++
    }
  }

  return { processed, errors }
}

