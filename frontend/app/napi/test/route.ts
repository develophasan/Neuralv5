import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    // Test: Tüm gelişim alanlarını getir
    const domains = await prisma.developmentDomain.findMany()
    
    // Test: Kullanıcıları getir
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
      },
    })

    // Test: Öğrencileri getir
    const students = await prisma.student.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
      },
    })

    // Test: Sınıfları getir
    const classes = await prisma.class.findMany({
      include: {
        classStudents: {
          include: {
            student: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        domains: domains.length,
        users: users.length,
        students: students.length,
        classes: classes.length,
        details: {
          domains,
          users,
          students,
          classes,
        },
      },
    })
  } catch (error: any) {
    console.error('Test API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}

