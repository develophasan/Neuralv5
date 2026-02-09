"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Label } from "@/components/ui"
import { FileText, Download, Users, BookOpen, TrendingUp, Calendar } from "lucide-react"
import { useTeacherId, useTeacherClasses } from "@/hooks/api/use-teacher"

export default function TeacherReportsPage() {
  const { data: teacherId, isLoading: teacherIdLoading } = useTeacherId()
  const { data: classes = [], isLoading: classesLoading } = useTeacherClasses(teacherId || null)
  const [selectedClassId, setSelectedClassId] = useState<string>("")
  const [students, setStudents] = useState<any[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<string>("")
  const [generating, setGenerating] = useState(false)

  // Load students when class is selected
  useEffect(() => {
    if (selectedClassId) {
      fetch(`/napi/teacher/class/${selectedClassId}`)
        .then(res => res.json())
        .then(data => {
          const classStudents = data?.data?.classStudents?.filter((cs: any) => cs.isActive) || []
          setStudents(classStudents.map((cs: any) => cs.student))
        })
        .catch(err => console.error('Error fetching students:', err))
    } else {
      setStudents([])
    }
    setSelectedStudentId("")
  }, [selectedClassId])

  const handleDownloadReport = async () => {
    if (!selectedStudentId) {
      alert('Lutfen bir ogrenci secin')
      return
    }

    setGenerating(true)
    try {
      const response = await fetch(`/napi/reports/pdf/${selectedStudentId}`)
      if (!response.ok) throw new Error('Rapor olusturulamadi')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ogrenci-rapor-${selectedStudentId}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading report:', error)
      alert('Rapor indirilirken hata olustu')
    } finally {
      setGenerating(false)
    }
  }

  const loading = teacherIdLoading || classesLoading

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yukleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <FileText className="h-8 w-8 text-indigo-500" />
            Raporlar
          </h1>
          <p className="text-muted-foreground">
            Öğrencilerinizin gelişim raporlarını indirin
          </p>
        </div>

        {/* Report Generation Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              PDF Rapor Olustur
            </CardTitle>
            <CardDescription>
              Secili ogrencinin gelisim raporunu PDF olarak indirin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Class Selection */}
            <div>
              <Label className="mb-2 block">Sinif Secin</Label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm"
                >
                  <option value="">Sinif seciniz...</option>
                  {classes.map((cls: any) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} - {cls.ageGroup} yas
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Student Selection */}
            {selectedClassId && (
              <div>
                <Label className="mb-2 block">Ogrenci Secin</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm"
                  >
                    <option value="">Ogrenci seciniz...</option>
                    {students.map((student: any) => (
                      <option key={student.id} value={student.id}>
                        {student.firstName} {student.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Download Button */}
            <Button
              onClick={handleDownloadReport}
              disabled={!selectedStudentId || generating}
              className="w-full"
              size="lg"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Olusturuluyor...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  PDF Rapor Indir
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Report Types Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Gelisim Raporu</h3>
                  <p className="text-sm text-muted-foreground">
                    10 gelisim alaninda detayli degerlendirme sonuclari ve AI destekli analizler
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Donem Raporu</h3>
                  <p className="text-sm text-muted-foreground">
                    Doneme ait tum degerlendirmeler, gunluk kayitlar ve aktivite onerileri
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
