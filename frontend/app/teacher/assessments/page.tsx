"use client"
export const dynamic = "force-dynamic"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge } from "@/components/ui"
import { TrendingUp, Plus, ArrowRight, Calendar, User } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useTeacherId, useTeacherAssessments } from "@/hooks/api/use-teacher"
import { Suspense } from "react"

// Skor rengini hesapla
const getScoreColor = (score: number) => {
  if (score >= 4) return "bg-green-100 text-green-800 border-green-200"
  if (score >= 3) return "bg-blue-100 text-blue-800 border-blue-200"
  if (score >= 2) return "bg-yellow-100 text-yellow-800 border-yellow-200"
  return "bg-red-100 text-red-800 border-red-200"
}

// Ortalama skoru hesapla
const calculateAverage = (scores: any[]) => {
  if (!scores || scores.length === 0) return 0
  const validScores = scores.filter(s => s.score != null)
  if (validScores.length === 0) return 0
  const sum = validScores.reduce((acc, s) => acc + (s.score || 0), 0)
  return (sum / validScores.length).toFixed(1)
}

function AssessmentsContent() {
  const { data: teacherId, isLoading: teacherIdLoading } = useTeacherId()
  const searchParams = useSearchParams()
  const studentId = searchParams.get('studentId')
  const { data: assessments = [], isLoading: assessmentsLoading } = useTeacherAssessments(teacherId || null, studentId || null)

  const loading = teacherIdLoading || assessmentsLoading

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
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <TrendingUp className="h-7 w-7 text-primary" />
              Değerlendirmeler
            </h1>
            <p className="text-muted-foreground">
              Öğrencilerinizin gelişim değerlendirmeleri
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex gap-1 flex-wrap">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                4-5: Çok İyi
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                3-4: İyi
              </Badge>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
                2-3: Orta
              </Badge>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                0-2: Gelişim
              </Badge>
            </div>
            <Link href="/teacher/assessments/new">
              <Button className="rounded-xl w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Yeni Değerlendirme
              </Button>
            </Link>
          </div>
        </div>

        {assessments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground mb-4">
                Henüz değerlendirme bulunmuyor.
              </p>
              <Link href="/teacher/assessments/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Ilk Degerlendirmeyi Yap
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {assessments.map((assessment: any) => {
              const avgScore = calculateAverage(assessment.scores)
              const avgScoreNum = parseFloat(avgScore as string)

              return (
                <Card key={assessment.id} className="border hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold ${getScoreColor(avgScoreNum)}`}>
                          {avgScore}
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {assessment.student.firstName} {assessment.student.lastName}
                          </CardTitle>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(assessment.assessmentDate).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge className={getScoreColor(avgScoreNum)}>
                        Ortalama: {avgScore}/5
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {assessment.notes && (
                      <p className="text-sm mb-4 p-3 bg-muted/50 rounded-lg italic">
                        &ldquo;{assessment.notes}&rdquo;
                      </p>
                    )}
                    {assessment.scores && assessment.scores.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                        {assessment.scores.map((score: any, idx: number) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg border text-center ${getScoreColor(score.score || 0)}`}
                          >
                            <p className="text-xs font-medium mb-1 truncate">
                              {score.domain?.nameTr || 'Bilinmeyen'}
                            </p>
                            {score.score != null && (
                              <p className="text-xl font-bold">{score.score}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Henüz skor bulunmuyor</p>
                    )}
                    <Link href={`/teacher/students/${assessment.student.id}`}>
                      <Button variant="outline" size="sm">
                        Ogrenci Detayi
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function TeacherAssessmentsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Yukleniyor...</div>}>
      <AssessmentsContent />
    </Suspense>
  )
}
