import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    const domains = await prisma.developmentDomain.findMany({
      orderBy: { code: 'asc' },
      select: {
        id: true,
        nameTr: true,
        code: true,
        iconName: true,
        color: true
      }
    })

    return NextResponse.json({ success: true, data: domains })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
