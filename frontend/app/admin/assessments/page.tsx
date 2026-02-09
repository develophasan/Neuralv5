"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge } from "@/components/ui"
import { TrendingUp, Calendar, User, Filter, X } from "lucide-react"
import { useAdminAssessments, useAdminClasses } from "@/hooks/api/use-admin"

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

export default function AdminAssessmentsPage() {
  const [pagination, setPagination] = useState({ page: 1, limit: 20 })
  const [classFilter, setClassFilter] = useState<string>("all")

  // Sınıf listesini çek (Filtre için)
  const { data: classesData } = useAdminClasses({ limit: 100 })
  const classes = classesData?.data || []

  const { data, isLoading: loading, error } = useAdminAssessments({
    page: pagination.page,
    limit: pagination.limit,
    classId: classFilter !== 'all' ? classFilter : undefined,
  })

  // Filtre değişince sayfayı sıfırla
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [classFilter])

  const assessments = data?.data || []
  const paginationData = data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 }

  if (error) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Hata: {error instanceof Error ? error.message : 'Bilinmeyen hata'}</p>
          <Button onClick={() => window.location.reload()}>Yeniden Dene</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-3">
              <TrendingUp className="h-7 w-7 text-primary" />
              Değerlendirmeler
            </h1>
            <p className="text-muted-foreground">Tüm değerlendirmeleri görüntüle ve analiz et</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 p-1 bg-stone-50 border border-stone-200 rounded-2xl shadow-sm px-4">
            <div className="flex items-center gap-2 text-stone-500 mr-2 border-r border-stone-200 pr-4 py-2">
              <Filter className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Sınıf Filtresi</span>
            </div>
            <div className="flex flex-wrap gap-2 py-2">
              <button
                onClick={() => setClassFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${classFilter === "all"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
                  }`}
              >
                Tüm Sınıflar
              </button>
              {classes.map((cls: any) => (
                <button
                  key={cls.id}
                  onClick={() => setClassFilter(cls.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${classFilter === cls.id
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
                    }`}
                >
                  {cls.name}
                </button>
              ))}
              {classFilter !== "all" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-stone-400 hover:text-red-500"
                  onClick={() => setClassFilter("all")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 justify-center py-2 h-auto text-xs">
            4-5: Çok İyi
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 justify-center py-2 h-auto text-xs">
            3-4: İyi
          </Badge>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 justify-center py-2 h-auto text-xs">
            2-3: Orta
          </Badge>
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 justify-center py-2 h-auto text-xs">
            0-2: Gelişim Gerekli
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Değerlendirmeler ({paginationData.total})</CardTitle>
            <CardDescription>
              Sayfa {paginationData.page} / {paginationData.totalPages}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Yükleniyor...</p>
              </div>
            ) : assessments.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">Değerlendirme bulunamadı</p>
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
                                <span className="flex items-center gap-1">
                                  <User className="h-4 w-4" />
                                  {assessment.assessor.fullName}
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
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
                                {score.percentage != null && (
                                  <p className="text-xs opacity-75">
                                    %{score.percentage}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Henüz skor bulunmuyor</p>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {/* Pagination */}
            {paginationData.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <Button
                  variant="outline"
                  disabled={paginationData.page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Önceki
                </Button>
                <span className="text-sm text-muted-foreground">
                  Sayfa {paginationData.page} / {paginationData.totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={paginationData.page === paginationData.totalPages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Sonraki
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

