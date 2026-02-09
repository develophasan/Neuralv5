import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { generateDevelopmentSummary, generateTrajectory } from '@/lib/ai/gemini-service'

// GET /api/ai/summary/[studentId] - Get AI summary for student
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

    const summary = await generateDevelopmentSummary({
      firstName: student.firstName,
      lastName: student.lastName,
      age,
      assessments: student.assessments,
      neuroProfile: student.neuroProfile,
    })

    return NextResponse.json({
      success: true,
      data: summary,
    })
  } catch (error: any) {
    console.error('AI Summary Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/ai/summary/[studentId] - Generate new AI summary
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        assessments: {
          take: 10,
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

    const birthDate = new Date(student.dateOfBirth)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()

    // Generate both summary and trajectory
    const [summary, trajectory] = await Promise.all([
      generateDevelopmentSummary({
        firstName: student.firstName,
        lastName: student.lastName,
        age,
        assessments: student.assessments,
        neuroProfile: student.neuroProfile,
      }),
      generateTrajectory({
        firstName: student.firstName,
        lastName: student.lastName,
        age,
        assessments: student.assessments,
        neuroProfile: student.neuroProfile,
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        ...summary,
        trajectory,
      },
    })
  } catch (error: any) {
    console.error('AI Summary Generation Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
