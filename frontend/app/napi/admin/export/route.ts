import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import * as XLSX from 'xlsx'

// Helper to convert Turkish characters
function toSafeString(str: string | null | undefined): string {
  if (!str) return ''
  return str
}

// GET /api/admin/export/users - Export users to Excel
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'users'

    let data: any[] = []
    let filename = 'export.xlsx'
    let sheetName = 'Data'

    switch (type) {
      case 'users':
        const users = await prisma.user.findMany({
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            phone: true,
            isActive: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        })
        
        data = users.map(u => ({
          'ID': u.id,
          'Ad Soyad': toSafeString(u.fullName),
          'E-posta': u.email,
          'Rol': u.role === 'admin' ? 'Yonetici' : u.role === 'teacher' ? 'Ogretmen' : 'Veli',
          'Telefon': toSafeString(u.phone),
          'Durum': u.isActive ? 'Aktif' : 'Pasif',
          'Kayit Tarihi': new Date(u.createdAt).toLocaleDateString('tr'),
        }))
        filename = 'kullanicilar.xlsx'
        sheetName = 'Kullanicilar'
        break

      case 'students':
        const students = await prisma.student.findMany({
          include: {
            classStudents: {
              where: { isActive: true },
              include: { class: true },
            },
            parentStudents: {
              include: { parent: { select: { fullName: true, email: true, phone: true } } },
            },
          },
          orderBy: { createdAt: 'desc' },
        })

        data = students.map(s => ({
          'ID': s.id,
          'Ad': toSafeString(s.firstName),
          'Soyad': toSafeString(s.lastName),
          'Cinsiyet': s.gender === 'male' ? 'Erkek' : 'Kiz',
          'Dogum Tarihi': new Date(s.dateOfBirth).toLocaleDateString('tr'),
          'Sinif': toSafeString(s.classStudents?.[0]?.class?.name),
          'Veli Adi': toSafeString(s.parentStudents?.[0]?.parent?.fullName),
          'Veli E-posta': toSafeString(s.parentStudents?.[0]?.parent?.email),
          'Veli Telefon': toSafeString(s.parentStudents?.[0]?.parent?.phone),
          'Kayit Tarihi': new Date(s.createdAt).toLocaleDateString('tr'),
        }))
        filename = 'ogrenciler.xlsx'
        sheetName = 'Ogrenciler'
        break

      case 'classes':
        const classes = await prisma.class.findMany({
          include: {
            _count: { select: { classStudents: true } },
            classTeachers: { include: { teacher: { select: { fullName: true } } } },
          },
          orderBy: { createdAt: 'desc' },
        })

        data = classes.map(c => ({
          'ID': c.id,
          'Sinif Adi': toSafeString(c.name),
          'Yas Grubu': toSafeString(c.ageGroup),
          'Kapasite': c.capacity,
          'Ogrenci Sayisi': c._count.classStudents,
          'Ogretmen': toSafeString(c.classTeachers?.[0]?.teacher?.fullName),
          'Durum': c.isActive ? 'Aktif' : 'Pasif',
          'Olusturma Tarihi': new Date(c.createdAt).toLocaleDateString('tr'),
        }))
        filename = 'siniflar.xlsx'
        sheetName = 'Siniflar'
        break

      case 'assessments':
        const assessments = await prisma.assessment.findMany({
          include: {
            student: { select: { firstName: true, lastName: true } },
            assessor: { select: { fullName: true } },
            scores: { include: { domain: true } },
          },
          orderBy: { assessmentDate: 'desc' },
          take: 500,
        })

        data = assessments.map(a => {
          const row: any = {
            'ID': a.id,
            'Ogrenci': `${toSafeString(a.student.firstName)} ${toSafeString(a.student.lastName)}`,
            'Degerlendiren': toSafeString(a.assessor.fullName),
            'Tarih': new Date(a.assessmentDate).toLocaleDateString('tr'),
          }
          
          // Add each domain score
          a.scores.forEach(score => {
            const domainName = toSafeString(score.domain?.nameTr) || 'Alan'
            row[domainName] = score.score || '-'
          })
          
          // Calculate average
          const validScores = a.scores.filter(s => s.score != null)
          row['Ortalama'] = validScores.length > 0 
            ? (validScores.reduce((sum, s) => sum + (s.score || 0), 0) / validScores.length).toFixed(2)
            : '-'
          
          return row
        })
        filename = 'degerlendirmeler.xlsx'
        sheetName = 'Degerlendirmeler'
        break

      default:
        return NextResponse.json({ success: false, error: 'Invalid export type' }, { status: 400 })
    }

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

    // Auto-size columns
    const maxWidth = 50
    const colWidths = Object.keys(data[0] || {}).map(key => ({
      wch: Math.min(maxWidth, Math.max(key.length, ...data.map(row => String(row[key] || '').length)))
    }))
    worksheet['!cols'] = colWidths

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error: any) {
    console.error('Export Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
