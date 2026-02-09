import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// Advanced Neuro-Intelligence V3 Profile API
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params

    // 1. Fetch latest Z-Profiles for the student
    // We get the most recent calculation for each domain
    const zProfiles = await prisma.childNeuroZProfile.findMany({
      where: { studentId },
      orderBy: { calculatedAt: 'desc' },
      distinct: ['domain'] // Get latest per domain
    })

    // If no V3 data, we might need to trigger calculation or return empty
    // For now, let's return a structure compatible with the frontend but with 0s if missing

    // Map domains to the frontend expected structure
    // Frontend expects: executiveScore, languageScore, etc.
    // Our DB has codes: 'executive_functions', 'language_communication', etc.

    const domainMap: Record<string, number> = {
      'executive_functions': 0,
      'language_communication': 0,
      'social_emotional': 0,
      'motor_skills_gross': 0, // Need to map these correctly
      'motor_skills_fine': 0,
      'cognitive_flexibility': 0, // Logic?
      'creative_expression': 0,
      'spatial_awareness': 0,
      'world_discovery': 0,
      'self_care': 0
    }

    // Also need to map to the 1-100 scale for the Radar Chart
    // Z-Score is usually -3 to +3. 
    // We can map Z-Score to 0-100 percentile for visualization

    // Mapping DB codes to frontend props (based on NeuroDNAProfile.tsx interface)
    // executiveScore -> executive_functions
    // languageScore -> language_communication
    // emotionalScore -> social_emotional
    // grossMotorScore -> motor_skills_gross (assuming)
    // fineMotorScore -> motor_skills_fine (assuming)
    // logicScore -> cognitive_flexibility (closest)
    // creativeScore -> creative_expression
    // spatialScore -> spatial_awareness
    // discoveryScore -> world_discovery
    // independenceScore -> self_care

    zProfiles.forEach(p => {
      // Convert Percentile (0-100) directly to Score mostly
      // Or we can use the Z-score to emphasize outlier status
      // For Radar chart, Percentile is intuitive.

      // Handle mapping inconsistencies if any
      if (p.domain === 'motor_skills') {
        // If we bundled motor skills, assign to both or split? 
        // For V3, let's assume we have specific domains. 
        // If generic 'motor_skills', assign to gross
        domainMap['motor_skills_gross'] = p.percentile
        domainMap['motor_skills_fine'] = p.percentile
      } else {
        domainMap[p.domain] = p.percentile
      }
    })

    const scores = Object.values(domainMap)
    const activeScores = scores.filter(s => s > 0)
    const avgScore = activeScores.length > 0
      ? activeScores.reduce((a, b) => a + b, 0) / activeScores.length
      : 0

    // Derived Insights from Z-Scores
    // > 85 percentile = Dominant
    // < 25 percentile = Risk
    // 25-50 percentile = Growth Potential

    const derived = {
      dominantAreas: zProfiles.filter(p => p.percentile >= 85).map(p => translateDomain(p.domain)),
      riskAreas: zProfiles.filter(p => p.percentile <= 25).map(p => translateDomain(p.domain)),
      growthPotential: zProfiles.filter(p => p.percentile > 25 && p.percentile < 50).map(p => translateDomain(p.domain)),
      maxScore: Math.max(...scores),
      minScore: Math.min(...scores),
      avgScore: avgScore
    }

    return NextResponse.json({
      executiveScore: domainMap['executive_functions'] || 0,
      languageScore: domainMap['language_communication'] || 0,
      emotionalScore: domainMap['social_emotional'] || 0,
      grossMotorScore: domainMap['motor_skills_gross'] || domainMap['motor_skills'] || 0,
      fineMotorScore: domainMap['motor_skills_fine'] || domainMap['motor_skills'] || 0,
      logicScore: domainMap['cognitive_flexibility'] || 0,
      creativeScore: domainMap['creative_expression'] || 0,
      spatialScore: domainMap['spatial_awareness'] || 0,
      discoveryScore: domainMap['world_discovery'] || 0,
      independenceScore: domainMap['self_care'] || 0,
      derived
    })

  } catch (error) {
    console.error('Error fetching V3 profile:', error)
    return NextResponse.json(null)
  }
}

function translateDomain(code: string): string {
  const map: Record<string, string> = {
    'executive_functions': 'Yürütücü İşlevler',
    'language_communication': 'Dil ve İletişim',
    'social_emotional': 'Sosyal-Duygusal',
    'motor_skills': 'Motor Beceriler',
    'motor_skills_gross': 'Kaba Motor',
    'motor_skills_fine': 'İnce Motor',
    'cognitive_flexibility': 'Bilişsel Esneklik',
    'creative_expression': 'Yaratıcı İfade',
    'spatial_awareness': 'Mekansal Farkındalık',
    'world_discovery': 'Dünya Keşfi',
    'self_care': 'Öz-Bakım'
  }
  return map[code] || code
}

// Recalculate is handled by Cron now, but we can trigger it manually for debugging
export async function POST(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  // Phase 3: Trigger Z-Score Engine manually?
  // For now, we rely on the scheduled job or the 'calculate-z-score' script.
  // We can just return success or trigger the logic if we export it.
  return NextResponse.json({ message: 'Use Cron Job for V3 calculation' })
}

