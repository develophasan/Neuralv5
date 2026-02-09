import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// Get emotion snapshots for a student
export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const { studentId } = params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '7')

    try {
      const snapshots = await prisma.dailyEmotionSnapshot.findMany({
        where: { studentId },
        include: {
          teacher: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
        orderBy: { date: 'desc' },
        take: limit,
      })

      return NextResponse.json(snapshots)
    } catch (tableError: any) {
      // If table doesn't exist, return empty array
      if (tableError.code === 'P2021' || tableError.message?.includes('does not exist')) {
        console.warn('Daily emotion snapshots table does not exist yet. Run db:push to create it.')
        return NextResponse.json([])
      }
      throw tableError
    }
  } catch (error) {
    console.error('Error fetching emotion snapshots:', error)
    // Return empty array instead of error to prevent page crash
    return NextResponse.json([])
  }
}

// Create or update emotion snapshot
export async function POST(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const { studentId } = params
    const body = await request.json()
    const { date, mood, highlight, challenge, note, teacherId } = body

    const snapshotDate = date ? new Date(date) : new Date()
    snapshotDate.setHours(0, 0, 0, 0)

    try {
      const snapshot = await prisma.dailyEmotionSnapshot.upsert({
        where: {
          studentId_date: {
            studentId,
            date: snapshotDate,
          },
        },
        update: {
          mood,
          highlight,
          challenge,
          note,
        },
        create: {
          studentId,
          date: snapshotDate,
          mood,
          highlight,
          challenge,
          note,
          teacherId,
        },
        include: {
          teacher: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      })

      return NextResponse.json(snapshot)
    } catch (tableError: any) {
      // If table doesn't exist, return error message
      if (tableError.code === 'P2021' || tableError.message?.includes('does not exist')) {
        console.warn('Daily emotion snapshots table does not exist yet. Run db:push to create it.')
        return NextResponse.json(
          { error: 'Table not created yet. Please run db:push first.' },
          { status: 503 }
        )
      }
      throw tableError
    }
  } catch (error) {
    console.error('Error creating emotion snapshot:', error)
    return NextResponse.json(
      { error: 'Failed to create emotion snapshot' },
      { status: 500 }
    )
  }
}

