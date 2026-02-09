import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const studentId = searchParams.get('studentId')

        if (!studentId) {
            return NextResponse.json({ success: false, error: 'Student ID required' }, { status: 400 })
        }

        // Get today's range
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const assessment = await prisma.assessment.findFirst({
            where: {
                studentId,
                assessmentDate: {
                    gte: today,
                    lt: tomorrow
                }
            },
            include: {
                scores: true
            }
        })

        return NextResponse.json({ success: true, data: assessment })

    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Internal Server Error' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { studentId, domainId, score, assessedBy } = body

        if (!studentId || !domainId || !score || !assessedBy) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Get today's start and end
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        // 1. Find or create Assessment for today
        let assessment = await prisma.assessment.findFirst({
            where: {
                studentId,
                assessmentDate: {
                    gte: today,
                    lt: tomorrow
                }
            }
        })

        if (!assessment) {
            assessment = await prisma.assessment.create({
                data: {
                    studentId,
                    assessedBy,
                    assessmentDate: new Date(), // Now
                }
            })
        }

        // 2. Upsert Score for the domain
        const assessmentScore = await prisma.assessmentScore.upsert({
            where: {
                assessmentId_domainId: {
                    assessmentId: assessment.id,
                    domainId: domainId
                }
            },
            update: {
                score: score,
                // Calculate percentage based on max score 5
                percentage: (score / 5) * 100,
                observationNotes: 'Quick assessment via One-Tap interface'
            },
            create: {
                assessmentId: assessment.id,
                domainId: domainId,
                score: score,
                percentage: (score / 5) * 100,
                observationNotes: 'Quick assessment via One-Tap interface'
            }
        })

        return NextResponse.json({ success: true, data: assessmentScore })

    } catch (error: any) {
        console.error('Quick Assessment Error:', error)
        return NextResponse.json(
            { success: false, error: error.message || 'Internal Server Error' },
            { status: 500 }
        )
    }
}
