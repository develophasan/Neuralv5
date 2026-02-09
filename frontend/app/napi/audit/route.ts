import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// Create audit log entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      action,
      entity,
      entityId,
      details,
      ipAddress,
      userAgent,
    } = body

    const auditLog = await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details: details ? JSON.stringify(details) : null,
        ipAddress,
        userAgent,
      },
    })

    return NextResponse.json(auditLog)
  } catch (error) {
    console.error('Error creating audit log:', error)
    return NextResponse.json(
      { error: 'Failed to create audit log' },
      { status: 500 }
    )
  }
}

// Get audit logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const entity = searchParams.get('entity')
    const entityId = searchParams.get('entityId')
    const limit = parseInt(searchParams.get('limit') || '100')

    let where: any = {}

    if (userId) {
      where.userId = userId
    }

    if (entity) {
      where.entity = entity
    }

    if (entityId) {
      where.entityId = entityId
    }

    // Check if table exists by trying to query
    try {
      const logs = await prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { timestamp: 'desc' },
        take: limit,
      })

      return NextResponse.json(logs)
    } catch (tableError: any) {
      // If table doesn't exist, return empty array
      if (tableError.code === 'P2021' || tableError.message?.includes('does not exist')) {
        console.warn('Audit logs table does not exist yet. Run db:push to create it.')
        return NextResponse.json([])
      }
      throw tableError
    }
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    // Return empty array instead of error to prevent page crash
    return NextResponse.json([])
  }
}

