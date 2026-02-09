"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts"
import { Brain, TrendingUp, TrendingDown, AlertCircle } from "lucide-react"

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
            🧠 Neuro DNA Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Yükleniyor...</p>
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
            🧠 Neuro DNA Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Henüz değerlendirme verisi yok.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Prepare data for radar chart
  const chartData = [
    { domain: "Yürütücü", value: profile.executiveScore },
    { domain: "Dil", value: profile.languageScore },
    { domain: "Duygusal", value: profile.emotionalScore },
    { domain: "Kaba Motor", value: profile.grossMotorScore },
    { domain: "İnce Motor", value: profile.fineMotorScore },
    { domain: "Mantıksal", value: profile.logicScore },
    { domain: "Yaratıcı", value: profile.creativeScore },
    { domain: "Mekansal", value: profile.spatialScore },
    { domain: "Keşif", value: profile.discoveryScore },
    { domain: "Bağımsızlık", value: profile.independenceScore },
  ]

  return (
    <Card className="rounded-2xl shadow-harmony border-0 bg-gradient-to-br from-white to-harmony-soft/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Brain className="h-6 w-6 text-neuro-purple" />
          🧠 Neuro DNA Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Radar Chart */}
        <div className="h-80 w-full">
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
              />
              <Radar
                name="Gelişim Skoru"
                dataKey="value"
                stroke="#6366F1"
                fill="#6366F1"
                fillOpacity={0.3}
                strokeWidth={2}
              />
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
                    <h4 className="font-semibold text-sm text-neuro-green">Güçlü Alanlar</h4>
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
                    <h4 className="font-semibold text-sm text-risk-red">Dikkat Gereken</h4>
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
                <span className="text-sm text-muted-foreground">Ortalama Gelişim Skoru</span>
                <span className="text-2xl font-bold font-mono text-harmony-brain">
                  {profile.derived.avgScore ? profile.derived.avgScore.toFixed(1) : '0.0'}%
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

