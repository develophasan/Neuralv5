// Parent: Get development reports for child
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { handleApiError } from '@/lib/api/errors'
import { successResponse } from '@/lib/api/utils'

// GET /api/parent/reports/[studentId] - Get development reports
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params
    // TODO: Verify parent has access
    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') || 'monthly'

    const reports = await prisma.developmentReport.findMany({
      where: {
        studentId: studentId,
        reportType: reportType as 'weekly' | 'monthly' | 'quarterly',
      },
      orderBy: { periodEnd: 'desc' },
      take: 12,
    })

    // If no reports exist, generate summary from assessments
    if (reports.length === 0) {
      const assessments = await prisma.assessment.findMany({
        where: { studentId: studentId },
        include: {
          scores: {
            include: { domain: true },
          },
        },
        orderBy: { assessmentDate: 'desc' },
      })

      // Calculate domain averages
      const domainAverages: Record<string, { score: number; count: number }> = {}
      
      for (const assessment of assessments) {
        for (const score of assessment.scores) {
          const domainCode = score.domain.code
          if (!domainAverages[domainCode]) {
            domainAverages[domainCode] = { score: 0, count: 0 }
          }
          if (score.score) {
            domainAverages[domainCode].score += score.score
            domainAverages[domainCode].count++
          }
        }
      }

      const averages: Record<string, number> = {}
      for (const [code, data] of Object.entries(domainAverages)) {
        if (data.count > 0) {
          averages[code] = data.score / data.count
        }
      }

      return successResponse({
        reports: [],
        summary: {
          domainAverages: averages,
          totalAssessments: assessments.length,
          lastAssessment: assessments[0]?.assessmentDate || null,
        },
      })
    }

    return successResponse({ reports })
  } catch (error) {
    return handleApiError(error)
  }
}

