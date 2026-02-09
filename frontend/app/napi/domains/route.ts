// List all development domains
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { handleApiError } from '@/lib/api/errors'
import { successResponse } from '@/lib/api/utils'

// GET /api/domains - List all domains
export async function GET(request: NextRequest) {
  try {
    const domains = await prisma.developmentDomain.findMany({
      orderBy: { nameTr: 'asc' },
    })

    return successResponse(domains)
  } catch (error) {
    return handleApiError(error)
  }
}
