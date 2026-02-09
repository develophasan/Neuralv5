import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// Simple test endpoint
export async function GET() {
  try {
    // Step 1: Check if we can access users table
    const userCount = await prisma.user.count({ where: { role: 'parent' } })
    
    // Step 2: Try to access notifications table
    let notificationCount = 0
    let notifications: any[] = []
    let error: any = null
    
    try {
      notificationCount = await prisma.notification.count()
    } catch (e: any) {
      error = {
        message: e.message,
        code: e.code,
        meta: e.meta,
      }
    }

    // Step 3: If notifications table works, get first parent and their notifications
    let firstParent = null
    if (!error && notificationCount > 0) {
      firstParent = await prisma.user.findFirst({
        where: { role: 'parent' },
        select: { id: true, email: true, fullName: true },
      })

      if (firstParent) {
        notifications = await prisma.notification.findMany({
          where: { recipientId: firstParent.id },
          take: 10,
          orderBy: { createdAt: 'desc' },
        })
      }
    }

    return NextResponse.json({
      success: true,
      userCount,
      notificationCount,
      error,
      parent: firstParent,
      notificationsFound: notifications.length,
      notifications: notifications.slice(0, 3), // First 3 only
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

