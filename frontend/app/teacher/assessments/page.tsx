"use client"
export const dynamic = "force-dynamic"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge } from "@/components/ui"
import { TrendingUp, Plus, ArrowRight, Calendar, User, Star, ChevronRight, Activity } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useTeacherId, useTeacherAssessments } from "@/hooks/api/use-teacher"
import { Suspense, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

// Skor rengini hesapla - Premium Segmentli Renkler
const getScoreStatus = (score: number) => {
  if (score >= 4.5) return { color: "from-emerald-400 to-teal-500", label: "Mükemmel", text: "text-emerald-600", bg: "bg-emerald-50" }
  if (score >= 3.5) return { color: "from-sapphire-400 to-indigo-500", label: "Çok İyi", text: "text-sapphire-600", bg: "bg-sapphire-50" }
  if (score >= 2.5) return { color: "from-amber-400 to-orange-500", label: "İyi", text: "text-amber-600", bg: "bg-amber-50" }
  return { color: "from-rose-400 to-red-500", label: "Gelişim Lazım", text: "text-rose-600", bg: "bg-rose-50" }
}

const calculateAverage = (scores: any[]) => {
  if (!scores || scores.length === 0) return 0
  const validScores = scores.filter(s => s.score != null)
  if (validScores.length === 0) return 0
  const sum = validScores.reduce((acc, s) => acc + (s.score || 0), 0)
  return (sum / validScores.length).toFixed(1)
}

function AssessmentsContent() {
  const { data: teacherId, isLoading: teacherIdLoading } = useTeacherId()
  const searchParams = useSearchParams()
  const studentId = searchParams.get('studentId')
  const { data: assessments = [], isLoading: assessmentsLoading } = useTeacherAssessments(teacherId || null, studentId || null)

  if (teacherIdLoading || assessmentsLoading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center bg-mesh-gradient">
        <div className="text-center">
          <div className="h-16 w-16 border-4 border-sapphire-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-slate-500 font-black uppercase tracking-widest text-sm">Analizler Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen teacher-layout p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header - Premium Sapphire Style */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-slate-900 mb-3 flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-sapphire-600 to-indigo-700 shadow-xl shadow-indigo-200 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sapphire-700 to-slate-900">Değerlendirmeler</span>
            </h1>
            <p className="text-slate-500 text-xl font-medium">
              Öğrencilerinizin çok yönlü gelişim grafiklerini takip edin.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Link href="/teacher/assessments/new">
              <Button className="teacher-btn-premium h-14 px-8 bg-slate-900 text-white hover:bg-black text-lg gap-2 shadow-xl shadow-slate-200">
                <Plus className="h-6 w-6" />
                Yeni Analiz Başlat
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-3"
        >
          {['Mükemmel (4.5+)', 'Çok İyi (3.5+)', 'İyi (2.5+)', 'Gelişim (0-2.5)'].map((label, i) => (
            <span key={label} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-slate-100 bg-white/50 backdrop-blur-sm shadow-sm`}>
              {label}
            </span>
          ))}
        </motion.div>

        {assessments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-center py-24 glass-card-premium rounded-[3rem]">
              <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Henüz Analiz Verisi Yok</h3>
              <p className="text-slate-500 font-medium mb-8">Öğrencilerinin gelişimini takip etmek için ilk değerlendirmeyi yapabilirsin.</p>
              <Link href="/teacher/assessments/new">
                <Button className="bg-sapphire-600 text-white rounded-2xl h-12 px-6">İlk Analizi Oluştur</Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            <AnimatePresence>
              {assessments.map((assessment: any, idx: number) => {
                const avgScore = calculateAverage(assessment.scores)
                const avgScoreNum = parseFloat(avgScore as string)
                const status = getScoreStatus(avgScoreNum)

                return (
                  <motion.div
                    key={assessment.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div className="teacher-card-premium group overflow-visible relative">
                      {/* Ribbon Status */}
                      <div className={`absolute -right-2 -top-2 px-6 py-2 rounded-xl text-white font-black text-xs uppercase tracking-widest bg-gradient-to-r shadow-lg ${status.color}`}>
                        {status.label}
                      </div>

                      <div className="flex flex-col lg:flex-row gap-8">
                        {/* Student Info & Global Score */}
                        <div className="lg:w-1/3 space-y-6">
                          <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-2xl text-slate-400 group-hover:scale-110 transition-transform">
                              {assessment.student.firstName[0]}
                            </div>
                            <div>
                              <h3 className="text-2xl font-black text-slate-900">{assessment.student.firstName} {assessment.student.lastName}</h3>
                              <div className="flex items-center gap-2 text-slate-400 text-sm font-bold">
                                <Calendar className="h-4 w-4" />
                                {new Date(assessment.assessmentDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </div>
                            </div>
                          </div>

                          <div className={`p-8 rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center text-center ${status.bg} ${status.text.replace('text', 'border')}`}>
                            <span className="text-xs font-black uppercase tracking-widest opacity-60 mb-2">GENEL GELİŞİM SKORU</span>
                            <div className="flex items-baseline gap-2">
                              <span className={`text-6xl font-black ${status.text}`}>{avgScore}</span>
                              <span className="text-xl font-bold opacity-40">/ 5</span>
                            </div>
                            <div className="w-full h-2 bg-white/60 rounded-full mt-6 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(avgScoreNum / 5) * 100}%` }}
                                transition={{ duration: 1, delay: idx * 0.2 }}
                                className={`h-full bg-gradient-to-r ${status.color}`}
                              />
                            </div>
                          </div>

                          <Link href={`/teacher/students/${assessment.student.id}`} className="block">
                            <Button variant="outline" className="w-full h-14 rounded-2xl border-2 border-slate-100 font-bold hover:bg-slate-50 transition-all gap-2">
                              Tam Profili Görüntüle
                              <ArrowRight className="h-5 w-5" />
                            </Button>
                          </Link>
                        </div>

                        {/* Domain Scores Grid */}
                        <div className="lg:w-2/3 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-6">
                              <Activity className="h-5 w-5 text-slate-400" />
                              <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">ALAN BAZLI ANALİZ</h4>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                              {assessment.scores.map((score: any, sIdx: number) => {
                                const sStatus = getScoreStatus(score.score || 0)
                                return (
                                  <motion.div
                                    key={sIdx}
                                    whileHover={{ scale: 1.05 }}
                                    className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center relative overflow-hidden"
                                  >
                                    <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${sStatus.color}`} />
                                    <span className="text-[10px] font-black text-slate-400 uppercase mb-3 leading-tight h-8 flex items-center capitalize">
                                      {score.domain?.nameTr || 'Alan'}
                                    </span>
                                    <span className={`text-3xl font-black ${sStatus.text}`}>
                                      {score.score || '-'}
                                    </span>
                                  </motion.div>
                                )
                              })}
                            </div>
                          </div>

                          {assessment.notes && (
                            <div className="mt-8 p-6 rounded-3xl bg-slate-50 border border-slate-100 italic text-slate-600 font-medium relative">
                              <div className="absolute -left-3 top-6 h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                                <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                              </div>
                              <p className="pl-4 leading-relaxed">&ldquo;{assessment.notes}&rdquo;</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TeacherAssessmentsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-mesh-gradient">
        <div className="h-16 w-16 border-4 border-sapphire-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <AssessmentsContent />
    </Suspense>
  )
}
