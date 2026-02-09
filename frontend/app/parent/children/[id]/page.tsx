"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from "@/components/ui"
import { Heart, TrendingUp, TrendingDown, Activity, Calendar, ArrowLeft, ArrowUp, ArrowDown } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useParentId, useParentChild } from "@/hooks/api/use-parent"
import { useAISummary } from "@/hooks/api/use-ai"
import { NeuroDNAProfile } from "@/components/neuro/NeuroDNAProfile"
import { TrajectoryChart } from "@/components/neuro/TrajectoryChart"
import { ActivityRecommendations } from "@/components/neuro/ActivityRecommendations"
import { motion } from "framer-motion"
import { Download } from "lucide-react"

interface StudentDetail {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender?: string
  classStudents: Array<{
    class: {
      name: string
      ageGroup: string
    }
  }>
  assessments: Array<{
    id: string
    assessmentDate: string
    notes?: string
    scores: Array<{
      domain: {
        nameTr: string
        color?: string
      }
      score?: number
      percentage?: number
    }>
  }>
  dailyLogs: Array<{
    logDate: string
    breakfastEaten?: boolean
    lunchEaten?: boolean
    napDurationMinutes?: number
    generalNotes?: string
  }>
  activityRecommendations: Array<{
    id: string
    activity: {
      title: string
      description?: string
    }
    domain: {
      nameTr: string
    }
    reason?: string
  }>
}

export default function ParentChildDetailPage() {
  const params = useParams()
  const { data: parentId, isLoading: parentIdLoading } = useParentId()
  const { data: child, isLoading: childLoading } = useParentChild(parentId || null, params.id as string | null)
  const { data: aiSummary, isLoading: aiSummaryLoading } = useAISummary(params.id as string | null)

  const loading = parentIdLoading || childLoading

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

  if (!child) {
    return (
      <div className="min-h-screen p-8">
        <p className="text-center text-muted-foreground">Çocuk bulunamadı</p>
      </div>
    )
  }

  const age = calculateAge(child.dateOfBirth)
  const classInfo = child.classStudents?.[0]?.class
  const lastAssessment = child.assessments?.[0]

  // Mock trend data - replace with real API call
  const trends = [
    { domain: 'Language', trend: 'up', value: '+5%' },
    { domain: 'Emotional', trend: 'down', value: '-2%' },
    { domain: 'Motor', trend: 'up', value: '+3%' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-harmony-soft via-white to-harmony-soft/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Back Button */}
        <Link href="/parent/dashboard">
          <Button variant="ghost" className="mb-4 rounded-xl">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri
          </Button>
        </Link>

        {/* V2 Design: Sol - Large Avatar, Name, Age | Orta - Radar Chart | Sağ - Trend Arrows */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol: Large Avatar, Name, Age */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col items-center lg:items-start"
          >
            <Card className="rounded-2xl shadow-xl border-0 glass-card w-full hover-lift">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center lg:items-start space-y-4">
                  <div className="h-32 w-32 rounded-full bg-gradient-to-br from-harmony-heart to-harmony-brain flex items-center justify-center text-6xl shadow-xl">
                    👶
                  </div>
                  <div className="text-center lg:text-left">
                    <h1 className="text-3xl font-heading font-bold gradient-text-harmony mb-2">
                      {child.firstName} {child.lastName}
                    </h1>
                    <p className="text-lg text-muted-foreground font-mono">
                      {age} yaşında
                    </p>
                    {classInfo && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {classInfo.name} • {classInfo.ageGroup}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Orta: Radar Chart (Neuro DNA) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <NeuroDNAProfile studentId={child.id} />
          </motion.div>

          {/* Sağ: Trend Arrows */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <Card className="rounded-2xl shadow-xl border-0 glass-card hover-lift">
              <CardHeader>
                <CardTitle className="text-lg font-heading">Trend Arrows</CardTitle>
                <CardDescription>Development trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trends.map((t, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/50 backdrop-blur-sm">
                      <span className="text-sm font-medium">{t.domain}</span>
                      <div className="flex items-center gap-2">
                        {t.trend === 'up' ? (
                          <ArrowUp className="h-4 w-4 text-neuro-green" />
                        ) : (
                          <ArrowDown className="h-4 w-4 text-risk-red" />
                        )}
                        <span className={`text-sm font-mono font-bold ${t.trend === 'up' ? 'text-neuro-green' : 'text-risk-red'}`}>
                          {t.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* V3 Components: Trajectory & Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrajectoryChart studentId={child.id} />
          <ActivityRecommendations studentId={child.id} />
        </div>

        {/* Clinical Export Button */}
        <Card className="rounded-2xl shadow-xl border-0 glass-card hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Klinik Rapor</h3>
                <p className="text-sm text-muted-foreground">
                  Psikolog ve uzmanlar için detaylı PDF raporu
                </p>
              </div>
              <Button
                onClick={async () => {
                  try {
                    const res = await fetch(`/napi/neuro/clinical-export/${child.id}`)
                    if (!res.ok) throw new Error('PDF oluşturulamadı')
                    const blob = await res.blob()
                    const url = window.URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `clinical-report-${child.id}.pdf`
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    window.URL.revokeObjectURL(url)
                  } catch (error) {
                    console.error('Error downloading PDF:', error)
                    alert('PDF indirilemedi. Lütfen tekrar deneyin.')
                  }
                }}
                className="rounded-xl"
              >
                <Download className="h-4 w-4 mr-2" />
                PDF İndir
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Alt: AI Summary Block - V3 Format */}
        {aiSummaryLoading && (
          <Card className="rounded-2xl shadow-xl border-0 glass-card">
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">AI özeti hazırlanıyor...</p>
            </CardContent>
          </Card>
        )}
        {aiSummary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="rounded-2xl shadow-xl border-0 glass-card hover-lift">
              <CardHeader>
                <CardTitle className="text-xl font-heading flex items-center gap-2">
                  <span className="text-neuro-purple">🧠</span> AI Summary
                </CardTitle>
                <CardDescription>AI-powered development insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* V3: summary field */}
                  <p className="text-sm leading-relaxed text-foreground">
                    {aiSummary.summary}
                  </p>
                  
                  {/* V3: riskExplanation */}
                  {aiSummary.riskExplanation && (
                    <div className="p-4 rounded-xl bg-gradient-to-br from-alert-amber/10 to-alert-amber/5 border border-alert-amber/20">
                      <h4 className="font-semibold text-sm text-alert-amber mb-2">⚠️ Risk Açıklaması</h4>
                      <p className="text-sm text-foreground">{aiSummary.riskExplanation}</p>
                    </div>
                  )}
                  
                  {/* V3: homeActivity */}
                  {aiSummary.homeActivity && (
                    <div className="p-4 rounded-xl bg-gradient-to-br from-harmony-heart/10 to-harmony-heart/5 border border-harmony-heart/20">
                      <h4 className="font-semibold text-sm text-harmony-heart mb-2">🏡 Ev Aktivitesi</h4>
                      <p className="text-sm text-foreground">{aiSummary.homeActivity}</p>
                    </div>
                  )}
                  
                  {/* V3: positiveNote */}
                  {aiSummary.positiveNote && (
                    <div className="p-4 rounded-xl bg-gradient-to-br from-neuro-green/10 to-neuro-green/5 border border-neuro-green/20">
                      <h4 className="font-semibold text-sm text-neuro-green mb-2">💚 Pozitif Not</h4>
                      <p className="text-sm text-foreground">{aiSummary.positiveNote}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Additional Info - Collapsed by default */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Son Değerlendirme */}
          {lastAssessment && (
            <Card className="rounded-2xl shadow-xl border-0 glass-card hover-lift">
                <CardHeader>
                  <CardTitle>Son Değerlendirme</CardTitle>
                  <CardDescription>
                    {new Date(lastAssessment.assessmentDate).toLocaleDateString("tr-TR")}
                  </CardDescription>
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
                        {score.percentage && (
                          <p className="text-xs text-muted-foreground">
                            %{score.percentage}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Önerilen Aktiviteler */}
          {child.activityRecommendations && child.activityRecommendations.length > 0 && (
            <Card className="rounded-2xl shadow-xl border-0 glass-card hover-lift">
                <CardHeader>
                  <CardTitle>Önerilen Aktiviteler</CardTitle>
                  <CardDescription>
                    Çocuğunuzun gelişimi için önerilen aktiviteler
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {child.activityRecommendations.map((rec: any) => (
                      <div
                        key={rec.id}
                        className="p-4 border rounded-lg"
                      >
                        <h4 className="font-semibold mb-1">{rec.activity.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {rec.domain.nameTr}
                        </p>
                        {rec.reason && (
                          <p className="text-xs text-muted-foreground">
                            {rec.reason}
                          </p>
                        )}
                        {rec.activity.description && (
                          <p className="text-sm mt-2">{rec.activity.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

        </div>

        {/* Son Günlük Loglar - Optional Section */}
        {child.dailyLogs && child.dailyLogs.length > 0 && (
          <Card className="rounded-2xl shadow-xl border-0 glass-card hover-lift">
                <CardHeader>
                  <CardTitle>Son Günlük Kayıtlar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {child.dailyLogs.slice(0, 5).map((log: any, idx: number) => (
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
                        {log.generalNotes && (
                          <p className="text-sm text-muted-foreground">
                            {log.generalNotes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
            </Card>
          )}
      </div>
    </div>
  )
}

