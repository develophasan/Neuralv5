/**
 * 🔮 PREDICTIVE TRAJECTORY ENGINE
 * 
 * Forecasts 3-month developmental trajectory based on:
 * - Historical trends
 * - Current Z-scores
 * - Domain-specific slopes
 */

import { prisma } from '@/lib/db/prisma'
import { calculateCohortZScores } from './cohort-z-score-engine'
import { getZProfileHistory } from './z-score-engine'

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

export interface TrajectoryPrediction {
  domain: string
  currentZScore: number
  projectedZScore: number
  projectedScore: number
  trendSlope: number
  confidence: 'high' | 'medium' | 'low'
  projectionMonths: number
}

/**
 * Calculate linear regression slope
 */
function calculateSlope(values: number[]): number {
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
 * Calculate confidence level based on data points
 */
function calculateConfidence(dataPoints: number, rSquared: number): 'high' | 'medium' | 'low' {
  if (dataPoints >= 8 && rSquared > 0.7) return 'high'
  if (dataPoints >= 4 && rSquared > 0.5) return 'medium'
  return 'low'
}

/**
 * Calculate R-squared for trend fit
 */
function calculateRSquared(values: number[], slope: number): number {
  if (values.length < 2) return 0

  const n = values.length
  const x = Array.from({ length: n }, (_, i) => i)
  const meanY = values.reduce((a, b) => a + b, 0) / n

  // Calculate predicted values
  const predicted = x.map(xi => slope * xi)
  const meanPredicted = predicted.reduce((a, b) => a + b, 0) / n

  // Sum of squares
  const ssRes = values.reduce((sum, yi, i) => sum + Math.pow(yi - predicted[i], 2), 0)
  const ssTot = values.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0)

  if (ssTot === 0) return 0
  return 1 - (ssRes / ssTot)
}

/**
 * Predict 3-month trajectory for a student
 */
export async function predictTrajectory(
  studentId: string,
  projectionMonths: number = 3
): Promise<TrajectoryPrediction[]> {
  // Get current Z-scores
  const currentZScores = await calculateCohortZScores(studentId)

  // Get Z-profile history (last 12 weeks = 3 months)
  const zHistory = await getZProfileHistory(studentId, 12)

  // Get domain stats for score conversion
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      domainStats: true,
      neuroProfile: true,
    },
  })

  if (!student || !student.neuroProfile) {
    return []
  }

  const predictions: TrajectoryPrediction[] = []

  for (const domain of DOMAINS) {
    const currentZ = currentZScores[domain] || 0

    // Get historical Z-scores for this domain
    const domainHistory = zHistory
      .filter(h => h.domain === domain)
      .map(h => h.zScore)
      .slice(-12) // Last 12 weeks

    if (domainHistory.length < 3) {
      // Not enough data
      predictions.push({
        domain,
        currentZScore: currentZ,
        projectedZScore: currentZ,
        projectedScore: 0,
        trendSlope: 0,
        confidence: 'low',
        projectionMonths,
      })
      continue
    }

    // Calculate trend slope (per week)
    const slope = calculateSlope(domainHistory)
    const rSquared = calculateRSquared(domainHistory, slope)
    const confidence = calculateConfidence(domainHistory.length, rSquared)

    // Project forward (weeks to months: 1 month ≈ 4.33 weeks)
    const weeksToProject = projectionMonths * 4.33
    const projectedZ = currentZ + (slope * weeksToProject)

    // Convert Z-score back to raw score if domain stats available
    const domainStat = student.domainStats.find(s => s.domain === domain)
    let projectedScore = 0
    if (domainStat && domainStat.std > 0) {
      projectedScore = projectedZ * domainStat.std + domainStat.mean
      // Clamp to 0-100
      projectedScore = Math.max(0, Math.min(100, projectedScore))
    }

    predictions.push({
      domain,
      currentZScore: currentZ,
      projectedZScore: projectedZ,
      projectedScore,
      trendSlope: slope,
      confidence,
      projectionMonths,
    })
  }

  return predictions
}

/**
 * Get trajectory summary (high-level insights)
 */
export async function getTrajectorySummary(studentId: string): Promise<{
  improvingDomains: string[]
  decliningDomains: string[]
  stableDomains: string[]
  overallTrend: 'improving' | 'stable' | 'declining'
}> {
  const predictions = await predictTrajectory(studentId, 3)

  const improvingDomains = predictions
    .filter(p => p.trendSlope > 0.05 && p.confidence !== 'low')
    .map(p => p.domain)

  const decliningDomains = predictions
    .filter(p => p.trendSlope < -0.05 && p.confidence !== 'low')
    .map(p => p.domain)

  const stableDomains = predictions
    .filter(p => Math.abs(p.trendSlope) <= 0.05)
    .map(p => p.domain)

  const avgSlope = predictions.reduce((sum, p) => sum + p.trendSlope, 0) / predictions.length
  const overallTrend = avgSlope > 0.02 ? 'improving' : avgSlope < -0.02 ? 'declining' : 'stable'

  return {
    improvingDomains,
    decliningDomains,
    stableDomains,
    overallTrend,
  }
}

