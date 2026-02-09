"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui"
import { Heart, Lightbulb, AlertCircle, Home } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

interface EmotionSnapshot {
  id: string
  date: string
  mood: number // 1-5
  highlight?: string | null
  challenge?: string | null
  note?: string | null
  teacher: {
    id: string
    fullName: string
  }
}

interface EmotionCardProps {
  snapshot: EmotionSnapshot
  studentName: string
}

const moodEmojis = ["😢", "😕", "😐", "😊", "😄"]
const moodColors = [
  "from-red-100 to-red-50",
  "from-orange-100 to-orange-50",
  "from-yellow-100 to-yellow-50",
  "from-green-100 to-green-50",
  "from-emerald-100 to-emerald-50",
]

export function EmotionCard({ snapshot, studentName }: EmotionCardProps) {
  const moodIndex = Math.min(Math.max(snapshot.mood - 1, 0), 4)
  const moodEmoji = moodEmojis[moodIndex]
  const moodColor = moodColors[moodIndex]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card className="rounded-2xl shadow-xl border-0 overflow-hidden glass-card hover-lift">
        {/* Header */}
        <div className={`bg-gradient-to-r ${moodColor} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-heading font-bold">
                {studentName} Bugün
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {format(new Date(snapshot.date), "d MMMM yyyy", { locale: tr })}
              </p>
            </div>
            <div className="text-6xl">{moodEmoji}</div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Öğretmen:</span>
            <span className="font-medium">{snapshot.teacher.fullName}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Highlight */}
          {snapshot.highlight && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-neuro-green/10 to-neuro-green/5 border border-neuro-green/20">
              <Lightbulb className="h-5 w-5 text-neuro-green mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-sm mb-1 text-neuro-green">
                  🧠 Öğrendi
                </h4>
                <p className="text-sm text-foreground">{snapshot.highlight}</p>
              </div>
            </div>
          )}

          {/* Challenge */}
          {snapshot.challenge && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-alert-amber/10 to-alert-amber/5 border border-alert-amber/20">
              <AlertCircle className="h-5 w-5 text-alert-amber mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-sm mb-1 text-alert-amber">
                  🌱 Zorluk
                </h4>
                <p className="text-sm text-foreground">{snapshot.challenge}</p>
              </div>
            </div>
          )}

          {/* Note */}
          {snapshot.note && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-harmony-heart/10 to-harmony-heart/5 border border-harmony-heart/20">
              <Heart className="h-5 w-5 text-harmony-heart mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-sm mb-1 text-harmony-heart">
                  ❤️ Not
                </h4>
                <p className="text-sm text-foreground">{snapshot.note}</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

