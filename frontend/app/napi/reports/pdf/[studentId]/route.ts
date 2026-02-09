import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

// Turkish character to ASCII mapping - handles all Turkish special characters
function toASCII(text: string | null | undefined): string {
  if (!text) return ''
  const map: Record<string, string> = {
    'ş': 's', 'Ş': 'S',
    'ğ': 'g', 'Ğ': 'G',
    'ü': 'u', 'Ü': 'U',
    'ö': 'o', 'Ö': 'O',
    'ç': 'c', 'Ç': 'C',
    'ı': 'i', 'İ': 'I',
  }
  return text.replace(/[şŞğĞüÜöÖçÇıİ]/g, (char) => map[char] || char)
}

// Generate comprehensive PDF report for a student
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params
    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') || 'monthly'

    // Fetch student with all related data
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        classStudents: {
          where: { isActive: true },
          include: { class: true },
        },
        assessments: {
          take: 10,
          orderBy: { assessmentDate: 'desc' },
          include: {
            scores: {
              include: { domain: true },
            },
            assessor: { select: { fullName: true } },
          },
        },
        dailyLogs: {
          take: 30,
          orderBy: { logDate: 'desc' },
        },
        neuroProfile: true,
        parentStudents: {
          include: { parent: { select: { fullName: true, email: true, phone: true } } },
        },
      },
    })

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Ogrenci bulunamadi' },
        { status: 404 }
      )
    }

    // Create PDF
    const pdfDoc = await PDFDocument.create()
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    // Page 1: Cover & Summary
    let page = pdfDoc.addPage([595, 842]) // A4
    const { width, height } = page.getSize()
    let y = height - 50

    // Header
    page.drawRectangle({
      x: 0,
      y: height - 120,
      width,
      height: 120,
      color: rgb(0.25, 0.47, 0.85),
    })

    page.drawText('HARMONI ANAOKULU', {
      x: 50,
      y: height - 50,
      size: 24,
      font: helveticaBold,
      color: rgb(1, 1, 1),
    })

    page.drawText('Gelisim Raporu', {
      x: 50,
      y: height - 80,
      size: 16,
      font: helvetica,
      color: rgb(1, 1, 1),
    })

    const reportDate = new Date().toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    page.drawText(toASCII(reportDate), {
      x: 50,
      y: height - 100,
      size: 12,
      font: helvetica,
      color: rgb(1, 1, 1),
    })

    // Student Info Box
    y = height - 160
    page.drawRectangle({
      x: 40,
      y: y - 120,
      width: width - 80,
      height: 120,
      color: rgb(0.95, 0.95, 0.98),
      borderColor: rgb(0.8, 0.8, 0.85),
      borderWidth: 1,
    })

    page.drawText('OGRENCI BILGILERI', {
      x: 55,
      y: y - 25,
      size: 12,
      font: helveticaBold,
      color: rgb(0.25, 0.47, 0.85),
    })

    const classInfo = student.classStudents?.[0]?.class
    const birthDate = new Date(student.dateOfBirth)
    const age = new Date().getFullYear() - birthDate.getFullYear()

    const infoLines = [
      `Ad Soyad: ${toASCII(student.firstName)} ${toASCII(student.lastName)}`,
      `Yas: ${age} yasinda`,
      `Sinif: ${toASCII(classInfo?.name || 'Atanmamis')}`,
      `Cinsiyet: ${student.gender === 'male' ? 'Erkek' : 'Kiz'}`,
    ]

    infoLines.forEach((line, i) => {
      page.drawText(toASCII(line), {
        x: 55,
        y: y - 50 - (i * 20),
        size: 11,
        font: helvetica,
        color: rgb(0.2, 0.2, 0.2),
      })
    })

    // Parent Info
    const parent = student.parentStudents?.[0]?.parent
    if (parent) {
      page.drawText(toASCII(`Veli: ${parent.fullName}`), {
        x: 300,
        y: y - 50,
        size: 11,
        font: helvetica,
        color: rgb(0.2, 0.2, 0.2),
      })
      page.drawText(toASCII(`Tel: ${parent.phone || '-'}`), {
        x: 300,
        y: y - 70,
        size: 11,
        font: helvetica,
        color: rgb(0.2, 0.2, 0.2),
      })
    }

    // Assessment Summary
    y = y - 160
    page.drawText('DEGERLENDIRME OZETI', {
      x: 50,
      y,
      size: 14,
      font: helveticaBold,
      color: rgb(0.25, 0.47, 0.85),
    })

    y -= 30
    const lastAssessment = student.assessments?.[0]
    if (lastAssessment?.scores) {
      // Calculate average
      const scores = lastAssessment.scores.filter((s: any) => s.score != null)
      const avgScore = scores.length > 0
        ? (scores.reduce((sum: number, s: any) => sum + s.score, 0) / scores.length).toFixed(1)
        : '-'

      page.drawText(`Ortalama Puan: ${avgScore} / 5`, {
        x: 50,
        y,
        size: 12,
        font: helveticaBold,
        color: rgb(0.2, 0.6, 0.2),
      })

      y -= 25
      const assessmentDateStr = new Date(lastAssessment.assessmentDate).toLocaleDateString('tr-TR')
      page.drawText(toASCII(`Son Degerlendirme: ${assessmentDateStr}`), {
        x: 50,
        y,
        size: 11,
        font: helvetica,
        color: rgb(0.4, 0.4, 0.4),
      })

      // Domain scores table
      y -= 40
      page.drawText('Gelisim Alanlari:', {
        x: 50,
        y,
        size: 12,
        font: helveticaBold,
        color: rgb(0.3, 0.3, 0.3),
      })

      y -= 20
      lastAssessment.scores.forEach((score: any, index: number) => {
        if (y < 100) {
          // Add new page if needed
          page = pdfDoc.addPage([595, 842])
          y = height - 50
        }

        const domainName = toASCII(score.domain?.nameTr || `Alan ${index + 1}`)
        const scoreValue = score.score || '-'
        const barWidth = score.score ? (score.score / 5) * 200 : 0

        // Domain name
        page.drawText(domainName, {
          x: 60,
          y,
          size: 10,
          font: helvetica,
          color: rgb(0.3, 0.3, 0.3),
        })

        // Score bar background
        page.drawRectangle({
          x: 250,
          y: y - 3,
          width: 200,
          height: 12,
          color: rgb(0.9, 0.9, 0.9),
        })

        // Score bar fill
        const barColor = score.score >= 4 ? rgb(0.2, 0.7, 0.3) :
                         score.score >= 3 ? rgb(0.9, 0.7, 0.1) :
                         rgb(0.9, 0.3, 0.2)
        page.drawRectangle({
          x: 250,
          y: y - 3,
          width: barWidth,
          height: 12,
          color: barColor,
        })

        // Score text
        page.drawText(`${scoreValue}/5`, {
          x: 460,
          y,
          size: 10,
          font: helveticaBold,
          color: rgb(0.3, 0.3, 0.3),
        })

        y -= 25
      })
    } else {
      page.drawText('Henuz degerlendirme yapilmamis.', {
        x: 50,
        y,
        size: 11,
        font: helvetica,
        color: rgb(0.5, 0.5, 0.5),
      })
    }

    // Recommendations Section
    if (y > 200) {
      y -= 40
      page.drawText('ONERILER', {
        x: 50,
        y,
        size: 14,
        font: helveticaBold,
        color: rgb(0.25, 0.47, 0.85),
      })

      y -= 25
      const weakDomains = lastAssessment?.scores?.filter((s: any) => s.score && s.score < 3) || []
      if (weakDomains.length > 0) {
        page.drawText('Gelistirilmesi gereken alanlar:', {
          x: 50,
          y,
          size: 11,
          font: helveticaBold,
          color: rgb(0.8, 0.4, 0.1),
        })
        y -= 20
        weakDomains.forEach((wd: any) => {
          page.drawText(toASCII(`- ${wd.domain?.nameTr || 'Alan'}`), {
            x: 60,
            y,
            size: 10,
            font: helvetica,
            color: rgb(0.4, 0.4, 0.4),
          })
          y -= 18
        })
      } else {
        page.drawText('Tum alanlarda iyi performans gosteriyor!', {
          x: 50,
          y,
          size: 11,
          font: helvetica,
          color: rgb(0.2, 0.6, 0.2),
        })
      }
    }

    // Footer
    page.drawText('Bu rapor Harmoni OS tarafindan otomatik olusturulmustur.', {
      x: 50,
      y: 30,
      size: 8,
      font: helvetica,
      color: rgb(0.6, 0.6, 0.6),
    })

    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save()

    // Use ASCII-safe filename
    const safeFileName = toASCII(`${student.firstName}_${student.lastName}_Rapor`).replace(/\s/g, '_')
    
    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeFileName}.pdf"`,
      },
    })
  } catch (error: any) {
    console.error('PDF Generation Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
