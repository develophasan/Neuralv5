/**
 * Clinical PDF Export API
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateClinicalPDF } from '@/services/clinical-export'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params

    const pdfBytes = await generateClinicalPDF(studentId)

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="clinical-report-${studentId}.pdf"`,
      },
    })
  } catch (error: any) {
    console.error('Error generating clinical PDF:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}

