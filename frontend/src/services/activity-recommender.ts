/**
 * 🎯 ADAPTIVE ACTIVITY RECOMMENDER
 * 
 * Recommends activities based on:
 * - Z-score (weakest domains)
 * - Risk level
 * - Age appropriateness
 * - Domain-specific needs
 */

import { prisma } from '@/lib/db/prisma'
import { calculateCohortZScores } from './cohort-z-score-engine'
import { clinicalRisk } from './clinical-risk-matrix'
import { formatDomainName } from './clinical-terminology'

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

const FIELD_TO_DOMAIN: Record<string, string> = {
  executiveScore: 'executive_functions',
  languageScore: 'language_communication',
  emotionalScore: 'social_emotional',
  grossMotorScore: 'gross_motor',
  fineMotorScore: 'fine_motor',
  logicScore: 'logical_numerical',
  creativeScore: 'creative_expression',
  spatialScore: 'spatial_awareness',
  discoveryScore: 'discovery_world',
  independenceScore: 'self_help',
}

export interface ActivityRecommendation {
  activity: {
    id: string
    title: string
    description: string | null
    domain: string
    ageMin: number
    ageMax: number
    difficultyLevel: number
  }
  reason: string
  priority: 'high' | 'medium' | 'low'
  domain: string
  domainName: string
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
 * Recommend activities for a student
 */
export async function recommendActivities(
  studentId: string,
  limit: number = 5
): Promise<ActivityRecommendation[]> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      neuroProfile: true,
      neuroRiskProfile: true,
    },
  })

  if (!student || !student.neuroProfile) {
    return []
  }

  const neuroProfile = student.neuroProfile
  const ageInMonths = calculateAgeInMonths(student.dateOfBirth)
  const zScores = await calculateCohortZScores(studentId)

  // Find weakest domains (lowest Z-scores)
  const domainZScores = Object.entries(zScores)
    .map(([domain, zScore]) => ({
      domain,
      zScore,
      field: DOMAIN_TO_FIELD[domain],
      score: neuroProfile[DOMAIN_TO_FIELD[domain] as keyof typeof neuroProfile] as number,
    }))
    .sort((a, b) => a.zScore - b.zScore) // Sort by Z-score (lowest first)

  // Get top 3 weakest domains
  const targetDomains = domainZScores.slice(0, 3)

  const recommendations: ActivityRecommendation[] = []

  for (const target of targetDomains) {
    // Get risk assessment for this domain
    const risk = clinicalRisk(target.zScore, 0) // Slope not available here, use 0

    // Find activities for this domain
    // First, find the domain by code
    const domain = await prisma.developmentDomain.findFirst({
      where: { code: target.domain },
    })

    if (!domain) continue

    const activities = await prisma.activity.findMany({
      where: {
        domainId: domain.id,
        ageMin: { lte: ageInMonths },
        ageMax: { gte: ageInMonths },
        isActive: true,
      },
      orderBy: [
        { difficultyLevel: 'asc' }, // Start with easier activities
      ],
      take: 2, // 2 activities per domain
    })

    for (const activity of activities) {
      // Determine priority based on risk level
      let priority: 'high' | 'medium' | 'low' = 'low'
      if (risk.level === 'high') priority = 'high'
      else if (risk.level === 'medium') priority = 'medium'

      // Generate reason
      const domainName = formatDomainName(target.domain, 'parent')
      const reason = risk.level === 'high'
        ? `${domainName} alanında desteklenmesi gerekiyor. Bu aktivite gelişimi destekleyecektir.`
        : risk.level === 'medium'
        ? `${domainName} alanında gelişim için önerilir.`
        : `${domainName} alanında pratik yapmak için uygun.`

      recommendations.push({
        activity: {
          id: activity.id,
          title: activity.title,
          description: activity.description,
          domain: target.domain,
          ageMin: activity.ageMin,
          ageMax: activity.ageMax,
          difficultyLevel: activity.difficultyLevel,
        },
        reason,
        priority,
        domain: target.domain,
        domainName,
      })
    }
  }

  // Sort by priority (high first) and limit
  return recommendations
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
    .slice(0, limit)
}

/**
 * Get activity recommendations with risk context
 */
export async function getRecommendationsWithRisk(studentId: string): Promise<{
  recommendations: ActivityRecommendation[]
  riskDomains: string[]
  overallRisk: 'normal' | 'low' | 'medium' | 'high'
}> {
  const recommendations = await recommendActivities(studentId, 5)
  
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { neuroRiskProfile: true },
  })

  const riskDomains = recommendations
    .filter(r => r.priority === 'high' || r.priority === 'medium')
    .map(r => r.domain)

  const overallRisk = student?.neuroRiskProfile?.severity || 'normal'

  return {
    recommendations,
    riskDomains,
    overallRisk,
  }
}

