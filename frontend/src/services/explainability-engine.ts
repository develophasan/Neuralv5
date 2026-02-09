/**
 * 🧠 EXPLAINABILITY ENGINE - Harmoni OS V3
 * 
 * Human-readable explanations for AI decisions:
 * - Weakest domains identification
 * - Declining trends explanation
 * - Emotional pattern analysis
 * - Age norm comparison
 */

import { prisma } from '@/lib/db/prisma'
import { getZProfileHistory } from './z-score-engine'
import { calculateRiskScore } from './risk-engine'

interface ExplanationData {
  weakestDomains: Array<{ domain: string; name: string; zScore: number; percentile: number }>
  decliningDomains: Array<{ domain: string; name: string; trend: number }>
  emotionalPattern: {
    avgMood: number
    stability: number
    recentTrend: 'improving' | 'stable' | 'declining'
  }
  comparisonToAgeNorm: {
    overallPercentile: number
    belowNormCount: number
    aboveNormCount: number
  }
}

const DOMAIN_NAMES: Record<string, string> = {
  executive_functions: 'Yürütücü İşlevler',
  language_communication: 'Dil ve İletişim',
  social_emotional: 'Sosyal ve Duygusal',
  gross_motor: 'Kaba Motor',
  fine_motor: 'İnce Motor',
  logical_numerical: 'Mantıksal ve Sayısal',
  creative_expression: 'Yaratıcı İfade',
  spatial_awareness: 'Mekansal Farkındalık',
  discovery_world: 'Dünya Keşfi',
  self_help: 'Öz-Bakım ve Bağımsızlık',
}

/**
 * Generate explanation data for a student
 */
export async function generateExplanation(studentId: string): Promise<ExplanationData> {
  // Get Z-profile history
  const zHistory = await getZProfileHistory(studentId, 4)
  
  // Get current Z-scores
  const currentScores: Record<string, { zScore: number; percentile: number }> = {}
  const domainTrends: Record<string, number[]> = {}

  for (const entry of zHistory) {
    if (!currentScores[entry.domain] || entry.weekStart > new Date()) {
      currentScores[entry.domain] = {
        zScore: entry.zScore,
        percentile: entry.percentile,
      }
    }

    if (!domainTrends[entry.domain]) {
      domainTrends[entry.domain] = []
    }
    domainTrends[entry.domain].push(entry.zScore)
  }

  // 1. Weakest domains (lowest Z-scores)
  const weakestDomains = Object.entries(currentScores)
    .map(([domain, data]) => ({
      domain,
      name: DOMAIN_NAMES[domain] || domain,
      zScore: data.zScore,
      percentile: data.percentile,
    }))
    .sort((a, b) => a.zScore - b.zScore)
    .slice(0, 3)

  // 2. Declining domains (negative trends)
  const decliningDomains = Object.entries(domainTrends)
    .map(([domain, scores]) => {
      if (scores.length < 2) return null
      
      // Simple linear trend
      const n = scores.length
      const x = Array.from({ length: n }, (_, i) => i)
      const sumX = x.reduce((a, b) => a + b, 0)
      const sumY = scores.reduce((a, b) => a + b, 0)
      const sumXY = x.reduce((sum, xi, i) => sum + xi * scores[i], 0)
      const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)
      const trend = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)

      return { domain, name: DOMAIN_NAMES[domain] || domain, trend }
    })
    .filter((item): item is { domain: string; name: string; trend: number } => 
      item !== null && item.trend < -0.1
    )
    .sort((a, b) => a.trend - b.trend)
    .slice(0, 3)

  // 3. Emotional pattern
  const emotionSnapshots = await prisma.dailyEmotionSnapshot.findMany({
    where: {
      studentId,
      date: {
        gte: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000), // Last 4 weeks
      },
    },
    orderBy: { date: 'desc' },
    take: 20,
  })

  const moodScores = emotionSnapshots.map(s => s.mood)
  const avgMood = moodScores.length > 0
    ? moodScores.reduce((a, b) => a + b, 0) / moodScores.length
    : 3

  // Calculate stability (inverse of variance)
  const variance = moodScores.length > 0
    ? moodScores.reduce((sum, m) => sum + Math.pow(m - avgMood, 2), 0) / moodScores.length
    : 0
  const stability = 1 / (1 + variance) // Normalized to 0-1

  // Recent trend (last week vs previous week)
  const recentMoods = moodScores.slice(0, 7)
  const previousMoods = moodScores.slice(7, 14)
  const recentAvg = recentMoods.length > 0
    ? recentMoods.reduce((a, b) => a + b, 0) / recentMoods.length
    : avgMood
  const previousAvg = previousMoods.length > 0
    ? previousMoods.reduce((a, b) => a + b, 0) / previousMoods.length
    : avgMood

  let recentTrend: 'improving' | 'stable' | 'declining'
  if (recentAvg > previousAvg + 0.2) {
    recentTrend = 'improving'
  } else if (recentAvg < previousAvg - 0.2) {
    recentTrend = 'declining'
  } else {
    recentTrend = 'stable'
  }

  // 4. Comparison to age norm
  const allPercentiles = Object.values(currentScores).map(s => s.percentile)
  const overallPercentile = allPercentiles.length > 0
    ? allPercentiles.reduce((a, b) => a + b, 0) / allPercentiles.length
    : 50

  const belowNormCount = allPercentiles.filter(p => p < 50).length
  const aboveNormCount = allPercentiles.filter(p => p >= 50).length

  return {
    weakestDomains,
    decliningDomains,
    emotionalPattern: {
      avgMood,
      stability,
      recentTrend,
    },
    comparisonToAgeNorm: {
      overallPercentile,
      belowNormCount,
      aboveNormCount,
    },
  }
}

/**
 * Generate human-readable explanation text
 */
export async function generateExplanationText(studentId: string): Promise<string> {
  const explanation = await generateExplanation(studentId)
  const student = await prisma.student.findUnique({
    where: { id: studentId },
  })

  const parts: string[] = []

  // Weakest domains
  if (explanation.weakestDomains.length > 0) {
    const domains = explanation.weakestDomains
      .map(d => `${d.name} (${d.percentile.toFixed(0)}. persentil)`)
      .join(', ')
    parts.push(`En zayıf alanlar: ${domains}`)
  }

  // Declining domains
  if (explanation.decliningDomains.length > 0) {
    const domains = explanation.decliningDomains
      .map(d => d.name)
      .join(', ')
    parts.push(`Gerileme gösteren alanlar: ${domains}`)
  }

  // Emotional pattern
  const moodDesc = explanation.emotionalPattern.avgMood >= 4
    ? 'çok pozitif'
    : explanation.emotionalPattern.avgMood >= 3
    ? 'pozitif'
    : 'dikkat gerektiriyor'
  
  parts.push(`Duygusal durum: ${moodDesc} (stabilite: ${(explanation.emotionalPattern.stability * 100).toFixed(0)}%)`)

  // Age norm comparison
  if (explanation.comparisonToAgeNorm.overallPercentile < 30) {
    parts.push(`Yaş normuna göre: Ortalamanın altında (${explanation.comparisonToAgeNorm.overallPercentile.toFixed(0)}. persentil)`)
  } else if (explanation.comparisonToAgeNorm.overallPercentile > 70) {
    parts.push(`Yaş normuna göre: Ortalamanın üstünde (${explanation.comparisonToAgeNorm.overallPercentile.toFixed(0)}. persentil)`)
  } else {
    parts.push(`Yaş normuna göre: Ortalama seviyede (${explanation.comparisonToAgeNorm.overallPercentile.toFixed(0)}. persentil)`)
  }

  return parts.join('. ') + '.'
}

/**
 * Update NeuroAlert with explanation
 */
export async function updateAlertExplanation(alertId: string): Promise<void> {
  const alert = await prisma.neuroAlert.findUnique({
    where: { id: alertId },
    include: { student: true },
  })

  if (!alert) return

  const explanation = await generateExplanation(alert.studentId)
  const explanationText = await generateExplanationText(alert.studentId)

  await prisma.neuroAlert.update({
    where: { id: alertId },
    data: {
      explanation: JSON.stringify({
        ...explanation,
        text: explanationText,
      }),
    },
  })
}

