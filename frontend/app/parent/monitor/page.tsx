"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui"
import { TrendingUp, Brain, Heart, BarChart3 } from "lucide-react"
import { useParentId, useParentChildren } from "@/hooks/api/use-parent"
import { NeuroDNAProfile } from "@/components/neuro/NeuroDNAProfile"
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

export default function ParentMonitorPage() {
  const { data: parentId } = useParentId()
  const { data: children = [] } = useParentChildren(parentId || null)
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)
  const [developmentTrends, setDevelopmentTrends] = useState<any[]>([])
  const [moodTrends, setMoodTrends] = useState<any[]>([])
  const [assessmentHistory, setAssessmentHistory] = useState<any[]>([])
  const [activityStats, setActivityStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const selectedChild = children.find((c: any) => c.id === selectedChildId) || children[0]

  useEffect(() => {
    if (selectedChild) {
      setSelectedChildId(selectedChild.id)
      loadMonitorData(selectedChild.id)
    }
  }, [selectedChild])

  const loadMonitorData = async (studentId: string) => {
    setLoading(true)
    try {
      // Load development trends
      const trendsRes = await fetch(`/napi/monitor/trends/${studentId}`)
      const trends = await trendsRes.json()
      setDevelopmentTrends(trends)

      // Load mood trends
      const moodRes = await fetch(`/napi/monitor/mood/${studentId}`)
      const mood = await moodRes.json()
      setMoodTrends(mood)

      // Load assessment history
      const assessRes = await fetch(`/napi/monitor/assessments/${studentId}`)
      const assess = await assessRes.json()
      setAssessmentHistory(assess)

      // Load activity stats
      const activityRes = await fetch(`/napi/monitor/activities/${studentId}`)
      const activity = await activityRes.json()
      setActivityStats(activity)
    } catch (error) {
      console.error("Error loading monitor data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!selectedChild) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <Card className="rounded-2xl shadow-harmony">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Henüz çocuk kaydı bulunmuyor.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Prepare chart data
  const developmentChartData = developmentTrends.map((t: any) => ({
    date: format(new Date(t.date), "dd MMM", { locale: tr }),
    "Yürütücü": t.executiveScore,
    "Dil": t.languageScore,
    "Duygusal": t.emotionalScore,
    "Kaba Motor": t.grossMotorScore,
    "İnce Motor": t.fineMotorScore,
  }))

  const moodChartData = moodTrends.map((m: any) => ({
    date: format(new Date(m.date), "dd MMM", { locale: tr }),
    mood: m.mood,
  }))

  const assessmentChartData = assessmentHistory.map((a: any) => ({
    date: format(new Date(a.date), "dd MMM", { locale: tr }),
    score: a.avgScore,
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-harmony-soft via-white to-harmony-soft/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold mb-2 bg-gradient-to-r from-harmony-brain to-harmony-heart bg-clip-text text-transparent flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-harmony-brain" />
            Performans Monitörü
          </h1>
          <p className="text-muted-foreground">
            {selectedChild.firstName} {selectedChild.lastName} - Detaylı gelişim analizi
          </p>
        </div>

        {/* Child Selector */}
        {children.length > 1 && (
          <Card className="rounded-2xl shadow-harmony border-0 bg-gradient-to-br from-white to-harmony-soft/30">
            <CardContent className="pt-6">
              <div className="flex gap-2">
                {children.map((child: any) => (
                  <Button
                    key={child.id}
                    variant={selectedChildId === child.id ? "default" : "outline"}
                    onClick={() => setSelectedChildId(child.id)}
                    className="rounded-xl"
                  >
                    {child.firstName} {child.lastName}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-harmony-brain"></div>
          </div>
        ) : (
          <>
            {/* Neuro DNA Profile */}
            <NeuroDNAProfile studentId={selectedChild.id} />

            {/* Development Trends */}
            <Card className="rounded-2xl shadow-harmony border-0 bg-gradient-to-br from-white to-harmony-soft/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-neuro-green" />
                  Gelişim Trendi (Son 30 Gün)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {developmentChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={developmentChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="Yürütücü" stroke="#0F766E" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="Dil" stroke="#F4A261" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="Duygusal" stroke="#FB7185" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="Kaba Motor" stroke="#22C55E" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="İnce Motor" stroke="#6366F1" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-12">
                    Henüz yeterli veri yok.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Mood Trend */}
            <Card className="rounded-2xl shadow-harmony border-0 bg-gradient-to-br from-white to-harmony-soft/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-emotion-rose" />
                  Duygu Durumu Trendi
                </CardTitle>
              </CardHeader>
              <CardContent>
                {moodChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={moodChartData}>
                      <defs>
                        <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FB7185" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#FB7185" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} domain={[1, 5]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="mood"
                        stroke="#FB7185"
                        strokeWidth={2}
                        fill="url(#moodGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-12">
                    Henüz duygu durumu kaydı yok.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Assessment History */}
            <Card className="rounded-2xl shadow-harmony border-0 bg-gradient-to-br from-white to-harmony-soft/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-neuro-purple" />
                  Değerlendirme Geçmişi
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assessmentChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={assessmentChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="score" fill="#6366F1" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-12">
                    Henüz değerlendirme yok.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Activity Stats */}
            {activityStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="rounded-2xl shadow-harmony border-0 bg-gradient-to-br from-white to-harmony-soft/30">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold">Tamamlanan Aktiviteler</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold font-mono text-neuro-green">
                      {activityStats.completed || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activityStats.total ? Math.round((activityStats.completed / activityStats.total) * 100) : 0}% tamamlandı
                    </p>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-harmony border-0 bg-gradient-to-br from-white to-harmony-soft/30">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold">Önerilen Aktiviteler</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold font-mono text-alert-amber">
                      {activityStats.recommended || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Bekleyen öneriler
                    </p>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-harmony border-0 bg-gradient-to-br from-white to-harmony-soft/30">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold">Ortalama Skor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold font-mono text-harmony-brain">
                      {activityStats.avgScore ? activityStats.avgScore.toFixed(1) : "0.0"}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Son 30 gün
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

