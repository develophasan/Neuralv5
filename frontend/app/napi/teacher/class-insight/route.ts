import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { handleApiError } from '@/lib/api/errors'
import { successResponse } from '@/lib/api/utils'
import { generateClassInsight, ClassDailyStats } from '@/lib/ai/gemini-service'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const teacherId = searchParams.get('teacherId')
        const classIdParam = searchParams.get('classId')

        if (!teacherId) {
            return NextResponse.json({ success: false, error: 'Teacher ID required' }, { status: 400 })
        }

        // Get teacher's classes to verify access and pick a default if classId not provided
        const teacherClasses = await prisma.classTeacher.findMany({
            where: { teacherId },
            include: { class: true }
        })

        if (teacherClasses.length === 0) {
            return NextResponse.json({ success: false, error: 'No classes found for teacher' }, { status: 404 })
        }

        // Use requested class or default to first
        let targetClass = teacherClasses[0].class
        if (classIdParam) {
            const found = teacherClasses.find(tc => tc.classId === classIdParam)
            if (found) {
                targetClass = found.class
            }
        }

        // Get students in this class
        const classStudents = await prisma.classStudent.findMany({
            where: { classId: targetClass.id, isActive: true },
            select: { studentId: true }
        })

        const studentIds = classStudents.map(cs => cs.studentId)
        const studentCount = studentIds.length

        if (studentCount === 0) {
            return successResponse({
                groupMode: "Sınıf Boş",
                focusArea: "-",
                advice: "Henüz öğrenci kaydı yok.",
                insightTitle: "Sınıf Analizi"
            })
        }

        // Define "Today" range (local time is tricky in server, using simple UTC start/end of day approximation or just recent)
        // Ideally should use teacher's timezone, but for now looking at records created > 12 hours ago is a rough "today"
        // Better: use startOfDay in UTC
        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)

        // Fetch Moods
        const moods = await prisma.moodTracker.findMany({
            where: {
                studentId: { in: studentIds },
                logDate: { gte: todayStart }
            }
        })

        // Fetch Daily Logs
        const logs = await prisma.dailyLog.findMany({
            where: {
                studentId: { in: studentIds },
                logDate: { gte: todayStart }
            }
        })

        // --- AGGREGATION LOGIC ---

        // 1. Avg Stress
        let totalStress = 0
        moods.forEach(m => totalStress += m.stressLevel)
        const avgStress = moods.length > 0 ? totalStress / moods.length : 0

        // 2. Mood Distribution
        const moodDist: Record<string, number> = {}
        moods.forEach(m => {
            moodDist[m.mood] = (moodDist[m.mood] || 0) + 1
        })

        // Find dominant mood
        let dominantMood = 'Nötr'
        let maxCount = 0
        Object.entries(moodDist).forEach(([mood, count]) => {
            if (count > maxCount) {
                maxCount = count
                dominantMood = mood
            }
        })

        // 3. Sleep Issues (based on quality or nap duration)
        // Logic: sleepQuality = 'difficult' or 'restless'
        const lowSleepCount = logs.filter(l =>
            l.sleepQuality === 'difficult' || l.sleepQuality === 'restless' || (l.napDurationMinutes || 0) < 30
        ).length

        // 4. Food Issues
        // Logic: didn't eat lunch or breakfast (if recorded)
        const lowFoodCount = logs.filter(l =>
            (l.lunchEaten === false) || (l.breakfastEaten === false)
        ).length

        // Prepare stats for AI
        const classStats: ClassDailyStats = {
            className: targetClass.name,
            studentCount,
            avgStress,
            moodDistribution: moodDist,
            lowSleepCount,
            lowFoodCount,
            dominantMood
        }

        // If practically no data, return a generic "early day" message without burning AI tokens?
        // User wants "Real-time Insight". Even empty data is an insight ("Sakin başlangıç").
        // But let's call AI only if we have at least SOME logs or moods, otherwise hardcode "Veri Bekleniyor"

        let insight
        if (moods.length === 0 && logs.length === 0) {
            insight = {
                groupMode: "Güne Başlangıç",
                focusArea: "Gözlem",
                advice: "Henüz günlük veri girişi yapılmadı. Öğrencilerinizi gözlemleyerek güne başlayabilirsiniz.",
                insightTitle: "Veri Bekleniyor"
            }
        } else {
            insight = await generateClassInsight(classStats)
        }

        return successResponse(insight)

    } catch (error) {
        return handleApiError(error)
    }
}
