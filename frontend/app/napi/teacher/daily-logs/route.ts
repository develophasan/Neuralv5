// Teacher: List and create daily logs
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { handleApiError } from '@/lib/api/errors'
import { getBody } from '@/lib/api/middleware'
import { CreateDailyLogSchema } from '@/lib/validations'
import { successResponse } from '@/lib/api/utils'

// GET /api/teacher/daily-logs - List daily logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')
    const studentId = searchParams.get('studentId')

    if (!teacherId) {
      return NextResponse.json({ success: false, error: 'Teacher ID required' }, { status: 400 })
    }

    // Öğretmenin sınıflarındaki öğrencileri bul
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

    if (studentIds.length === 0) {
      return successResponse([])
    }

    const whereClause: any = {
      studentId: { in: studentIds },
    }

    if (studentId) {
      whereClause.studentId = studentId
    }

    const logs = await prisma.dailyLog.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        logDate: 'desc',
      },
      take: 50,
    })

    return successResponse(logs)
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/teacher/daily-logs - Create daily log
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      studentId, 
      classId,
      logDate, 
      breakfastEaten, 
      lunchEaten, 
      snackEaten, 
      mealNotes,
      napStartTime, 
      napEndTime,
      napDurationMinutes,
      sleepQuality,
      toiletVisits,
      accidents,
      toiletNotes, 
      generalNotes,
      loggedBy
    } = body

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Student ID is required' },
        { status: 400 }
      )
    }

    const log = await prisma.dailyLog.create({
      data: {
        studentId,
        classId: classId || studentId, // fallback
        logDate: logDate ? new Date(logDate) : new Date(),
        loggedBy: loggedBy || 'system',
        breakfastEaten,
        lunchEaten,
        snackEaten,
        mealNotes,
        napStartTime,
        napEndTime,
        napDurationMinutes,
        sleepQuality,
        toiletVisits: toiletVisits || 0,
        accidents: accidents || 0,
        toiletNotes,
        generalNotes,
      },
      include: {
        student: true,
      },
    })

    return successResponse(log, 'Daily log created successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

