// Admin: Daily Log by ID (GET, PUT, DELETE)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { handleApiError } from '@/lib/api/errors'
import { getBody } from '@/lib/api/middleware'
import { CreateDailyLogSchema } from '@/lib/validations'
import { successResponse } from '@/lib/api/utils'

// GET /api/admin/daily-logs/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const log = await prisma.dailyLog.findUnique({
      where: { id: params.id },
      include: {
        student: true,
        class: true,
        logger: {
          select: { id: true, fullName: true, email: true },
        },
      },
    })

    if (!log) {
      return NextResponse.json({ success: false, error: 'Daily log not found' }, { status: 404 })
    }

    return successResponse(log)
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/admin/daily-logs/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bodyResult = await getBody(request, CreateDailyLogSchema.partial())
    if (!bodyResult.success) {
      return NextResponse.json({ success: false, error: bodyResult.error }, { status: 400 })
    }

    const data: any = { ...bodyResult.data }
    if (data.logDate) data.logDate = new Date(data.logDate)

    const log = await prisma.dailyLog.update({
      where: { id: params.id },
      data,
      include: {
        student: true,
        class: true,
      },
    })

    return successResponse(log, 'Daily log updated successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/admin/daily-logs/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.dailyLog.delete({
      where: { id: params.id },
    })

    return successResponse(null, 'Daily log deleted successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

