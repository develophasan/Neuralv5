import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { updateNeuroProfile, calculateWeeklyTrends, detectRisks } from '@/services/neuro-engine'

// Get or calculate Neuro Profile for a student
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params

    // Check if profile exists
    let profile
    try {
      profile = await prisma.childNeuroProfile.findUnique({
        where: { studentId },
        include: { student: true },
      })
    } catch (tableError: any) {
      // If table doesn't exist, return null
      if (tableError.code === 'P2021' || tableError.message?.includes('does not exist')) {
        console.warn('Child neuro profiles table does not exist yet. Run db:push to create it.')
        return NextResponse.json(null)
      }
      throw tableError
    }

    // If no profile exists, calculate it using Neuro Engine
    if (!profile) {
      await updateNeuroProfile(studentId)
      profile = await prisma.childNeuroProfile.findUnique({
        where: { studentId },
        include: { student: true },
      })
    }

    // Return empty profile if still not found
    if (!profile) {
      return NextResponse.json({
        success: true,
        profile: null,
        message: 'No profile data available'
      })
    }

    // Calculate derived fields
    const scores = [
      profile.executiveScore,
      profile.languageScore,
      profile.emotionalScore,
      profile.grossMotorScore,
      profile.fineMotorScore,
      profile.logicScore,
      profile.creativeScore,
      profile.spatialScore,
      profile.discoveryScore,
      profile.independenceScore,
    ]

    const maxScore = Math.max(...scores)
    const minScore = Math.min(...scores.filter(s => s > 0))
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.filter(s => s > 0).length

    const domainNames = [
      'Yürütücü İşlevler',
      'Dil ve İletişim',
      'Sosyal ve Duygusal',
      'Kaba Motor',
      'İnce Motor',
      'Mantıksal ve Sayısal',
      'Yaratıcı İfade',
      'Mekansal Farkındalık',
      'Dünya Keşfi',
      'Öz-Bakım ve Bağımsızlık',
    ]

    const dominantAreas = domainNames
      .map((name, i) => ({ name, score: scores[i] }))
      .filter((item) => item.score >= avgScore * 1.1)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item) => item.name)

    const riskAreas = domainNames
      .map((name, i) => ({ name, score: scores[i] }))
      .filter((item) => item.score > 0 && item.score < avgScore * 0.8)
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
      .map((item) => item.name)

    const growthPotential = domainNames
      .map((name, i) => ({ name, score: scores[i] }))
      .filter((item) => item.score > 0 && item.score < avgScore && item.score >= avgScore * 0.8)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.name)

    return NextResponse.json({
      ...profile,
      derived: {
        dominantAreas,
        riskAreas,
        growthPotential,
        maxScore,
        minScore,
        avgScore: Math.round(avgScore * 10) / 10,
      },
    })
  } catch (error) {
    console.error('Error fetching neuro profile:', error)
    // Return null instead of error to prevent page crash
    return NextResponse.json(null)
  }
}

// Recalculate profile using Neuro Engine
export async function POST(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const { studentId } = params

    // Use Neuro Engine to update profile
    await updateNeuroProfile(studentId)

    // Get updated profile with trends and risks
    const profile = await prisma.childNeuroProfile.findUnique({
      where: { studentId },
      include: { student: true },
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found after update' },
        { status: 404 }
      )
    }

    // Calculate trends and risks
    const trends = await calculateWeeklyTrends(studentId, 4)
    const risks = await detectRisks(studentId)

    // Calculate derived fields (same as GET)
    const scores = [
      profile.executiveScore,
      profile.languageScore,
      profile.emotionalScore,
      profile.grossMotorScore,
      profile.fineMotorScore,
      profile.logicScore,
      profile.creativeScore,
      profile.spatialScore,
      profile.discoveryScore,
      profile.independenceScore,
    ]

    const maxScore = Math.max(...scores)
    const minScore = Math.min(...scores.filter(s => s > 0))
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.filter(s => s > 0).length

    const domainNames = [
      'Yürütücü İşlevler',
      'Dil ve İletişim',
      'Sosyal ve Duygusal',
      'Kaba Motor',
      'İnce Motor',
      'Mantıksal ve Sayısal',
      'Yaratıcı İfade',
      'Mekansal Farkındalık',
      'Dünya Keşfi',
      'Öz-Bakım ve Bağımsızlık',
    ]

    const dominantAreas = domainNames
      .map((name, i) => ({ name, score: scores[i] }))
      .filter((item) => item.score >= avgScore * 1.1)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item) => item.name)

    const riskAreas = domainNames
      .map((name, i) => ({ name, score: scores[i] }))
      .filter((item) => item.score > 0 && item.score < avgScore * 0.8)
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
      .map((item) => item.name)

    const growthPotential = domainNames
      .map((name, i) => ({ name, score: scores[i] }))
      .filter((item) => item.score > 0 && item.score < avgScore && item.score >= avgScore * 0.8)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.name)

    return NextResponse.json({
      ...profile,
      derived: {
        dominantAreas,
        riskAreas,
        growthPotential,
        maxScore,
        minScore,
        avgScore: Math.round(avgScore * 10) / 10,
      },
      trends,
      risks,
    })
  } catch (error) {
    console.error('Error recalculating neuro profile:', error)
    return NextResponse.json(
      { error: 'Failed to recalculate neuro profile' },
      { status: 500 }
    )
  }
}

