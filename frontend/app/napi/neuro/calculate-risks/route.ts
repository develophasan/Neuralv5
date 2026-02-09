import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// Background job to calculate risks - should be called weekly via cron
export async function POST(request: NextRequest) {
  try {
    // Get all active students
    const students = await prisma.student.findMany({
      where: { isActive: true },
      include: {
        assessments: {
          include: {
            scores: {
              include: { domain: true },
            },
          },
          orderBy: { assessmentDate: 'desc' },
          take: 3, // Last 3 assessments
        },
      },
    })

    const domainCodes = [
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
    ]

    const createdAlerts = []

    for (const student of students) {
      // Group scores by domain
      const domainScores: Record<string, number[]> = {}

      student.assessments.forEach((assessment) => {
        assessment.scores.forEach((score) => {
          const domainCode = score.domain.code
          if (!domainScores[domainCode]) {
            domainScores[domainCode] = []
          }
          const value = score.percentage ?? (score.score ? (score.score / 5) * 100 : 0)
          domainScores[domainCode].push(value)
        })
      })

      // Check each domain for consecutive drops
      for (const domainCode of domainCodes) {
        const scores = domainScores[domainCode] || []
        
        if (scores.length >= 2) {
          // Check if last 2 periods show consecutive drops
          const recentScores = scores.slice(0, 2)
          const isDropping = recentScores[0] < recentScores[1]
          const dropAmount = recentScores[1] - recentScores[0]

          if (isDropping && dropAmount >= 5) {
            // Check if alert already exists
            const existingAlert = await prisma.neuroAlert.findFirst({
              where: {
                studentId: student.id,
                domain: domainCode,
                isResolved: false,
              },
            })

            if (!existingAlert) {
              // Determine severity
              let severity: 'low' | 'medium' | 'high' = 'low'
              if (dropAmount >= 15) {
                severity = 'high'
              } else if (dropAmount >= 10) {
                severity = 'medium'
              }

              const domain = await prisma.developmentDomain.findUnique({
                where: { code: domainCode },
              })

              const alert = await prisma.neuroAlert.create({
                data: {
                  studentId: student.id,
                  domain: domainCode,
                  severity,
                  message: `${student.firstName} ${student.lastName} için ${domain?.nameTr || domainCode} alanında son 2 değerlendirmede %${dropAmount.toFixed(1)} düşüş tespit edildi.`,
                },
              })

              createdAlerts.push(alert)
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      alertsCreated: createdAlerts.length,
      alerts: createdAlerts,
    })
  } catch (error) {
    console.error('Error calculating risks:', error)
    return NextResponse.json(
      { error: 'Failed to calculate risks' },
      { status: 500 }
    )
  }
}

