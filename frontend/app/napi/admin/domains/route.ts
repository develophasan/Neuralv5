// Admin: Development Domains (GET only - for dropdowns)
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { successResponse } from '@/lib/api/utils'

// GET /api/admin/domains - List all development domains
export async function GET() {
  try {
    const domains = await prisma.developmentDomain.findMany({
      orderBy: { nameTr: 'asc' },
    })

    return successResponse(domains)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch domains' },
      { status: 500 }
    )
  }
}

