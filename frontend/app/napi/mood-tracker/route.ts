import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { handleApiError } from '@/lib/api/errors'
import { successResponse } from '@/lib/api/utils'

// GET /api/mood-tracker - List mood entries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const teacherId = searchParams.get('teacherId')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}
    if (studentId) where.studentId = studentId

    // If teacherId provided, get students in teacher's classes
    if (teacherId) {
      const teacherClasses = await prisma.classTeacher.findMany({
        where: { teacherId },
        include: {
          class: {
            include: {
              classStudents: {
                where: { isActive: true },
                select: { studentId: true },
              },
            },
          },
        },
      })

      const studentIds = teacherClasses.flatMap((tc) =>
        tc.class.classStudents.map((cs) => cs.studentId)
      )

      if (studentIds.length > 0) {
        where.studentId = { in: studentIds }
      }
    }

    const moods = await prisma.dailyEmotionSnapshot.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit,
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    })

    return successResponse(moods)
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/mood-tracker - Create mood entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, mood, highlight, challenge, note, teacherId } = body

    if (!studentId || mood === undefined) {
      return NextResponse.json(
        { success: false, error: 'studentId ve mood gerekli' },
        { status: 400 }
      )
    }

    // Convert mood string to number
    const moodMap: Record<string, number> = {
      'very_happy': 5,
      'happy': 4,
      'neutral': 3,
      'sad': 2,
      'very_sad': 1,
    }
    const moodScore = typeof mood === 'number' ? mood : (moodMap[mood] || 3)

    // Check if today's entry exists
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const existing = await prisma.dailyEmotionSnapshot.findFirst({
      where: {
        studentId,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    })

    // Get first teacher if not provided
    let finalTeacherId = teacherId
    if (!finalTeacherId) {
      const teacher = await prisma.user.findFirst({
        where: { role: 'teacher' },
        select: { id: true },
      })
      finalTeacherId = teacher?.id || ''
    }

    if (existing) {
      // Update existing
      const updated = await prisma.dailyEmotionSnapshot.update({
        where: { id: existing.id },
        data: {
          mood: moodScore,
          highlight,
          challenge,
          note,
        },
        include: {
          student: { select: { id: true, firstName: true, lastName: true } },
        },
      })
      return successResponse(updated)
    }

    // Create new
    const moodEntry = await prisma.dailyEmotionSnapshot.create({
      data: {
        studentId,
        date: new Date(),
        mood: moodScore,
        highlight,
        challenge,
        note,
        teacherId: finalTeacherId,
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    return successResponse(moodEntry)
  } catch (error) {
    return handleApiError(error)
  }
}
