"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from "@/components/ui"
import { TrendingUp, ArrowLeft, Download, Calendar, Target, Award, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useParentId, useParentChildren } from "@/hooks/api/use-parent"
import { useMemo, Suspense, useState } from "react"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts"

export const dynamic = 'force-dynamic'

function ParentReportsContent() {
  const { data: parentId, isLoading: parentIdLoading } = useParentId()
  const searchParams = useSearchParams()
  const studentId = searchParams.get('studentId')
  const { data: children = [], isLoading: childrenLoading } = useParentChildren(parentId || null)
  const [selectedChild, setSelectedChild] = useState<string | null>(null)

  const loading = parentIdLoading || childrenLoading

  const reports = useMemo(() => {
    if (!children.length) return []
    
    return children
      .filter((child: any) => !studentId || child.id === studentId)
      .map((child: any) => ({
        studentId: child.id,
        studentName: `${child.firstName} ${child.lastName}`,
        firstName: child.firstName,
        assessments: child.assessments || [],
        dateOfBirth: child.dateOfBirth,
      }))
  }, [children, studentId])

  // Prepare radar chart data from latest assessment
  const getRadarData = (assessments: any[]) => {
    if (!assessments.length || !assessments[0].scores) return []
    
    return assessments[0].scores.map((score: any) => ({
      domain: score.domain?.nameTr?.substring(0, 12) || 'Alan',
      fullName: score.domain?.nameTr || 'Alan',
      score: score.score || 0,
      fullMark: 5,
    }))
  }

  // Prepare trend data from all assessments
  const getTrendData = (assessments: any[]) => {
    if (!assessments.length) return []
    
    // Get last 6 assessments, reverse to show oldest first
    const recentAssessments = [...assessments].slice(0, 6).reverse()
    
    return recentAssessments.map((assessment: any) => {
      const data: any = {
        date: new Date(assessment.assessmentDate).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }),
        fullDate: new Date(assessment.assessmentDate).toLocaleDateString('tr-TR'),
      }
      
      // Add each domain score
      if (assessment.scores) {
        assessment.scores.forEach((score: any) => {
          const key = score.domain?.code || `domain_${score.domainId}`
          data[key] = score.score || 0
          data[`${key}_name`] = score.domain?.nameTr || 'Alan'
        })
        
        // Calculate average
        const validScores = assessment.scores.filter((s: any) => s.score != null)
        data.average = validScores.length > 0
          ? validScores.reduce((sum: number, s: any) => sum + s.score, 0) / validScores.length
          : 0
      }
      
      return data
    })
  }

  // Calculate statistics
  const getStats = (assessments: any[]) => {
    if (!assessments.length || !assessments[0].scores) {
      return { average: 0, strongest: null, weakest: null, trend: 'stable' }
    }
    
    const latestScores = assessments[0].scores.filter((s: any) => s.score != null)
    const average = latestScores.length > 0
      ? latestScores.reduce((sum: number, s: any) => sum + s.score, 0) / latestScores.length
      : 0
    
    const sorted = [...latestScores].sort((a: any, b: any) => (b.score || 0) - (a.score || 0))
    const strongest = sorted[0]
    const weakest = sorted[sorted.length - 1]
    
    // Calculate trend
    let trend = 'stable'
    if (assessments.length >= 2) {
      const prevScores = assessments[1].scores?.filter((s: any) => s.score != null) || []
      const prevAvg = prevScores.length > 0
        ? prevScores.reduce((sum: number, s: any) => sum + s.score, 0) / prevScores.length
        : 0
      if (average > prevAvg + 0.3) trend = 'up'
      else if (average < prevAvg - 0.3) trend = 'down'
    }
    
    return { average, strongest, weakest, trend }
  }

  const handleDownloadPdf = async (studentId: string, studentName: string) => {
    try {
      const response = await fetch(`/napi/reports/pdf/${studentId}`)
      if (!response.ok) throw new Error('PDF indirilemedi')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${studentName.replace(/\s/g, '_')}_Gelisim_Raporu.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('PDF download error:', error)
      alert('PDF indirme sirasinda hata olustu')
    }
  }

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

  // Domain colors for the chart
  const domainColors = [
    '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6',
    '#ef4444', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
  ]

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <Link href="/parent/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">Gelisim Raporlari</h1>
          <p className="text-muted-foreground">
            Cocugunuzun gelisim analizi ve trend grafikleri
          </p>
        </div>

        {reports.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center py-8 text-muted-foreground">
                Henuz rapor bulunmuyor.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {reports.map((report: any) => {
              const radarData = getRadarData(report.assessments)
              const trendData = getTrendData(report.assessments)
              const stats = getStats(report.assessments)
              
              return (
                <div key={report.studentId} className="space-y-6">
                  {/* Child Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">{report.studentName}</h2>
                      <p className="text-muted-foreground">
                        {report.assessments.length} degerlendirme
                      </p>
                    </div>
                    <Button 
                      onClick={() => handleDownloadPdf(report.studentId, report.studentName)}
                      variant="outline"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      PDF Indir
                    </Button>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Target className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Ortalama</p>
                            <p className="text-2xl font-bold">{stats.average.toFixed(1)}/5</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                            <Award className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">En Guclu</p>
                            <p className="text-sm font-medium truncate max-w-[100px]">
                              {stats.strongest?.domain?.nameTr || '-'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Gelistirilmeli</p>
                            <p className="text-sm font-medium truncate max-w-[100px]">
                              {stats.weakest?.domain?.nameTr || '-'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                            stats.trend === 'up' ? 'bg-green-100' : 
                            stats.trend === 'down' ? 'bg-red-100' : 'bg-gray-100'
                          }`}>
                            <TrendingUp className={`h-5 w-5 ${
                              stats.trend === 'up' ? 'text-green-600' : 
                              stats.trend === 'down' ? 'text-red-600 rotate-180' : 'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Trend</p>
                            <p className="text-sm font-medium">
                              {stats.trend === 'up' ? 'Yukseliyor' : 
                               stats.trend === 'down' ? 'Dusuyor' : 'Sabit'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Charts Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Radar Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Gelisim Profili</CardTitle>
                        <CardDescription>
                          Son degerlendirmeye gore alan dagilimi
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {radarData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={350}>
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                              <PolarGrid stroke="#e5e7eb" />
                              <PolarAngleAxis 
                                dataKey="domain" 
                                tick={{ fontSize: 11, fill: '#6b7280' }}
                              />
                              <PolarRadiusAxis 
                                angle={30} 
                                domain={[0, 5]} 
                                tick={{ fontSize: 10 }}
                              />
                              <Radar
                                name="Puan"
                                dataKey="score"
                                stroke="#8b5cf6"
                                fill="#8b5cf6"
                                fillOpacity={0.4}
                                strokeWidth={2}
                              />
                              <Tooltip 
                                formatter={(value: number) => [`${value}/5`, 'Puan']}
                                labelFormatter={(label: string, payload: any) => {
                                  if (payload && payload[0]) {
                                    return payload[0].payload.fullName
                                  }
                                  return label
                                }}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                            Henuz veri yok
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Trend Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Gelisim Trendi</CardTitle>
                        <CardDescription>
                          Zaman icindeki ortalama puan degisimi
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {trendData.length > 1 ? (
                          <ResponsiveContainer width="100%" height={350}>
                            <AreaChart data={trendData}>
                              <defs>
                                <linearGradient id="colorAverage" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                              <XAxis 
                                dataKey="date" 
                                tick={{ fontSize: 11 }}
                                stroke="#9ca3af"
                              />
                              <YAxis 
                                domain={[0, 5]} 
                                tick={{ fontSize: 11 }}
                                stroke="#9ca3af"
                              />
                              <Tooltip 
                                formatter={(value: number) => [value.toFixed(1), 'Ortalama']}
                                labelFormatter={(label: string, payload: any) => {
                                  if (payload && payload[0]) {
                                    return payload[0].payload.fullDate
                                  }
                                  return label
                                }}
                              />
                              <Area
                                type="monotone"
                                dataKey="average"
                                stroke="#8b5cf6"
                                fill="url(#colorAverage)"
                                strokeWidth={3}
                                dot={{ fill: '#8b5cf6', strokeWidth: 2 }}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                            Trend icin en az 2 degerlendirme gerekli
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Assessment History */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Degerlendirme Gecmisi</CardTitle>
                      <CardDescription>
                        Tum degerlendirmelerin detayli gorunumu
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {report.assessments.length === 0 ? (
                        <p className="text-center py-4 text-muted-foreground">
                          Henuz degerlendirme bulunmuyor.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {report.assessments.map((assessment: any, idx: number) => {
                            const avgScore = assessment.scores && assessment.scores.length > 0
                              ? assessment.scores.reduce((sum: number, s: any) => sum + (s.score || 0), 0) /
                                assessment.scores.length
                              : 0

                            return (
                              <div key={idx} className="p-4 border rounded-xl hover:bg-muted/50 transition-colors">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">
                                      {new Date(assessment.assessmentDate).toLocaleDateString("tr-TR", {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      })}
                                    </span>
                                  </div>
                                  {avgScore > 0 && (
                                    <span className={`text-lg font-bold px-3 py-1 rounded-full ${
                                      avgScore >= 4 ? 'bg-green-100 text-green-700' :
                                      avgScore >= 3 ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-red-100 text-red-700'
                                    }`}>
                                      {avgScore.toFixed(1)}/5
                                    </span>
                                  )}
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                  {assessment.scores && assessment.scores.map((score: any, scoreIdx: number) => (
                                    <div
                                      key={scoreIdx}
                                      className="p-3 bg-muted/30 rounded-lg text-center"
                                    >
                                      <p className="text-xs text-muted-foreground mb-1 truncate" title={score.domain?.nameTr}>
                                        {score.domain?.nameTr}
                                      </p>
                                      {score.score && (
                                        <div className="flex items-center justify-center gap-1">
                                          <span className={`text-lg font-bold ${
                                            score.score >= 4 ? 'text-green-600' :
                                            score.score >= 3 ? 'text-yellow-600' :
                                            'text-red-600'
                                          }`}>
                                            {score.score}
                                          </span>
                                          <span className="text-xs text-muted-foreground">/5</span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ParentReportsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Yukleniyor...</div>}>
      <ParentReportsContent />
    </Suspense>
  )
}
