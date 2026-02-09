"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui"
import { Heart, Sparkles, ChevronLeft, ChevronRight } from "lucide-react"
import { useParentId, useParentChildren } from "@/hooks/api/use-parent"
import { EmotionCard } from "@/components/emotions/EmotionCard"
import { AISummaryCard } from "@/components/ai/AISummaryCard"
import { motion, AnimatePresence } from "framer-motion"

export default function ParentHomePage() {
  const { data: parentId } = useParentId()
  const { data: children = [] } = useParentChildren(parentId || null)
  const [selectedChildIndex, setSelectedChildIndex] = useState(0)
  const [emotionSnapshots, setEmotionSnapshots] = useState<any[]>([])
  const [aiSummary, setAiSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const selectedChild = children[selectedChildIndex]

  useEffect(() => {
    if (selectedChild) {
      setLoading(true)
      
      // Fetch emotion snapshots
      fetch(`/napi/emotions/${selectedChild.id}?limit=7`)
        .then((res) => res.json())
        .then((data) => {
          setEmotionSnapshots(data)
        })
        .catch(console.error)

      // Fetch AI summary
      fetch(`/napi/ai/summary/${selectedChild.id}`)
        .then((res) => res.json())
        .then((data) => {
          setAiSummary(data)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [selectedChild])

  if (!selectedChild) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
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

  const studentName = `${selectedChild.firstName} ${selectedChild.lastName}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-harmony-soft via-white to-harmony-soft/30 pb-24">
      <div className="max-w-md mx-auto p-4 space-y-8">
        {/* Child Header - Instagram Style */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-8 pb-4"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            {children.length > 1 && (
              <button
                onClick={() =>
                  setSelectedChildIndex(
                    (prev) => (prev - 1 + children.length) % children.length
                  )
                }
                className="p-2 rounded-full hover:bg-white/50 transition-colors"
              >
                <ChevronLeft className="h-6 w-6 text-harmony-brain" />
              </button>
            )}
            <div className="flex items-center gap-3 px-6 py-3 bg-white/70 backdrop-blur-md rounded-2xl border border-harmony-shadow/20 shadow-soft">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-harmony-heart to-harmony-brain flex items-center justify-center text-2xl">
                👶
              </div>
              <div>
                <h2 className="text-2xl font-heading font-bold gradient-text-heart">
                  {selectedChild.firstName} Today
                </h2>
                <p className="text-xs text-muted-foreground">Daily updates</p>
              </div>
            </div>
            {children.length > 1 && (
              <button
                onClick={() =>
                  setSelectedChildIndex((prev) => (prev + 1) % children.length)
                }
                className="p-2 rounded-full hover:bg-white/50 transition-colors"
              >
                <ChevronRight className="h-6 w-6 text-harmony-brain" />
              </button>
            )}
          </div>
        </motion.div>

        {/* AI Summary - Top */}
        {aiSummary && !loading && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <AISummaryCard summary={aiSummary} studentName={studentName} />
            </motion.div>
          </AnimatePresence>
        )}

        {/* Mood Bubble - Instagram Style */}
        {!loading && emotionSnapshots.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center mb-8"
          >
            <div className="relative">
              <div className="h-32 w-32 rounded-full bg-gradient-to-br from-harmony-heart/20 to-harmony-brain/20 flex items-center justify-center text-6xl backdrop-blur-sm border-4 border-white/50 shadow-xl">
                {emotionSnapshots[0]?.mood ? 
                  ["😢", "😕", "😐", "😊", "😄"][Math.min(Math.max(emotionSnapshots[0].mood - 1, 0), 4)] 
                  : "😊"}
              </div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white/80 backdrop-blur-sm px-4 py-1 rounded-full text-xs font-semibold text-harmony-brain border border-harmony-shadow/20">
                Mood Today
              </div>
            </div>
          </motion.div>
        )}

        {/* Story Cards - Instagram Style */}
        <div className="space-y-8">
          {loading ? (
            <Card className="rounded-2xl shadow-xl glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-harmony-brain"></div>
                </div>
              </CardContent>
            </Card>
          ) : emotionSnapshots.length === 0 ? (
            <Card className="rounded-2xl shadow-xl glass-card">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground py-8">
                  Henüz duygu durumu kaydı bulunmuyor.
                </p>
              </CardContent>
            </Card>
          ) : (
            emotionSnapshots.map((snapshot, index) => (
              <AnimatePresence key={snapshot.id}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15, duration: 0.4 }}
                  className="hover-lift"
                >
                  <EmotionCard snapshot={snapshot} studentName={studentName} />
                </motion.div>
              </AnimatePresence>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

