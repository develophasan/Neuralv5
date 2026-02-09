/**
 * ⚠️ CLINICAL RISK MATRIX - CDC/Bayley Compatible
 * 
 * Clinical-grade risk assessment using Z-scores and trend slopes.
 * Based on CDC developmental milestones and Bayley Scales.
 */

export type RiskLevel = 'normal' | 'low' | 'medium' | 'high'

export interface RiskAssessment {
  level: RiskLevel
  zScore: number
  slope: number
  interpretation: string
  clinicalMeaning: string
}

/**
 * Clinical Risk Matrix
 * 
 * Z Score Interpretation (CDC/Bayley compatible):
 * < -2.0: Severe developmental lag
 * -1.3 to -2.0: Moderate delay
 * -0.7 to -1.3: At risk
 * > -0.7: Typical development
 * 
 * Slope Interpretation:
 * < -5: Rapid decline
 * -3 to -5: Moderate decline
 * -1 to -3: Slow decline
 * > -1: Stable or improving
 */
export function clinicalRisk(zScore: number, slope: number): RiskAssessment {
  // High risk: Severe lag OR rapid decline
  if (zScore < -2.0 || slope < -5) {
    return {
      level: 'high',
      zScore,
      slope,
      interpretation: 'Severe developmental lag or rapid decline detected',
      clinicalMeaning: 'Child is significantly below age-expected performance. Professional evaluation recommended.',
    }
  }

  // Medium risk: Moderate delay OR moderate decline
  if (zScore < -1.3 || slope < -3) {
    return {
      level: 'medium',
      zScore,
      slope,
      interpretation: 'Moderate developmental delay or decline',
      clinicalMeaning: 'Child is below age-expected performance. Enhanced monitoring and support recommended.',
    }
  }

  // Low risk: At risk threshold
  if (zScore < -0.7 || slope < -1) {
    return {
      level: 'low',
      zScore,
      slope,
      interpretation: 'At risk for developmental delay',
      clinicalMeaning: 'Child is approaching age-expected performance. Continued monitoring recommended.',
    }
  }

  // Normal: Typical development
  return {
    level: 'normal',
    zScore,
    slope,
    interpretation: 'Typical developmental trajectory',
    clinicalMeaning: 'Child is performing within age-expected range.',
  }
}

/**
 * Calculate domain-specific risk
 */
export function calculateDomainRisk(
  zScore: number,
  slope: number,
  volatility: number = 0
): RiskAssessment {
  // Adjust risk based on volatility (high variance = instability)
  const adjustedZ = zScore - (volatility * 0.3) // Penalize high volatility

  return clinicalRisk(adjustedZ, slope)
}

/**
 * Aggregate risk across all domains
 */
export function aggregateRisk(domainRisks: RiskAssessment[]): RiskLevel {
  const highCount = domainRisks.filter(r => r.level === 'high').length
  const mediumCount = domainRisks.filter(r => r.level === 'medium').length
  const lowCount = domainRisks.filter(r => r.level === 'low').length

  // If any domain is high risk, overall is high
  if (highCount > 0) return 'high'

  // If 2+ domains are medium risk, overall is medium
  if (mediumCount >= 2) return 'medium'

  // If any domain is medium risk, overall is medium
  if (mediumCount > 0) return 'medium'

  // If 3+ domains are low risk, overall is low
  if (lowCount >= 3) return 'low'

  // If any domain is low risk, overall is low
  if (lowCount > 0) return 'low'

  return 'normal'
}

/**
 * Get risk interpretation for parent communication
 */
export function getParentFriendlyRisk(risk: RiskAssessment): string {
  const messages: Record<RiskLevel, string> = {
    normal: 'Çocuğunuz yaşına uygun gelişim gösteriyor.',
    low: 'Çocuğunuzun bazı alanlarda desteklenmesi önerilir.',
    medium: 'Çocuğunuzun bazı alanlarda ek desteğe ihtiyacı olabilir. Öğretmeninizle görüşmeniz önerilir.',
    high: 'Çocuğunuzun gelişimi için profesyonel değerlendirme önerilir. Lütfen öğretmeniniz ve okul yönetimi ile görüşün.',
  }

  return messages[risk.level]
}

