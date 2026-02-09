import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// Get or create consent
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get('parentId')
    const studentId = searchParams.get('studentId')

    if (!parentId || !studentId) {
      return NextResponse.json(
        { error: 'parentId and studentId are required' },
        { status: 400 }
      )
    }

    const consent = await prisma.parentConsent.findUnique({
      where: {
        parentId_studentId: {
          parentId,
          studentId,
        },
      },
    })

    return NextResponse.json(consent || { media: false, aiProcessing: false, reports: false })
  } catch (error) {
    console.error('Error fetching consent:', error)
    return NextResponse.json(
      { error: 'Failed to fetch consent' },
      { status: 500 }
    )
  }
}

// Update consent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { parentId, studentId, media, aiProcessing, reports } = body

    if (!parentId || !studentId) {
      return NextResponse.json(
        { error: 'parentId and studentId are required' },
        { status: 400 }
      )
    }

    const consent = await prisma.parentConsent.upsert({
      where: {
        parentId_studentId: {
          parentId,
          studentId,
        },
      },
      update: {
        media,
        aiProcessing,
        reports,
      },
      create: {
        parentId,
        studentId,
        media: media || false,
        aiProcessing: aiProcessing || false,
        reports: reports || false,
      },
    })

    return NextResponse.json(consent)
  } catch (error) {
    console.error('Error updating consent:', error)
    return NextResponse.json(
      { error: 'Failed to update consent' },
      { status: 500 }
    )
  }
}

