"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from "@/components/ui"
import { GraduationCap, TrendingUp, Activity, Calendar, ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useTeacherStudent } from "@/hooks/api/use-teacher"
import { NeuroDNAProfile } from "@/components/neuro/NeuroDNAProfile"

export default function TeacherStudentDetailPage() {
  const params = useParams()
  const { data: student, isLoading: loading } = useTeacherStudent(params.id as string | null)

  const calculateAge = (dateOfBirth: string) => {
    const birth = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="min-h-screen p-8">
        <p className="text-center text-muted-foreground">Öğrenci bulunamadı</p>
      </div>
    )
  }

  const age = calculateAge(student.dateOfBirth)
  const classInfo = student.classStudents?.[0]?.class
  const lastAssessment = student.assessments?.[0]

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-8">
          <Link href="/teacher/students">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">
            {student.firstName} {student.lastName}
          </h1>
          <p className="text-muted-foreground">
            {age} yaşında
            {classInfo && ` • ${classInfo.name} (${classInfo.ageGroup} yaş grubu)`}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sol Kolon - Ana Bilgiler */}
          <div className="lg:col-span-2 space-y-6">
            {/* Neuro DNA Profile */}
            <NeuroDNAProfile studentId={student.id} />
            
            {/* Son Değerlendirme */}
            {lastAssessment && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Son Değerlendirme</CardTitle>
                      <CardDescription>
                        {new Date(lastAssessment.assessmentDate).toLocaleDateString("tr-TR")}
                      </CardDescription>
                    </div>
                    <Link href={`/teacher/assessments?studentId=${student.id}`}>
                      <Button variant="outline" size="sm">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Tüm Değerlendirmeler
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {lastAssessment.notes && (
                    <p className="mb-4 text-sm">{lastAssessment.notes}</p>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {lastAssessment.scores.map((score: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 border rounded-lg text-center"
                      >
                        <p className="text-xs text-muted-foreground mb-1">
                          {score.domain.nameTr}
                        </p>
                        {score.score && (
                          <p className="text-lg font-bold">{score.score}/5</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Son Günlük Loglar */}
            {student.dailyLogs && student.dailyLogs.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Son Günlük Kayıtlar</CardTitle>
                    <Link href={`/teacher/daily-logs?studentId=${student.id}`}>
                      <Button variant="outline" size="sm">
                        <Calendar className="mr-2 h-4 w-4" />
                        Tüm Loglar
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {student.dailyLogs.slice(0, 5).map((log: any, idx: number) => (
                      <div key={idx} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            {new Date(log.logDate).toLocaleDateString("tr-TR")}
                          </span>
                          <div className="flex gap-2 text-xs">
                            {log.breakfastEaten && (
                              <span className="px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded-md font-medium">
                                Kahvaltı
                              </span>
                            )}
                            {log.lunchEaten && (
                              <span className="px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded-md font-medium">
                                Öğle Yemeği
                              </span>
                            )}
                            {log.napDurationMinutes && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                {log.napDurationMinutes} dk uyku
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sağ Kolon - Hızlı İşlemler */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hızlı İşlemler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/teacher/assessments?studentId=${student.id}&action=create`}>
                  <Button className="w-full justify-start">
                    <Plus className="mr-2 h-4 w-4" />
                    Yeni Değerlendirme
                  </Button>
                </Link>
                <Link href={`/teacher/daily-logs?studentId=${student.id}&action=create`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    Günlük Log Ekle
                  </Button>
                </Link>
                <Link href={`/teacher/activities?studentId=${student.id}`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="mr-2 h-4 w-4" />
                    Aktiviteler
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Özet</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Toplam Değerlendirme</p>
                    <p className="text-2xl font-bold">{student.assessments?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Günlük Log</p>
                    <p className="text-2xl font-bold">{student.dailyLogs?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

