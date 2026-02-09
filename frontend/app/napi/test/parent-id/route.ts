import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'

export async function GET() {
  try {
    // Try to get from session first
    const session = await getServerSession(authOptions)
    
    if (session?.user?.id && session?.user?.role === 'parent') {
      const parent = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          email: true,
          fullName: true,
        },
      })
      
      if (parent) {
        return NextResponse.json({
          success: true,
          parent,
        })
      }
    }

    // Fallback: İlk veliyi bul (test için)
    const parent = await prisma.user.findFirst({
      where: {
        role: 'parent',
      },
      select: {
        id: true,
        email: true,
        fullName: true,
      },
    })

    if (!parent) {
      return NextResponse.json({ error: 'No parent found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      parent,
    })
  } catch (error: any) {
    console.error('Error fetching parent:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}

