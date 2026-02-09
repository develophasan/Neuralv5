"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Sparkles, Home } from "lucide-react"

interface AISummary {
  id: string
  date: string
  progressText: string
  homeRecommendation?: string | null
}

interface AISummaryCardProps {
  summary: AISummary
  studentName: string
}

export function AISummaryCard({ summary, studentName }: AISummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card className="rounded-2xl shadow-xl border-0 glass-card hover-lift bg-gradient-to-br from-neuro-purple/5 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-neuro-purple" />
            <span>AI Günlük Özet</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Text */}
          <div className="p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-neuro-purple/10">
            <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
              {summary.progressText}
            </p>
          </div>

          {/* Home Recommendation */}
          {summary.homeRecommendation && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-harmony-heart/10 to-harmony-heart/5 border border-harmony-heart/20">
              <div className="flex items-center gap-2 mb-2">
                <Home className="h-4 w-4 text-harmony-heart" />
                <h4 className="font-semibold text-sm text-harmony-heart">
                  🏡 Ev Önerisi
                </h4>
              </div>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                {summary.homeRecommendation}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

