// Admin: Activity by ID (GET, PUT, DELETE)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { handleApiError } from '@/lib/api/errors'
import { getBody } from '@/lib/api/middleware'
import { UpdateActivitySchema } from '@/lib/validations'
import { successResponse } from '@/lib/api/utils'

// GET /api/admin/activities/[id] - Get activity by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const activity = await prisma.activity.findUnique({
      where: { id: params.id },
      include: {
        domain: true,
        recommendations: {
          include: {
            student: true,
          },
          take: 10,
        },
      },
    })

    if (!activity) {
      return NextResponse.json({ success: false, error: 'Activity not found' }, { status: 404 })
    }

    return successResponse(activity)
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/admin/activities/[id] - Update activity
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bodyResult = await getBody(request, UpdateActivitySchema)
    if (!bodyResult.success) {
      return NextResponse.json({ success: false, error: bodyResult.error }, { status: 400 })
    }

    const data: any = { ...bodyResult.data }
    if (data.materialsNeeded) {
      data.materialsNeeded = JSON.stringify(data.materialsNeeded)
    }

    const activity = await prisma.activity.update({
      where: { id: params.id },
      data,
      include: {
        domain: true,
      },
    })

    return successResponse(activity, 'Activity updated successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/admin/activities/[id] - Delete activity
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.activity.delete({
      where: { id: params.id },
    })

    return successResponse(null, 'Activity deleted successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

