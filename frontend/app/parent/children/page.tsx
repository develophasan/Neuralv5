"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from "@/components/ui"
import { Heart, Activity, Calendar, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParentId, useParentChildren } from "@/hooks/api/use-parent"

export default function ParentChildrenPage() {
  const { data: parentId, isLoading: parentIdLoading } = useParentId()
  const { data: children = [], isLoading: childrenLoading } = useParentChildren(parentId || null)

  const loading = parentIdLoading || childrenLoading

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

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Başlık */}
        <div className="mb-8">
          <Link href="/parent/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">Çocuklarım</h1>
          <p className="text-muted-foreground">
            Tüm çocuklarınızın listesi ve gelişim durumları
          </p>
        </div>

        {children.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center py-8 text-muted-foreground">
                Henüz çocuk kaydı bulunmuyor.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {children.map((child: any) => {
              const age = calculateAge(child.dateOfBirth)
              const lastAssessment = child.assessments?.[0]
              const avgScore = lastAssessment && lastAssessment.scores
                ? lastAssessment.scores.reduce((sum: number, s: any) => sum + (s.score || 0), 0) /
                  lastAssessment.scores.length
                : 0
              const classInfo = child.classStudents?.[0]?.class

              return (
                <Link key={child.id} href={`/parent/children/${child.id}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-4">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <Heart className="h-8 w-8 text-primary" />
                        </div>
                        {avgScore > 0 && (
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">
                              {avgScore.toFixed(1)}
                            </div>
                            <p className="text-xs text-muted-foreground">Ortalama Skor</p>
                          </div>
                        )}
                      </div>
                      <CardTitle>
                        {child.firstName} {child.lastName}
                      </CardTitle>
                      <CardDescription>
                        {age} yaşında
                        {classInfo && ` • ${classInfo.name}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {lastAssessment && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Son değerlendirme:{" "}
                              {new Date(lastAssessment.assessmentDate).toLocaleDateString("tr-TR")}
                            </span>
                          </div>
                        )}
                        {child.activityRecommendations && child.activityRecommendations.length > 0 && (
                          <div className="flex items-center gap-2 text-sm">
                            <Activity className="h-4 w-4 text-primary" />
                            <span className="text-primary font-medium">
                              {child.activityRecommendations.length} aktivite önerisi
                            </span>
                          </div>
                        )}
                      </div>
                      <Button className="w-full mt-4">Detayları Gör</Button>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

