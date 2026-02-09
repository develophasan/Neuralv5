import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { generateTrajectory } from '@/lib/ai/gemini-service'

// GET /api/ai/trajectory/[studentId] - Get predictive trajectory
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

    const trajectory = await generateTrajectory({
      firstName: student.firstName,
      lastName: student.lastName,
      age,
      assessments: student.assessments,
      neuroProfile: student.neuroProfile,
    })

    return NextResponse.json({
      success: true,
      data: trajectory,
    })
  } catch (error: any) {
    console.error('Trajectory Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
