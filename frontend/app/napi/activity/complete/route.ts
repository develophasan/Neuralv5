import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { recommendationId } = body

        if (!recommendationId) {
            return NextResponse.json(
                { error: 'Recommendation ID is required' },
                { status: 400 }
            )
        }

        // 1. Get the recommendation to find the student
        const recommendation = await prisma.activityRecommendation.findUnique({
            where: { id: recommendationId },
            include: { student: true }
        })

        if (!recommendation) {
            return NextResponse.json(
                { error: 'Recommendation not found' },
                { status: 404 }
            )
        }

        // 2. Transact: Update status and increment points
        const result = await prisma.$transaction(async (tx) => {
            // Mark as completed
            const updatedRec = await tx.activityRecommendation.update({
                where: { id: recommendationId },
                data: {
                    status: 'completed',
                    completedAt: new Date()
                }
            })

            // Award points (e.g. 10 points per activity)
            const POINTS_PER_ACTIVITY = 10
            const updatedStudent = await tx.student.update({
                where: { id: recommendation.studentId },
                data: {
                    neuroPoints: {
                        increment: POINTS_PER_ACTIVITY
                    }
                }
            })

            return { updatedRec, updatedStudent }
        })

        return NextResponse.json({
            success: true,
            message: 'Activity completed and points awarded!',
            data: {
                recommendationStatus: result.updatedRec.status,
                earnedPoints: 10,
                totalPoints: result.updatedStudent.neuroPoints
            }
        })

    } catch (error) {
        console.error('Error completing activity:', error)
        return NextResponse.json(
            { error: 'Failed to complete activity' },
            { status: 500 }
        )
    }
}
