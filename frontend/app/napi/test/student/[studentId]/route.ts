/**
 * Test endpoint to verify student data and API functionality
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params
    
    // Get student with all related data
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        neuroProfile: true,
        neuroRiskProfile: true,
        neuroZProfiles: {
          take: 10,
          orderBy: { weekStart: 'desc' },
        },
        emotionSnapshots: {
          take: 7,
          orderBy: { date: 'desc' },
        },
        aiSummaries: {
          take: 5,
          orderBy: { date: 'desc' },
        },
      },
    })

    if (!student) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Student not found',
          studentId,
          hint: 'Try GET /api/test/students to see available student IDs'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      student: {
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        hasNeuroProfile: !!student.neuroProfile,
        hasRiskProfile: !!student.neuroRiskProfile,
        zProfileCount: student.neuroZProfiles.length,
        emotionSnapshotCount: student.emotionSnapshots.length,
        aiSummaryCount: student.aiSummaries.length,
      },
      data: {
        neuroProfile: student.neuroProfile,
        riskProfile: student.neuroRiskProfile,
        latestZProfiles: student.neuroZProfiles.slice(0, 5),
        latestEmotions: student.emotionSnapshots,
        latestSummaries: student.aiSummaries,
      },
    })
  } catch (error: any) {
    console.error('Test endpoint error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

