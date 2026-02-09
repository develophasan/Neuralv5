/**
 * 📈 TRAJECTORY CHART - V3 Component
 * 
 * Displays 3-month predictive trajectory for a student
 */

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { formatDomainName } from "@/services/clinical-terminology"

interface TrajectoryData {
  domain: string
  currentZScore: number
  projectedZScore: number
  projectedScore: number
  trendSlope: number
  confidence: 'high' | 'medium' | 'low'
  projectionMonths: number
}

export function TrajectoryChart({ studentId }: { studentId: string }) {
  const { data: trajectory, isLoading } = useQuery<TrajectoryData[]>({
    queryKey: ["trajectory", studentId],
    queryFn: async () => {
      const res = await fetch(`/napi/neuro/trajectory/${studentId}`)
      if (!res.ok) return []
      const data = await res.json()
      return data.trajectory || []
    },
  })

  if (isLoading) {
    return (
      <Card className="rounded-2xl shadow-xl border-0 glass-card">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Trajectory hesaplanıyor...</p>
        </CardContent>
      </Card>
    )
  }

  if (!trajectory || trajectory.length === 0) {
    return (
      <Card className="rounded-2xl shadow-xl border-0 glass-card">
        <CardHeader>
          <CardTitle>3 Aylık Projeksiyon</CardTitle>
          <CardDescription>Yeterli veri yok</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Prepare chart data
  const chartData = trajectory.map(t => ({
    domain: formatDomainName(t.domain, 'parent'),
    current: t.currentZScore,
    projected: t.projectedZScore,
    trend: t.trendSlope > 0 ? 'up' : t.trendSlope < 0 ? 'down' : 'stable',
    confidence: t.confidence,
  }))

  return (
    <Card className="rounded-2xl shadow-xl border-0 glass-card hover-lift">
      <CardHeader>
        <CardTitle className="text-xl font-heading flex items-center gap-2">
          <span className="text-neuro-purple">🔮</span> 3 Aylık Projeksiyon
        </CardTitle>
        <CardDescription>Z-score trend tahmini</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
            <XAxis 
              dataKey="domain" 
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 10 }}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="current" 
              stroke="#0F766E" 
              strokeWidth={2}
              name="Mevcut"
              dot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="projected" 
              stroke="#F4A261" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Projeksiyon"
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-6 space-y-2">
          {trajectory.slice(0, 5).map((t) => {
            const domainName = formatDomainName(t.domain, 'parent')
            const TrendIcon = t.trendSlope > 0.05 
              ? TrendingUp 
              : t.trendSlope < -0.05 
              ? TrendingDown 
              : Minus
            
            return (
              <div key={t.domain} className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-harmony-soft/50 to-transparent">
                <div className="flex items-center gap-3">
                  <TrendIcon className={`h-4 w-4 ${
                    t.trendSlope > 0.05 ? 'text-growth-green' 
                    : t.trendSlope < -0.05 ? 'text-risk-red' 
                    : 'text-muted-foreground'
                  }`} />
                  <span className="text-sm font-medium">{domainName}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono">
                    {t.currentZScore.toFixed(2)} → {t.projectedZScore.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t.confidence} güven
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

