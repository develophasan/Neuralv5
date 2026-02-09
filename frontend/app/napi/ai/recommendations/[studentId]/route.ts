import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { generateActivityRecommendations } from '@/lib/ai/gemini-service'

// GET /api/ai/recommendations/[studentId] - Get AI activity recommendations
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        assessments: {
          take: 5,
          orderBy: { assessmentDate: 'desc' },
          include: {
            scores: {
              include: { domain: true },
            },
          },
        },
        neuroProfile: true,
      },
    })

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Öğrenci bulunamadı' },
        { status: 404 }
      )
    }

    // Calculate age
    const birthDate = new Date(student.dateOfBirth)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()

    // Find weak domains (score < 3)
    const weakDomains: string[] = []
    const lastAssessment = student.assessments?.[0]
    
    if (lastAssessment?.scores) {
      lastAssessment.scores.forEach((score: any) => {
        if (score.score < 3) {
          weakDomains.push(score.domain?.nameTr || score.domainId)
        }
      })
    }

    // If no weak domains, add general areas
    if (weakDomains.length === 0) {
      weakDomains.push('Genel Gelişim')
    }

    const recommendations = await generateActivityRecommendations(
      {
        firstName: student.firstName,
        lastName: student.lastName,
        age,
        assessments: student.assessments,
        neuroProfile: student.neuroProfile,
      },
      weakDomains
    )

    return NextResponse.json({
      success: true,
      data: {
        weakDomains,
        recommendations,
      },
    })
  } catch (error: any) {
    console.error('AI Recommendations Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
