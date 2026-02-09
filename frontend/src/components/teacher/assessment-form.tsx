"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Label, Input } from "@/components/ui"
import { Brain, Save, Loader2, User, ChevronRight, ChevronLeft, CheckCircle2, Sparkles, MessageSquare, Target, Activity } from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

interface AssessmentFormProps {
  students: any[]
  domains: any[]
  onSuccess?: () => void
}

const SCORE_OPTIONS = [
  { value: 1, label: 'Zayıf', color: 'bg-rose-500', text: 'text-rose-600', hover: 'hover:bg-rose-50' },
  { value: 2, label: 'Gelişiyor', color: 'bg-orange-500', text: 'text-orange-600', hover: 'hover:bg-orange-50' },
  { value: 3, label: 'Orta', color: 'bg-amber-500', text: 'text-amber-600', hover: 'hover:bg-amber-50' },
  { value: 4, label: 'İyi', color: 'bg-sapphire-500', text: 'text-sapphire-600', hover: 'hover:bg-sapphire-50' },
  { value: 5, label: 'Mükemmel', color: 'bg-emerald-500', text: 'text-emerald-600', hover: 'hover:bg-emerald-50' },
]

export function AssessmentForm({ students, domains, onSuccess }: AssessmentFormProps) {
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0) // 0: Student, 1: Domains, 2: Notes/Submit
  const [selectedStudent, setSelectedStudent] = useState('')
  const [scores, setScores] = useState<Record<string, number>>({})
  const [notes, setNotes] = useState('')

  // Initialize scores
  useEffect(() => {
    if (domains.length > 0) {
      const initialScores: Record<string, number> = {}
      domains.forEach((d) => {
        initialScores[d.id] = 3
      })
      setScores(initialScores)
    }
  }, [domains])

  const handleScoreChange = (domainId: string, value: number) => {
    setScores((prev) => ({ ...prev, [domainId]: value }))
  }

  const handleSubmit = async () => {
    if (!selectedStudent) {
      toast.error('Lütfen bir öğrenci seçin')
      return
    }

    setLoading(true)
    try {
      const assessmentScores = Object.entries(scores).map(([domainId, score]) => ({
        domainId,
        score,
      }))

      const res = await fetch('/napi/teacher/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent,
          scores: assessmentScores,
          notes,
        }),
      })

      if (!res.ok) throw new Error('Değerlendirme kaydedilemedi')

      toast.success('Analiz başarıyla tamamlandı!')
      onSuccess?.()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const progress = (Object.keys(scores).filter(id => scores[id] !== undefined).length / domains.length) * 100

  return (
    <div className="space-y-8">
      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8 px-4">
        {[
          { id: 0, label: 'Öğrenci', icon: User },
          { id: 1, label: 'Analiz', icon: Activity },
          { id: 2, label: 'Tamamla', icon: Sparkles },
        ].map((step, idx) => (
          <div key={step.id} className="flex items-center gap-2">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${currentStep >= step.id ? 'bg-sapphire-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-400'
              }`}>
              <step.icon className="h-5 w-5" />
            </div>
            <span className={`hidden md:block text-sm font-black uppercase tracking-widest ${currentStep >= step.id ? 'text-slate-900' : 'text-slate-400'
              }`}>{step.label}</span>
            {idx < 2 && <div className="h-px w-8 md:w-16 bg-slate-200 mx-2" />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {currentStep === 0 && (
          <motion.div
            key="step0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card-premium p-10 space-y-8"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-slate-900 leading-tight">Öğrenci Seçimi</h2>
              <p className="text-slate-500 font-medium">Analizini yapmak istediğiniz öğrenciyi listeden belirleyin.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((student) => (
                <button
                  key={student.id}
                  onClick={() => {
                    setSelectedStudent(student.id)
                    setCurrentStep(1)
                  }}
                  className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center text-center gap-4 ${selectedStudent === student.id
                      ? 'border-sapphire-500 bg-sapphire-50 shadow-xl'
                      : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-lg'
                    }`}
                >
                  <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-xl font-black text-slate-400">
                    {student.firstName[0]}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900">{student.firstName} {student.lastName}</h4>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Sınıf Listesinde</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8"
          >
            <div className="sticky top-4 z-20 glass-card-premium p-6 flex items-center justify-between border-sapphire-100 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center">
                  <Target className="h-6 w-6 text-sapphire-600" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900">Gelişim Alanları</h3>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-sapphire-500" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">%{Math.round(progress)} TAMAMLANDI</span>
                  </div>
                </div>
              </div>
              <Button onClick={() => setCurrentStep(2)} className="bg-slate-900 text-white rounded-xl h-12 px-6 font-bold gap-2">
                Atla ve Bitir
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {domains.map((domain, idx) => (
                <motion.div
                  key={domain.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="teacher-card-premium p-8 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Brain className="h-20 w-20 text-slate-400" />
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: domain.color || '#6366f1' }} />
                        <h4 className="text-xl font-black text-slate-900">{domain.nameTr}</h4>
                      </div>
                      <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-md">
                        {domain.descriptionTr || 'Bu gelişim alanı için gözlemlerinizi puanlayın.'}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {SCORE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleScoreChange(domain.id, opt.value)}
                          className={`
                            h-16 w-16 rounded-2xl font-black text-xl transition-all duration-300 flex items-center justify-center relative
                            ${scores[domain.id] === opt.value
                              ? `${opt.color} text-white shadow-xl scale-110 z-10`
                              : `bg-slate-50 text-slate-400 border border-slate-100 ${opt.hover} hover:text-slate-600`
                            }
                          `}
                        >
                          {opt.value}
                          {scores[domain.id] === opt.value && (
                            <motion.div layoutId={`check-${domain.id}`} className="absolute -top-1 -right-1">
                              <CheckCircle2 className="h-5 w-5 fill-white text-emerald-500" />
                            </motion.div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center pt-10">
              <Button
                onClick={() => setCurrentStep(2)}
                className="bg-sapphire-600 text-white rounded-2xl h-16 px-12 text-lg font-black shadow-2xl shadow-sapphire-200 gap-3 group"
              >
                Sonraki Adıma Geç
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card-premium p-10 space-y-8"
          >
            <div className="text-center space-y-2">
              <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 leading-tight">Analiz Hazır!</h2>
              <p className="text-slate-500 font-medium">Değerlendirmeyi tamamlamak için bir not ekleyebilir veya doğrudan kaydedebilirsiniz.</p>
            </div>

            <div className="space-y-4">
              <Label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest px-1">
                <MessageSquare className="h-4 w-4" />
                EĞİTMEN GÖRÜŞÜ
              </Label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Öğrencinin bu gelişim dönemine dair özel notlarınız..."
                className="w-full h-40 p-6 rounded-[2rem] bg-slate-50/50 border-2 border-slate-100 focus:bg-white focus:border-sapphire-500/30 transition-all outline-none text-slate-800 font-medium"
              />
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4">
              <Button
                onClick={() => setCurrentStep(1)}
                variant="outline"
                className="w-full md:w-auto h-14 rounded-2xl border-2 border-slate-100 font-bold px-8"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Dön ve Düzenle
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full flex-1 bg-gradient-to-r from-sapphire-600 to-indigo-700 text-white rounded-2xl h-14 font-black text-lg shadow-xl shadow-indigo-100 gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    ANALİZ KAYDEDİLİYOR...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    ANALİZİ TAMAMLA VE KAYDET
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
