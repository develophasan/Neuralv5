/**
 * 📄 CLINICAL EXPORT SERVICE
 * 
 * Generates clinical-grade PDF reports for psychologists and professionals.
 * Uses pdf-lib (already in dependencies).
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { prisma } from '@/lib/db/prisma'
import { calculateCohortZScores } from './cohort-z-score-engine'
import { clinicalRisk } from './clinical-risk-matrix'
import { formatDomainName, getClinicalTerm } from './clinical-terminology'
import { predictTrajectory } from './predictive-trajectory'

export interface ClinicalReportData {
  student: {
    id: string
    firstName: string
    lastName: string
    dateOfBirth: Date
    ageInMonths: number
  }
  neuroProfile: {
    executiveScore: number
    languageScore: number
    emotionalScore: number
    grossMotorScore: number
    fineMotorScore: number
    logicScore: number
    creativeScore: number
    spatialScore: number
    discoveryScore: number
    independenceScore: number
  }
  zScores: Record<string, number>
  riskAssessments: Array<{
    domain: string
    zScore: number
    riskLevel: string
    clinicalMeaning: string
  }>
  trajectory: Array<{
    domain: string
    currentZScore: number
    projectedZScore: number
    confidence: string
  }>
  generatedAt: Date
}

/**
 * Generate clinical report data
 */
export async function generateClinicalReportData(studentId: string): Promise<ClinicalReportData> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      neuroProfile: true,
    },
  })

  if (!student || !student.neuroProfile) {
    throw new Error('Student or neuro profile not found')
  }

  const ageInMonths = Math.floor(
    (Date.now() - student.dateOfBirth.getTime()) / (365.25 * 30 * 24 * 60 * 60 * 1000)
  )

  const zScores = await calculateCohortZScores(studentId)
  const trajectory = await predictTrajectory(studentId, 3)

  // Calculate risk assessments for each domain
  const riskAssessments = Object.entries(zScores).map(([domain, zScore]) => {
    const risk = clinicalRisk(zScore, 0) // Slope not available in this context
    return {
      domain,
      zScore,
      riskLevel: risk.level,
      clinicalMeaning: risk.clinicalMeaning,
    }
  })

  return {
    student: {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      dateOfBirth: student.dateOfBirth,
      ageInMonths,
    },
    neuroProfile: {
      executiveScore: student.neuroProfile.executiveScore,
      languageScore: student.neuroProfile.languageScore,
      emotionalScore: student.neuroProfile.emotionalScore,
      grossMotorScore: student.neuroProfile.grossMotorScore,
      fineMotorScore: student.neuroProfile.fineMotorScore,
      logicScore: student.neuroProfile.logicScore,
      creativeScore: student.neuroProfile.creativeScore,
      spatialScore: student.neuroProfile.spatialScore,
      discoveryScore: student.neuroProfile.discoveryScore,
      independenceScore: student.neuroProfile.independenceScore,
    },
    zScores,
    riskAssessments,
    trajectory: trajectory.map(t => ({
      domain: t.domain,
      currentZScore: t.currentZScore,
      projectedZScore: t.projectedZScore,
      confidence: t.confidence,
    })),
    generatedAt: new Date(),
  }
}

/**
 * Generate PDF document
 */
export async function generateClinicalPDF(studentId: string): Promise<Uint8Array> {
  const data = await generateClinicalReportData(studentId)

  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842]) // A4 size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  let y = 800 // Start from top

  // Title
  page.drawText('Child Development Summary', {
    x: 50,
    y,
    size: 20,
    font: boldFont,
    color: rgb(0, 0, 0),
  })
  y -= 30

  // Child Information
  page.drawText(`Name: ${data.student.firstName} ${data.student.lastName}`, {
    x: 50,
    y,
    size: 12,
    font,
  })
  y -= 20

  page.drawText(`Age: ${data.student.ageInMonths} months`, {
    x: 50,
    y,
    size: 12,
    font,
  })
  y -= 20

  page.drawText(`Report Date: ${data.generatedAt.toLocaleDateString('tr-TR')}`, {
    x: 50,
    y,
    size: 12,
    font,
  })
  y -= 40

  // Neuro Profile Scores
  page.drawText('Developmental Domain Scores', {
    x: 50,
    y,
    size: 14,
    font: boldFont,
  })
  y -= 25

  const domains = [
    { key: 'executiveScore', domain: 'executive_functions' },
    { key: 'languageScore', domain: 'language_communication' },
    { key: 'emotionalScore', domain: 'social_emotional' },
    { key: 'grossMotorScore', domain: 'gross_motor' },
    { key: 'fineMotorScore', domain: 'fine_motor' },
    { key: 'logicScore', domain: 'logical_numerical' },
    { key: 'creativeScore', domain: 'creative_expression' },
    { key: 'spatialScore', domain: 'spatial_awareness' },
    { key: 'discoveryScore', domain: 'discovery_world' },
    { key: 'independenceScore', domain: 'self_help' },
  ]

  for (const { key, domain } of domains) {
    const score = data.neuroProfile[key as keyof typeof data.neuroProfile] as number
    const zScore = data.zScores[domain] || 0
    const domainName = formatDomainName(domain, 'clinical')

    page.drawText(`${domainName}: ${score.toFixed(1)}% (Z: ${zScore.toFixed(2)})`, {
      x: 50,
      y,
      size: 10,
      font,
    })
    y -= 18

    if (y < 100) {
      // New page
      const newPage = pdfDoc.addPage([595, 842])
      y = 800
    }
  }

  y -= 20

  // Risk Assessments
  page.drawText('Risk Assessment', {
    x: 50,
    y,
    size: 14,
    font: boldFont,
  })
  y -= 25

  const highRisk = data.riskAssessments.filter(r => r.riskLevel === 'high')
  const mediumRisk = data.riskAssessments.filter(r => r.riskLevel === 'medium')

  if (highRisk.length > 0) {
    page.drawText('High Risk Domains:', {
      x: 50,
      y,
      size: 12,
      font: boldFont,
      color: rgb(0.8, 0, 0),
    })
    y -= 20

    for (const risk of highRisk) {
      const domainName = formatDomainName(risk.domain, 'clinical')
      page.drawText(`• ${domainName}: ${risk.clinicalMeaning}`, {
        x: 70,
        y,
        size: 10,
        font,
      })
      y -= 18
    }
  }

  if (mediumRisk.length > 0) {
    page.drawText('Medium Risk Domains:', {
      x: 50,
      y,
      size: 12,
      font: boldFont,
      color: rgb(0.8, 0.5, 0),
    })
    y -= 20

    for (const risk of mediumRisk) {
      const domainName = formatDomainName(risk.domain, 'clinical')
      page.drawText(`• ${domainName}: ${risk.clinicalMeaning}`, {
        x: 70,
        y,
        size: 10,
        font,
      })
      y -= 18
    }
  }

  // Trajectory Predictions
  y -= 20
  page.drawText('3-Month Trajectory Projections', {
    x: 50,
    y,
    size: 14,
    font: boldFont,
  })
  y -= 25

  for (const pred of data.trajectory.slice(0, 5)) {
    const domainName = formatDomainName(pred.domain, 'clinical')
    const trend = pred.projectedZScore > pred.currentZScore ? '↑' : '↓'
    
    page.drawText(
      `${domainName}: ${pred.currentZScore.toFixed(2)} → ${pred.projectedZScore.toFixed(2)} ${trend} (${pred.confidence} confidence)`,
      {
        x: 50,
        y,
        size: 10,
        font,
      }
    )
    y -= 18
  }

  // Footer
  const pages = pdfDoc.getPages()
  const lastPage = pages[pages.length - 1]
  lastPage.drawText(
    'This report is for professional use only. Not a medical diagnosis.',
    {
      x: 50,
      y: 50,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5),
    }
  )

  return await pdfDoc.save()
}

