/**
 * Test endpoint to list all students
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
  try {
    const students = await prisma.student.findMany({
      where: { isActive: true },
      take: 10,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      count: students.length,
      students,
    })
  } catch (error: any) {
    console.error('Test endpoint error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

