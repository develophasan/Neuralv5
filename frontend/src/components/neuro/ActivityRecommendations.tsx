/**
 * 🎯 ACTIVITY RECOMMENDATIONS - V3 Component
 * 
 * Displays adaptive activity recommendations based on Z-scores and risk levels
 */

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from "@/components/ui"
import { Activity, AlertCircle, CheckCircle } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"

interface ActivityRecommendation {
  activity: {
    id: string
    title: string
    description: string | null
    domain: string
    ageMin: number
    ageMax: number
    difficultyLevel: number
  }
  reason: string
  priority: 'high' | 'medium' | 'low'
  domain: string
  domainName: string
}

export function ActivityRecommendations({ studentId }: { studentId: string }) {
  const { data: recommendations, isLoading } = useQuery<ActivityRecommendation[]>({
    queryKey: ["activity-recommendations", studentId],
    queryFn: async () => {
      const res = await fetch(`/napi/neuro/activities/${studentId}`)
      if (!res.ok) return []
      const data = await res.json()
      return data.recommendations || []
    },
  })

  if (isLoading) {
    return (
      <Card className="rounded-2xl shadow-xl border-0 glass-card">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Aktiviteler hazırlanıyor...</p>
        </CardContent>
      </Card>
    )
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <Card className="rounded-2xl shadow-xl border-0 glass-card">
        <CardHeader>
          <CardTitle>Önerilen Aktiviteler</CardTitle>
          <CardDescription>Şu anda öneri yok</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const highPriority = recommendations.filter(r => r.priority === 'high')
  const mediumPriority = recommendations.filter(r => r.priority === 'medium')
  const lowPriority = recommendations.filter(r => r.priority === 'low')

  return (
    <Card className="rounded-2xl shadow-xl border-0 glass-card hover-lift">
      <CardHeader>
        <CardTitle className="text-xl font-heading flex items-center gap-2">
          <Activity className="h-5 w-5 text-harmony-heart" />
          Önerilen Aktiviteler
        </CardTitle>
        <CardDescription>Z-skor ve risk seviyesine göre öneriler</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* High Priority */}
        {highPriority.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-4 w-4 text-risk-red" />
              <h4 className="font-semibold text-sm text-risk-red">Yüksek Öncelik</h4>
            </div>
            {highPriority.map((rec, idx) => (
              <motion.div
                key={rec.activity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 rounded-xl bg-gradient-to-br from-risk-red/10 to-risk-red/5 border border-risk-red/20 mb-3"
              >
                <h5 className="font-semibold text-sm mb-1">{rec.activity.title}</h5>
                <p className="text-xs text-muted-foreground mb-2">{rec.domainName}</p>
                <p className="text-sm text-foreground">{rec.reason}</p>
                {rec.activity.description && (
                  <p className="text-xs text-muted-foreground mt-2">{rec.activity.description}</p>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Medium Priority */}
        {mediumPriority.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-4 w-4 text-alert-amber" />
              <h4 className="font-semibold text-sm text-alert-amber">Orta Öncelik</h4>
            </div>
            {mediumPriority.map((rec, idx) => (
              <motion.div
                key={rec.activity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 rounded-xl bg-gradient-to-br from-alert-amber/10 to-alert-amber/5 border border-alert-amber/20 mb-3"
              >
                <h5 className="font-semibold text-sm mb-1">{rec.activity.title}</h5>
                <p className="text-xs text-muted-foreground mb-2">{rec.domainName}</p>
                <p className="text-sm text-foreground">{rec.reason}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Low Priority */}
        {lowPriority.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-4 w-4 text-growth-green" />
              <h4 className="font-semibold text-sm text-growth-green">Düşük Öncelik</h4>
            </div>
            {lowPriority.map((rec, idx) => (
              <motion.div
                key={rec.activity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 rounded-xl bg-gradient-to-br from-growth-green/10 to-growth-green/5 border border-growth-green/20 mb-3"
              >
                <h5 className="font-semibold text-sm mb-1">{rec.activity.title}</h5>
                <p className="text-xs text-muted-foreground mb-2">{rec.domainName}</p>
                <p className="text-sm text-foreground">{rec.reason}</p>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

