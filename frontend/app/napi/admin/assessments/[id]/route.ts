// Admin: Assessment by ID (GET, DELETE)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { handleApiError } from '@/lib/api/errors'
import { successResponse } from '@/lib/api/utils'

// GET /api/admin/assessments/[id] - Get assessment by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id: params.id },
      include: {
        student: true,
        assessor: {
          select: { id: true, fullName: true, email: true },
        },
        scores: {
          include: { domain: true },
        },
      },
    })

    if (!assessment) {
      return NextResponse.json({ success: false, error: 'Assessment not found' }, { status: 404 })
    }

    return successResponse(assessment)
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/admin/assessments/[id] - Delete assessment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.assessment.delete({
      where: { id: params.id },
    })

    return successResponse(null, 'Assessment deleted successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

