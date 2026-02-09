"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui"
import { Users, BookOpen, Activity, TrendingUp, Mic, Brain, Plus, AlertCircle, Smile, Calendar, Star, ChevronRight, Sparkles, X, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useTeacherId, useTeacherClasses, useTeacherStats, useTeacherActivities, useTeacherStudents } from "@/hooks/api/use-teacher"
import { motion, AnimatePresence } from "framer-motion"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { QuickAssessment } from "@/components/assessment/QuickAssessment"

// Skeleton Components
function StatCardSkeleton() {
  return (
    <div className="teacher-stat-card animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-stone-200" />
        <div className="flex-1">
          <div className="h-4 w-20 bg-stone-200 rounded mb-2" />
          <div className="h-8 w-12 bg-stone-200 rounded" />
        </div>
      </div>
    </div>
  )
}

function ClassCardSkeleton() {
  return (
    <div className="teacher-card animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-2xl bg-stone-200" />
        <div className="flex-1">
          <div className="h-5 w-32 bg-stone-200 rounded mb-2" />
          <div className="h-4 w-24 bg-stone-200 rounded" />
        </div>
        <div className="h-10 w-20 bg-stone-200 rounded-xl" />
      </div>
    </div>
  )
}

export default function TeacherDashboardPage() {
  const { data: session } = useSession()
  const { data: teacherId, isLoading: teacherIdLoading, error: teacherIdError } = useTeacherId()
  const { data: classes = [], isLoading: classesLoading } = useTeacherClasses(teacherId || null)
  const { data: stats, isLoading: statsLoading } = useTeacherStats(teacherId || null)
  const { data: neuroActivities = [], isLoading: activitiesLoading } = useTeacherActivities(teacherId || null)
  const { data: allStudents = [], isLoading: studentsLoading } = useTeacherStudents(teacherId || null)

  // Class Insight State
  const [insight, setInsight] = useState<any>(null)
  const [insightLoading, setInsightLoading] = useState(true)

  // Quick Assessment State
  const [isQuickOpen, setIsQuickOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)

  useEffect(() => {
    const fetchInsight = async () => {
      if (!teacherId) return
      try {
        const res = await fetch(`/napi/teacher/class-insight?teacherId=${teacherId}`)
        const data = await res.json()
        if (data.success) {
          setInsight(data.data)
        }
      } catch (e) {
        console.error("Insight fetch error", e)
      } finally {
        setInsightLoading(false)
      }
    }
    fetchInsight()
  }, [teacherId])

  const loading = teacherIdLoading || classesLoading || statsLoading || activitiesLoading
  const firstName = session?.user?.name?.split(' ')[0] || 'Ogretmen'

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Gunaydin'
    if (hour < 18) return 'Iyi gunler'
    return 'Iyi aksamlar'
  }

  const statCards = [
    { label: "Ogrencilerim", value: stats?.total_students || 0, icon: Users, color: "bg-blue-500", href: "/teacher/students" },
    { label: "Siniflarim", value: classes.length || 0, icon: BookOpen, color: "bg-purple-500", href: "/teacher/classes" },
    { label: "Bugunun Aktiviteleri", value: neuroActivities.length || 0, icon: Activity, color: "bg-emerald-500", href: "/teacher/activities" },
    { label: "Bekleyen Degerlendirme", value: stats?.pending_assessments || 0, icon: TrendingUp, color: "bg-amber-500", href: "/teacher/assessments" },
  ]

  return (
    <div className="space-y-8 pb-32">
      {/* Header - Playful Style */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center md:text-left"
        >
          <h1 className="text-3xl md:text-4xl font-playful font-bold text-stone-800 mb-2">
            {getGreeting()}, {firstName}! 👋
          </h1>
          <p className="text-stone-500 text-lg">
            Bugun sinifinda neler olacak bakalim?
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Button
            onClick={() => setIsQuickOpen(true)}
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-200 h-14 px-8 text-lg font-bold"
          >
            <Brain className="mr-2 h-6 w-6" />
            Hızlı Değerlendirme
          </Button>
        </motion.div>
      </div>

      {/* Quick Assessment Modal */}
      <Dialog open={isQuickOpen} onOpenChange={(open) => {
        setIsQuickOpen(open)
        if (!open) setSelectedStudent(null)
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 bg-stone-50/95 backdrop-blur-xl border-stone-200">
          <DialogHeader className="p-6 pb-2 border-b bg-white">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              {selectedStudent ? (
                <>
                  <button onClick={() => setSelectedStudent(null)} className="text-stone-400 hover:text-stone-600 transition-colors">
                    <ChevronRight className="h-6 w-6 rotate-180" />
                  </button>
                  <span className="text-neuro-purple">{selectedStudent.firstName}</span> için Değerlendirme
                </>
              ) : (
                <>
                  <Brain className="h-6 w-6 text-neuro-purple" />
                  Öğrenci Seçimi
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6">
            {!selectedStudent ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {studentsLoading ? (
                  <p className="col-span-3 text-center py-8 text-stone-400">Öğrenciler yükleniyor...</p>
                ) : allStudents.length === 0 ? (
                  <p className="col-span-3 text-center py-8 text-stone-400">Henüz öğrenci bulunmuyor.</p>
                ) : (
                  allStudents.map((student: any) => (
                    <motion.button
                      key={student.id}
                      onClick={() => setSelectedStudent(student)}
                      whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,1)' }}
                      whileTap={{ scale: 0.98 }}
                      className="flex flex-col items-center p-4 rounded-xl bg-white border border-stone-200 shadow-sm hover:shadow-md hover:border-neuro-purple/30 transition-all group"
                    >
                      <div className="h-16 w-16 rounded-full bg-stone-100 mb-3 overflow-hidden group-hover:ring-4 ring-neuro-purple/10 transition-all flex items-center justify-center text-2xl">
                        {student.photoUrl ? (
                          <img src={student.photoUrl} alt={student.firstName} className="h-full w-full object-cover" />
                        ) : (
                          <span>🧒</span>
                        )}
                      </div>
                      <h3 className="font-bold text-stone-700">{student.firstName}</h3>
                      <p className="text-xs text-stone-400">{student.lastName}</p>
                    </motion.button>
                  ))
                )}
              </div>
            ) : (
              <QuickAssessment
                studentId={selectedStudent.id}
                onComplete={() => setIsQuickOpen(false)}
                onClose={() => setSelectedStudent(null)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Action Buttons - Glassmorphism Style */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-6"
      >
        {[
          { href: "/teacher/assessments/new", icon: Star, label: "Değerlendirme", desc: "Yeni kayıt", color: "from-amber-400 to-orange-500", glow: "glow-gold" },
          { href: "/teacher/daily-logs", icon: Calendar, label: "Günlük Log", desc: "Takip et", color: "from-emerald-400 to-teal-600", glow: "glow-sapphire" },
          { href: "/teacher/mood-tracker", icon: Smile, label: "Duygu Takibi", desc: "Sınıf ruhu", color: "from-pink-400 to-rose-600", glow: "" },
          { href: "/teacher/students", icon: Users, label: "Öğrenciler", desc: "Liste ve profil", color: "from-indigo-400 to-indigo-700", glow: "glow-sapphire" },
        ].map((action, i) => (
          <Link key={i} href={action.href}>
            <motion.div
              whileHover={{ y: -5 }}
              className={`p-6 rounded-[2rem] bg-gradient-to-br ${action.color} text-white shadow-xl flex flex-col items-center justify-center gap-2 group transition-all duration-300 relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <action.icon className="h-8 w-8 mb-1 group-hover:scale-110 transition-transform" />
              <div className="text-center">
                <p className="font-bold text-lg leading-tight">{action.label}</p>
                <p className="text-[10px] opacity-80 font-medium uppercase tracking-wider">{action.desc}</p>
              </div>
            </motion.div>
          </Link>
        ))}
      </motion.div>

      {/* Stats Grid - Minimalist Premium */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
            >
              <Link href={stat.href}>
                <div className="teacher-stat-card-premium group cursor-pointer">
                  <div className="flex items-center gap-5">
                    <div className={`h-16 w-16 rounded-2xl ${stat.color} flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform`}>
                      <stat.icon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{stat.label}</p>
                      <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </div>

      {/* Main Content Grid - High Contrast & Depth */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Classes Section */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <div className="teacher-card-premium h-full">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-heading font-extrabold text-slate-900">Sınıflarım</h2>
                <p className="text-slate-500 font-medium">Aktif eğitim ve gelişim takibi</p>
              </div>
              <Link href="/teacher/classes">
                <Button variant="ghost" className="rounded-2xl font-bold bg-slate-50 hover:bg-slate-100 px-6">
                  Tümü <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ClassCardSkeleton />
                <ClassCardSkeleton />
              </div>
            ) : classes.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                <BookOpen className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 font-bold">Henüz sınıf atanmamış</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classes.slice(0, 4).map((cls: any, index: number) => (
                  <Link key={cls.id} href={`/teacher/classes/${cls.id}`}>
                    <div className="group flex items-center gap-5 p-5 rounded-[1.5rem] bg-slate-50/50 border border-slate-100 hover:border-indigo-200 hover:bg-white hover:shadow-xl transition-all duration-300 cursor-pointer">
                      <div className={`h-16 w-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-110 transition-transform ${index % 4 === 0 ? 'bg-indigo-500' : index % 4 === 1 ? 'bg-amber-500' : index % 4 === 2 ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}>
                        {cls.name?.substring(0, 2)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{cls.name}</h3>
                        <p className="text-sm text-slate-500 font-medium">
                          {cls.ageGroup} yaş • {cls.student_count || 0} öğrenci
                        </p>
                      </div>
                      <div className="h-10 w-10 flex items-center justify-center rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                        <ChevronRight className="h-5 w-5 text-indigo-600" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* AI Insight Section - Ultra Premium Look */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="teacher-card-premium h-full bg-gradient-to-br from-indigo-900 to-blue-900 border-0 p-1">
            <div className="h-full w-full bg-indigo-950/40 backdrop-blur-3xl rounded-[1.9rem] p-8 flex flex-col">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-amber-400 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl font-heading font-extrabold text-white">AI Vision</h2>
                  <p className="text-indigo-300/80 text-xs font-bold uppercase tracking-widest">Akıllı Sınıf Analizi</p>
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <motion.div
                  className="p-6 bg-white/5 backdrop-blur-xl rounded-[1.5rem] border border-white/10 shadow-2xl relative overflow-hidden group"
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                >
                  <Brain className="absolute -right-6 -bottom-6 h-24 w-24 text-white/5 group-hover:rotate-12 transition-transform" />
                  <div className="relative">
                    <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] mb-3">
                      {insightLoading ? "Analiz Ediliyor..." : insight?.insightTitle || "Grup Dinamiği"}
                    </h4>
                    {insightLoading ? (
                      <div className="space-y-3">
                        <div className="h-4 bg-white/10 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-white/10 rounded w-5/6 animate-pulse"></div>
                      </div>
                    ) : (
                      <p className="text-white text-lg font-medium leading-relaxed">
                        "{insight?.advice || 'Günlük verilerin tamamlanması bekleniyor...'}"
                      </p>
                    )}
                  </div>
                </motion.div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-indigo-500/10 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-bold text-indigo-300 uppercase mb-1">Odak</p>
                    <p className="text-sm font-black text-white">{insight?.focusArea || '-'}</p>
                  </div>
                  <div className="p-4 bg-emerald-500/10 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-bold text-emerald-300 uppercase mb-1">Mod</p>
                    <p className="text-sm font-black text-white">{insight?.groupMode || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-8 w-8 rounded-full border-2 border-indigo-900 bg-indigo-500 text-[10px] flex items-center justify-center font-bold text-white">
                        {i}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-indigo-300/60 font-medium">V3 Quantum Engine Aktif</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating Action Button - Enhanced */}
      <div className="fixed bottom-10 right-10 md:hidden z-50">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsQuickOpen(true)}
          className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-2xl flex items-center justify-center border-4 border-white/20 backdrop-blur-sm"
        >
          <Plus className="h-10 w-10" />
        </motion.button>
      </div>
    </div>
  )
}
