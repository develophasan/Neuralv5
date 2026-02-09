"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui"
import { Brain, Check } from "lucide-react"
import { motion } from "framer-motion"

interface QuickAssessmentProps {
  studentId: string
  domain: string
  domainName: string
  onComplete?: () => void
}

export function QuickAssessment({
  studentId,
  domain,
  domainName,
  onComplete,
}: QuickAssessmentProps) {
  const [selectedScore, setSelectedScore] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const handleScore = async (score: number) => {
    setSelectedScore(score)
    setLoading(true)

    try {
      // Get current user ID (should be from auth context)
      const response = await fetch("/napi/test/teacher-id")
      const { teacherId } = await response.json()

      await fetch("/napi/quick-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          domain,
          score,
          assessedBy: teacherId,
        }),
      })

      if (onComplete) {
        onComplete()
      }
    } catch (error) {
      console.error("Error creating quick assessment:", error)
    } finally {
      setLoading(false)
    }
  }

  const scores = [
    { emoji: "🔴", value: 1, label: "Düşük", color: "from-risk-red/20 to-risk-red/10" },
    { emoji: "🟡", value: 3, label: "Orta", color: "from-alert-amber/20 to-alert-amber/10" },
    { emoji: "🟢", value: 5, label: "Yüksek", color: "from-neuro-green/20 to-neuro-green/10" },
  ]

  return (
    <Card className="rounded-2xl shadow-harmony border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-neuro-purple" />
          Hızlı Değerlendirme: {domainName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {scores.map((score) => (
            <motion.button
              key={score.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleScore(score.value)}
              disabled={loading}
              className={`
                p-6 rounded-xl border-2 transition-all
                ${
                  selectedScore === score.value
                    ? `bg-gradient-to-br ${score.color} border-current`
                    : "bg-white border-border hover:border-neuro-purple/50"
                }
                ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              <div className="text-4xl mb-2">{score.emoji}</div>
              <div className="text-sm font-medium">{score.label}</div>
              {selectedScore === score.value && (
                <Check className="h-5 w-5 mx-auto mt-2 text-neuro-purple" />
              )}
            </motion.button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

