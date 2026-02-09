"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Brain, Check, ChevronRight, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Domain {
  id: string
  nameTr: string
  code: string
  iconName?: string
  color?: string
}

interface QuickAssessmentProps {
  studentId: string
  onComplete?: () => void
  onClose?: () => void
}

export function QuickAssessment({
  studentId,
  onComplete,
  onClose
}: QuickAssessmentProps) {
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState<string | null>(null) // domainId being submitted
  const [ratings, setRatings] = useState<Record<string, number>>({}) // domainId -> score

  // Fetch domains and existing assessment
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true)

        // 1. Fetch Domains
        const domainRes = await fetch("/napi/domains")
        const domainData = await domainRes.json()

        if (domainData.success) {
          setDomains(domainData.data)
        }

        // 2. Fetch Today's Assessment for Student
        if (studentId) {
          const assessRes = await fetch(`/napi/assessment/quick?studentId=${studentId}`)
          const assessData = await assessRes.json()

          if (assessData.success && assessData.data) {
            const existingScores: Record<string, number> = {}
            assessData.data.scores.forEach((s: any) => {
              existingScores[s.domainId] = s.score
            })
            setRatings(existingScores)
          }
        }
      } catch (error) {
        console.error("Quick Assessment Init Error:", error)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [studentId])

  const handleScore = async (domainId: string, score: number) => {
    // Optimistic Update
    setRatings(prev => ({ ...prev, [domainId]: score }))
    setSubmitting(domainId)

    try {
      // Get teacher ID (simulated or real)
      // In a real app, useSession() would provide this, API handles validation
      // But for now, we'll let the API extract it from session or pass a placeholder if needed
      // The previous code fetched /napi/test/teacher-id, let's look at how we get it.
      // Better: let the API handle the 'assessedBy' from the session. 
      // But the API currently expects 'assessedBy' in body.
      // Let's stick to the previous pattern or fetch it from session client-side.

      const teacherRes = await fetch("/napi/test/teacher-id")
      const { teacherId } = await teacherRes.json()

      await fetch("/napi/assessment/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          domainId,
          score,
          assessedBy: teacherId,
        }),
      })

    } catch (error) {
      console.error("Error submitting score:", error)
      // Revert optimistic update?
    } finally {
      setSubmitting(null)
    }
  }

  const scores = [
    { emoji: "🔴", value: 1, label: "Destek", color: "from-red-50 to-red-100", border: "border-red-200", active: "bg-red-100 border-red-400" },
    { emoji: "🟡", value: 3, label: "Gelişiyor", color: "from-amber-50 to-amber-100", border: "border-amber-200", active: "bg-amber-100 border-amber-400" },
    { emoji: "🟢", value: 5, label: "İyi", color: "from-emerald-50 to-emerald-100", border: "border-emerald-200", active: "bg-emerald-100 border-emerald-400" },
  ]

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-neuro-purple" />
      </div>
    )
  }

  return (
    <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-stone-800">Gelişim Alanları</h3>
        <span className="text-xs text-stone-500 bg-stone-100 px-2 py-1 rounded-full">
          {Object.keys(ratings).length} / {domains.length} Tamamlandı
        </span>
      </div>

      <div className="grid gap-4">
        {domains.map((domain) => (
          <motion.div
            key={domain.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`
                  h-10 w-10 rounded-full flex items-center justify-center
                  ${ratings[domain.id] ? 'bg-neuro-purple/10 text-neuro-purple' : 'bg-stone-100 text-stone-400'}
                `}>
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-stone-800">{domain.nameTr}</h4>
                  <p className="text-xs text-stone-500">{domain.code}</p>
                </div>
              </div>

              <div className="flex gap-2">
                {scores.map((s) => {
                  const isSelected = ratings[domain.id] === s.value
                  const isProcessing = submitting === domain.id

                  return (
                    <button
                      key={s.value}
                      onClick={() => handleScore(domain.id, s.value)}
                      disabled={isProcessing}
                      className={`
                        flex flex-col items-center justify-center p-2 rounded-lg border min-w-[70px] transition-all
                        ${isSelected ? s.active : 'bg-white border-stone-100 hover:bg-stone-50'}
                      `}
                    >
                      <span className="text-xl mb-1">{s.emoji}</span>
                      <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-stone-800' : 'text-stone-400'}`}>
                        {s.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {onComplete && Object.keys(ratings).length > 0 && (
        <div className="pt-4 sticky bottom-0 bg-white/80 backdrop-blur-sm p-4 border-t">
          <button
            onClick={onComplete}
            className="w-full bg-neuro-purple text-white py-3 rounded-xl font-bold hover:bg-neuro-purple/90 transition-colors"
          >
            Değerlendirmeyi Tamamla
          </button>
        </div>
      )}
    </div>
  )
}

