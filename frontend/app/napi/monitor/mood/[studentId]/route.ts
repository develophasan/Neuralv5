import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const { studentId } = params

    // Get emotion snapshots from last 30 days
    const snapshots = await prisma.dailyEmotionSnapshot.findMany({
      where: {
        studentId,
        date: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { date: 'asc' },
    })

    // If no snapshots, try mood tracker
    if (snapshots.length === 0) {
      const moods = await prisma.moodTracker.findMany({
        where: {
          studentId,
          logDate: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        orderBy: { logDate: 'asc' },
      })

      const moodMap: { [key: string]: number[] } = {}
      moods.forEach((m) => {
        const date = m.logDate.toISOString().split('T')[0]
        if (!moodMap[date]) moodMap[date] = []
        const moodValue = m.mood === 'very_happy' ? 5 : m.mood === 'happy' ? 4 : m.mood === 'neutral' ? 3 : m.mood === 'sad' ? 2 : 1
        moodMap[date].push(moodValue)
      })

      const moodData = Object.entries(moodMap).map(([date, values]) => ({
        date: new Date(date),
        mood: values.reduce((a, b) => a + b, 0) / values.length,
      }))

      return NextResponse.json(moodData)
    }

    const moodData = snapshots.map((s) => ({
      date: s.date,
      mood: s.mood,
    }))

    return NextResponse.json(moodData)
  } catch (error: any) {
    console.error('Error fetching mood trends:', error)
    // If table doesn't exist, return empty array
    if (error.code === 'P2021' || error.message?.includes('does not exist')) {
      return NextResponse.json([])
    }
    return NextResponse.json([], { status: 200 })
  }
}

