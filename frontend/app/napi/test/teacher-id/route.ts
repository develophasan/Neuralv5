import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'

export async function GET() {
  try {
    // Try to get from session first
    const session = await getServerSession(authOptions)
    
    if (session?.user?.id && session?.user?.role === 'teacher') {
      const teacher = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          email: true,
          fullName: true,
        },
      })
      
      if (teacher) {
        return NextResponse.json({
          success: true,
          teacher,
        })
      }
    }

    // Fallback: İlk öğretmeni bul (test için)
    const teacher = await prisma.user.findFirst({
      where: {
        role: 'teacher',
      },
      select: {
        id: true,
        email: true,
        fullName: true,
      },
    })

    if (!teacher) {
      return NextResponse.json({ error: 'No teacher found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      teacher,
    })
  } catch (error: any) {
    console.error('Error fetching teacher:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}

