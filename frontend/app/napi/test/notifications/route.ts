import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// Debug endpoint to test notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const recipientId = searchParams.get('recipientId')

    // Try Prisma query directly
    let tableExists = false
    let totalCount = 0
    let allNotifications: any[] = []
    let allRecipients: string[] = []
    let filteredNotifications: any[] = []

    try {
      // Test if table exists by trying to count
      totalCount = await prisma.notification.count()
      tableExists = true

      // Get notifications
      if (totalCount > 0) {
        allNotifications = await prisma.notification.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            recipientId: true,
            title: true,
            type: true,
            createdAt: true,
          },
        })

        // Get unique recipients
        const all = await prisma.notification.findMany({
          select: { recipientId: true },
          take: 100,
        })
        allRecipients = [...new Set(all.map(r => r.recipientId))]

        // If recipientId provided, filter
        if (recipientId) {
          filteredNotifications = await prisma.notification.findMany({
            where: { recipientId },
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              recipientId: true,
              title: true,
              type: true,
              createdAt: true,
            },
          })
        }
      }
    } catch (prismaError: any) {
      // Table doesn't exist or other error
      return NextResponse.json({
        success: false,
        tableExists: false,
        error: prismaError.message,
        code: prismaError.code,
        meta: prismaError.meta,
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      tableExists,
      totalCount,
      allNotifications,
      filteredNotifications,
      allRecipients,
      requestedRecipientId: recipientId,
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 })
  }
}
