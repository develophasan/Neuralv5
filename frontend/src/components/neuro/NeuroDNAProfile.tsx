"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts"
import { Brain, TrendingUp, TrendingDown, AlertCircle, Info } from "lucide-react"

interface NeuroProfile {
  executiveScore: number
  languageScore: number
  emotionalScore: number
  grossMotorScore: number
  fineMotorScore: number
  logicScore: number
  creativeScore: number
  spatialScore: number
  discoveryScore: number
  independenceScore: number
  derived: {
    dominantAreas: string[]
    riskAreas: string[]
    growthPotential: string[]
    maxScore: number
    minScore: number
    avgScore: number
  }
}

interface NeuroDNAProfileProps {
  studentId: string
}

export function NeuroDNAProfile({ studentId }: NeuroDNAProfileProps) {
  const [profile, setProfile] = useState<NeuroProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/napi/neuro/profile/${studentId}`)
      .then((res) => res.json())
      .then((data) => {
        setProfile(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error fetching neuro profile:", err)
        setLoading(false)
      })
  }, [studentId])

  if (loading) {
    return (
      <Card className="rounded-2xl shadow-harmony">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-neuro-purple" />
            🧠 Neuro DNA Profile (V3)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Analiz ediliyor...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!profile) {
    return (
      <Card className="rounded-2xl shadow-harmony">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-neuro-purple" />
            🧠 Neuro DNA Profile (V3)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">Henüz Neuro-Analiz verisi yok.</p>
              <p className="text-xs text-muted-foreground">Z-Skor motoru haftalık çalışır.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Prepare data for radar chart
  const chartData = [
    { domain: "Yürütücü", value: profile.executiveScore, fullMark: 100 },
    { domain: "Dil", value: profile.languageScore, fullMark: 100 },
    { domain: "Duygusal", value: profile.emotionalScore, fullMark: 100 },
    { domain: "Kaba Motor", value: profile.grossMotorScore, fullMark: 100 },
    { domain: "İnce Motor", value: profile.fineMotorScore, fullMark: 100 },
    { domain: "Mantıksal", value: profile.logicScore, fullMark: 100 },
    { domain: "Yaratıcı", value: profile.creativeScore, fullMark: 100 },
    { domain: "Mekansal", value: profile.spatialScore, fullMark: 100 },
    { domain: "Keşif", value: profile.discoveryScore, fullMark: 100 },
    { domain: "Bağımsızlık", value: profile.independenceScore, fullMark: 100 },
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-bold text-sm mb-1">{label}</p>
          <p className="text-xs text-indigo-600 font-semibold">
            %{payload[0].value.toFixed(1)} Persentil
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            (Yaşıtlarına göre konumu)
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="rounded-2xl shadow-harmony border-0 bg-gradient-to-br from-white to-harmony-soft/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Brain className="h-6 w-6 text-neuro-purple" />
            🧠 Neuro DNA Profile
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-[200px] text-xs">
                  Bu grafik öğrencinin gelişimini yaşıtlarına göre kıyaslar (Persentil). %50 ortalamayı temsil eder.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Radar Chart */}
        <div className="h-80 w-full relative">
          <div className="absolute top-0 right-0 z-10">
            <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500">
              V3 Neuro-Engine Aktif
            </span>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis
                dataKey="domain"
                tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: "#94a3b8", fontSize: 10 }}
                tickFormatter={(value) => `%${value}`}
              />
              <Radar
                name="Gelişim Persentili"
                dataKey="value"
                stroke="#6366F1"
                fill="#6366F1"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <RechartsTooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Derived Insights */}
        {profile.derived && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Dominant Areas */}
              {profile.derived.dominantAreas && profile.derived.dominantAreas.length > 0 && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-neuro-green/10 to-neuro-green/5 border border-neuro-green/20">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-neuro-green" />
                    <h4 className="font-semibold text-sm text-neuro-green">Güçlü Alanlar (%85+)</h4>
                  </div>
                  <ul className="space-y-1">
                    {profile.derived.dominantAreas.map((area, i) => (
                      <li key={i} className="text-xs text-muted-foreground">
                        • {area}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Risk Areas */}
              {profile.derived.riskAreas && profile.derived.riskAreas.length > 0 && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-risk-red/10 to-risk-red/5 border border-risk-red/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-risk-red" />
                    <h4 className="font-semibold text-sm text-risk-red">Destek Gereken (%25-)</h4>
                  </div>
                  <ul className="space-y-1">
                    {profile.derived.riskAreas.map((area, i) => (
                      <li key={i} className="text-xs text-muted-foreground">
                        • {area}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Growth Potential */}
              {profile.derived.growthPotential && profile.derived.growthPotential.length > 0 && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-alert-amber/10 to-alert-amber/5 border border-alert-amber/20">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="h-4 w-4 text-alert-amber" />
                    <h4 className="font-semibold text-sm text-alert-amber">Gelişim Potansiyeli</h4>
                  </div>
                  <ul className="space-y-1">
                    {profile.derived.growthPotential.map((area, i) => (
                      <li key={i} className="text-xs text-muted-foreground">
                        • {area}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Average Score */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-muted-foreground block">Genel Gelişim Endeksi</span>
                  <span className="text-[10px] text-muted-foreground/60">(Tüm alanların persentil ortalaması)</span>
                </div>
                <span className="text-3xl font-bold font-mono text-harmony-brain text-indigo-600">
                  %{profile.derived.avgScore ? profile.derived.avgScore.toFixed(0) : '0'}
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
