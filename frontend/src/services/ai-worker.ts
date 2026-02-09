/**
 * 🤖 AI WORKER - Harmoni OS V3
 * 
 * Gemini AI integration with statistical intelligence:
 * - Z-score based summaries
 * - Risk-aware recommendations
 * - Explainable insights
 * - Domain-specific activities
 */

// @ts-ignore - @google/genai package types
import { GoogleGenAI } from '@google/genai'
import { prisma } from '@/lib/db/prisma'
import { getZProfileHistory, calculateAgeInMonths } from './z-score-engine'
import { calculateRiskScore } from './risk-engine'
import { generateExplanation } from './explainability-engine'
import { calculateCohortZScores } from './cohort-z-score-engine'
import { clinicalRisk, aggregateRisk } from './clinical-risk-matrix'
import { formatDomainName, getClinicalTerm } from './clinical-terminology'

// Initialize Gemini
// @ts-ignore - GoogleGenAI types
const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null

/**
 * Generate V3 AI summary with statistical intelligence
 */
export async function generateChildSummary(studentId: string, date: Date = new Date()): Promise<{
  summary: string
  riskExplanation: string | null
  homeActivity: string | null
  positiveNote: string | null
}> {
  try {
    // Get student data
    const student = await (prisma.student.findUnique({
      where: { id: studentId },
      include: {
        neuroProfile: true,
        neuroRiskProfile: true,
        domainStats: true,
        emotionSnapshots: {
          where: {
            date: {
              gte: new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000),
            },
          },
          orderBy: { date: 'desc' },
          take: 7,
        },
      },
    }) as any)

    if (!student) {
      throw new Error('Student not found')
    }

    // Get V3 data
    const ageInMonths = calculateAgeInMonths(student.dateOfBirth)
    const zHistory = await getZProfileHistory(studentId, 4)
    const riskData = await calculateRiskScore(studentId)
    const explanation = await generateExplanation(studentId)
    
    // Get cohort-based Z-scores (clinical grade)
    const cohortZScores = await calculateCohortZScores(studentId)

    // Get current Z-scores
    const currentZScores: Record<string, number> = {}
    const latestWeek = zHistory
      .filter(h => {
        const weekDate = new Date(h.weekStart)
        const daysDiff = (date.getTime() - weekDate.getTime()) / (1000 * 60 * 60 * 24)
        return daysDiff >= 0 && daysDiff < 7
      })
      .reduce((acc, h) => {
        if (!acc[h.domain] || h.weekStart > new Date(acc[h.domain]?.weekStart || 0)) {
          acc[h.domain] = h
        }
        return acc
      }, {} as Record<string, typeof zHistory[0]>)

    Object.values(latestWeek).forEach(entry => {
      currentZScores[entry.domain] = entry.zScore
    })

    // Build V3 context
    const context = {
      name: `${student.firstName} ${student.lastName}`,
      ageInMonths,
      zScores: currentZScores,
      riskScore: riskData.riskScore,
      riskSeverity: riskData.severity,
      trendSlope: riskData.trendSlope,
      weakestDomain: riskData.weakestDomain,
      strongestDomain: riskData.strongestDomain,
      decliningDomain: riskData.decliningDomain,
      domainImbalance: riskData.domainImbalance,
      emotionalInstability: riskData.emotionalInstability,
      explanation: {
        weakestDomains: explanation.weakestDomains,
        decliningDomains: explanation.decliningDomains,
        emotionalPattern: explanation.emotionalPattern,
        comparisonToAgeNorm: explanation.comparisonToAgeNorm,
      },
      recentMoods: (student as any).emotionSnapshots?.map((s: any) => ({
        date: s.date,
        mood: s.mood,
        highlight: s.highlight,
      })),
    }

    // Build clinical terminology context
    const clinicalContext: Record<string, any> = {}
    Object.entries(cohortZScores).forEach(([domain, zScore]) => {
      const term = getClinicalTerm(domain)
      if (term) {
        clinicalContext[domain] = {
          zScore,
          clinicalName: term.clinicalName,
          parentName: term.parentFriendlyName,
        }
      }
    })

    // Calculate age norm band
    const ageNormBand = ageInMonths < 36 ? '24-36 months' 
      : ageInMonths < 48 ? '36-48 months'
      : ageInMonths < 60 ? '48-60 months'
      : '60+ months'

    // Build V3 Clinical Prompt
    const prompt = `
You are a pediatric neurodevelopment assistant.

ROLE:
- Use developmental psychology language
- Avoid medical diagnosis
- Use observational terminology
- Be warm, professional, and hope-oriented

CHILD PROFILE:
- Name: ${context.name}
- Age: ${context.ageInMonths} months (${ageNormBand})
- Age Norm Band: ${ageNormBand}

Z-SCORES (Cohort-based, CDC/Bayley compatible):
${JSON.stringify(clinicalContext, null, 2)}

RISK ASSESSMENT:
- Overall Risk: ${context.riskSeverity}
- Risk Score: ${context.riskScore.toFixed(2)}
- Trend Slope: ${context.trendSlope.toFixed(3)} (negative = decline)
- Weakest Domain: ${context.weakestDomain ? formatDomainName(context.weakestDomain, 'parent') : 'None'}
- Strongest Domain: ${context.strongestDomain ? formatDomainName(context.strongestDomain, 'parent') : 'None'}
- Declining Domain: ${context.decliningDomain ? formatDomainName(context.decliningDomain, 'parent') : 'None'}

WEEKLY TRENDS:
${JSON.stringify(zHistory.slice(-4).map(h => ({
  week: h.weekStart.toISOString().split('T')[0],
  domain: formatDomainName(h.domain, 'parent'),
  zScore: h.zScore.toFixed(2),
  percentile: h.percentile.toFixed(1),
})), null, 2)}

RECENT EMOTIONS:
${JSON.stringify(context.recentMoods || [], null, 2)}

EXPLANATION DATA:
${JSON.stringify(context.explanation, null, 2)}

TASKS:

1. Summarize developmental status using observational clinical language.
   - Highlight strengths first
   - Mention risk domains gently (if any)
   - Use parent-friendly Turkish

2. Risk explanation (if risk exists):
   - Simple, non-alarming language
   - Focus on support, not problems
   - Never diagnose

3. Home activity:
   - Specific to weakest domain: ${context.weakestDomain ? formatDomainName(context.weakestDomain, 'parent') : 'general'}
   - One concrete, actionable activity
   - Age-appropriate

4. Positive reinforcement:
   - Highlight strongest domain or general strengths
   - Encourage continued engagement

TONE:
- Warm and supportive
- Professional but accessible
- Hope-oriented
- Never scary or clinical

FORMAT:
Return strict JSON (no other text):

{
  "summary": "2 sentences: developmental status in observational language",
  "riskExplanation": "Simple Turkish explanation if risk exists, else null",
  "homeActivity": "One specific activity for weakest domain",
  "positiveNote": "One sentence highlighting strengths"
}

IMPORTANT:
- Never diagnose
- Never use medical terminology with parents
- Always be supportive and encouraging
- Use observational language only
`

    if (!genAI) {
      throw new Error('GEMINI_API_KEY is not set')
    }

    // @ts-ignore - GoogleGenAI API
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse JSON from response
    let summary: {
      summary: string
      riskExplanation: string | null
      homeActivity: string | null
      positiveNote: string | null
    }

    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        summary = JSON.parse(jsonMatch[1] || jsonMatch[0])
      } else {
        // Fallback: parse entire response
        summary = JSON.parse(text)
      }
    } catch (parseError) {
      // Fallback: create summary from context
      const riskText = context.riskSeverity !== 'low'
        ? `${context.weakestDomain} alanında destek önerilir.`
        : null

      summary = {
        summary: `${context.name} bugün güzel bir gün geçirdi. Gelişim takibi devam ediyor.`,
        riskExplanation: riskText,
        homeActivity: context.weakestDomain
          ? `${context.weakestDomain} alanını desteklemek için evde birlikte oyun oynayabilirsiniz.`
          : 'Evde birlikte oyun oynamak ve hikaye okumak önerilir.',
        positiveNote: context.strongestDomain
          ? `${context.strongestDomain} alanında güçlü performans gösteriyor.`
          : 'Gelişim yolculuğunda ilerlemeye devam ediyor.',
      }
    }

    return {
      summary: summary.summary || `${context.name} bugün güzel bir gün geçirdi.`,
      riskExplanation: summary.riskExplanation || null,
      homeActivity: summary.homeActivity || null,
      positiveNote: summary.positiveNote || null,
    }
  } catch (error) {
    console.error('Error generating AI summary:', error)
    
    // Fallback summary
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    })

    return {
      summary: student 
        ? `${student.firstName} bugün güzel bir gün geçirdi. Gelişim takibi devam ediyor.`
        : 'Gelişim takibi devam ediyor.',
      riskExplanation: null,
      homeActivity: 'Evde birlikte oyun oynamak ve hikaye okumak önerilir.',
      positiveNote: 'Gelişim yolculuğunda ilerlemeye devam ediyor.',
    }
  }
}

/**
 * Generate summaries for all active students
 */
export async function generateAllSummaries(date: Date = new Date()): Promise<{
  generated: number
  errors: number
}> {
  const students = await prisma.student.findMany({
    where: { isActive: true },
  })

  let generated = 0
  let errors = 0

  for (const student of students) {
    try {
      // Check if summary already exists for today
      const existing = await (prisma as any).aIChildSummary.findUnique({
        where: {
          studentId_date: {
            studentId: student.id,
            date,
          },
        },
      })

      if (existing) {
        continue // Skip if already generated
      }

      // Generate V3 summary
      const summary = await generateChildSummary(student.id, date)

      // Save to database (V3 format)
      await (prisma as any).aIChildSummary.create({
        data: {
          studentId: student.id,
          date,
          summary: summary.summary,
          riskExplanation: summary.riskExplanation,
          homeActivity: summary.homeActivity,
          positiveNote: summary.positiveNote,
        },
      })

      generated++
    } catch (error) {
      console.error(`Error generating summary for student ${student.id}:`, error)
      errors++
    }
  }

  return { generated, errors }
}

