import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { handleApiError } from '@/lib/api/errors'
import { successResponse } from '@/lib/api/utils'

// GET /api/notifications - List notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const recipientId = searchParams.get('recipientId')
    const isRead = searchParams.get('isRead')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}
    if (recipientId) {
      where.recipientId = recipientId
    }
    if (isRead === 'false') {
      where.isRead = false
    } else if (isRead === 'true') {
      where.isRead = true
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        recipient: {
          select: { id: true, fullName: true, email: true },
        },
      },
    })

    return successResponse(notifications)
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/notifications - Create notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recipientId, type, title, message, senderType, senderId, studentId, actionUrl, metadata } = body

    if (!recipientId || !type || !title) {
      return NextResponse.json(
        { success: false, error: 'recipientId, type ve title gerekli' },
        { status: 400 }
      )
    }

    // Map type to NotificationType enum
    const validTypes = ['info', 'warning', 'success', 'alert', 'ai_summary', 'assessment', 'activity', 'system']
    const notificationType = validTypes.includes(type) ? type : 'info'

    // Map senderType to NotificationSender enum
    const validSenders = ['admin', 'teacher', 'ai', 'system']
    const notificationSender = validSenders.includes(senderType) ? senderType : 'system'

    const notification = await prisma.notification.create({
      data: {
        recipientId,
        type: notificationType as any,
        title,
        message: message || '',
        senderType: notificationSender as any,
        senderId: senderId || null,
        studentId: studentId || null,
        actionUrl: actionUrl || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    })

    return successResponse(notification)
  } catch (error) {
    return handleApiError(error)
  }
}
