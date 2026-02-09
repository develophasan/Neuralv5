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
    <div className="space-y-6 pb-32">
      {/* Header - More Responsive */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-left"
        >
          <h1 className="text-2xl md:text-4xl font-playful font-bold text-stone-800 mb-1">
            {getGreeting()}, {firstName}! 👋
          </h1>
          <p className="text-stone-500 text-base md:text-lg">
            Bugün sınıfında neler olacak bakalım?
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="hidden md:block" // Hide on mobile since we have FAB
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

      {/* Quick Action Buttons - Improved for mobile screens */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6"
      >
        {[
          { href: "/teacher/assessments", icon: Star, label: "Değerlendirme", desc: "Yeni kayıt", color: "from-amber-400 to-orange-500" },
          { href: "/teacher/daily-logs", icon: Calendar, label: "Günlük Log", desc: "Takip et", color: "from-emerald-400 to-teal-600" },
          { href: "/teacher/mood-tracker", icon: Smile, label: "Duygu Takibi", desc: "Sınıf ruhu", color: "from-pink-400 to-rose-600" },
          { href: "/teacher/students", icon: Users, label: "Öğrenciler", desc: "Liste", color: "from-indigo-400 to-indigo-700" },
        ].map((action, i) => (
          <Link key={i} href={action.href}>
            <motion.div
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.95 }}
              className={`p-4 md:p-6 rounded-2xl md:rounded-[2rem] bg-gradient-to-br ${action.color} text-white shadow-lg flex flex-col items-center justify-center gap-2 group transition-all duration-300 relative overflow-hidden`}
            >
              <action.icon className="h-6 w-6 md:h-8 md:w-8 mb-1" />
              <div className="text-center overflow-hidden w-full">
                <p className="font-bold text-sm md:text-lg leading-tight truncate">{action.label}</p>
                <p className="hidden md:block text-[10px] opacity-80 font-medium uppercase tracking-wider">{action.desc}</p>
              </div>
            </motion.div>
          </Link>
        ))}
      </motion.div>

      {/* Stats Grid - Vertical on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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
                <div className="bg-white p-4 md:p-6 rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-all group cursor-pointer h-full">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 md:h-16 md:w-16 rounded-xl ${stat.color} flex items-center justify-center shadow-lg shrink-0`}>
                      <stat.icon className="h-6 w-6 md:h-8 md:w-8 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] md:text-xs text-stone-500 font-bold uppercase tracking-widest truncate">{stat.label}</p>
                      <p className="text-xl md:text-3xl font-black text-stone-900">{stat.value}</p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </div>

      {/* Main Content Grid - Stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Classes Section */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-stone-100 shadow-sm h-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-stone-900 tracking-tight">Sınıflarım</h2>
                <p className="text-sm text-stone-500">Aktif eğitim takibi</p>
              </div>
              <Link href="/teacher/classes">
                <Button variant="ghost" className="rounded-xl font-bold bg-stone-50 hover:bg-stone-100 px-4 h-9">
                  Tümü <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ClassCardSkeleton />
                <ClassCardSkeleton />
              </div>
            ) : classes.length === 0 ? (
              <div className="text-center py-12 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200">
                <BookOpen className="h-12 w-12 mx-auto text-stone-300 mb-3" />
                <p className="text-stone-500 font-bold">Henüz sınıf atanmamış</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {classes.slice(0, 4).map((cls: any, index: number) => (
                  <Link key={cls.id} href={`/teacher/classes/${cls.id}`}>
                    <div className="group flex items-center gap-4 p-4 rounded-2xl bg-stone-50/50 border border-stone-100 hover:bg-white hover:shadow-lg transition-all cursor-pointer">
                      <div className={`h-12 w-12 md:h-14 md:w-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0 ${index % 4 === 0 ? 'bg-indigo-500' : index % 4 === 1 ? 'bg-amber-500' : index % 4 === 2 ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}>
                        {cls.name?.substring(0, 2)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-stone-900 truncate">{cls.name}</h3>
                        <p className="text-xs text-stone-500">
                          {cls.ageGroup} yaş • {cls.student_count || 0} öğrenci
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-stone-300 group-hover:text-primary transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* AI Insight Section */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-gradient-to-br from-indigo-900 to-blue-950 p-6 md:p-8 rounded-3xl text-white shadow-xl h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold">AI Vision</h2>
                <p className="text-indigo-300/60 text-[10px] font-bold uppercase tracking-wider">Akıllı Analiz</p>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-2">
                  {insightLoading ? "Analiz Ediliyor..." : insight?.insightTitle || "Grup Dinamiği"}
                </h4>
                {insightLoading ? (
                  <div className="space-y-2">
                    <div className="h-3 bg-white/10 rounded w-full animate-pulse" />
                    <div className="h-3 bg-white/10 rounded w-4/5 animate-pulse" />
                  </div>
                ) : (
                  <p className="text-sm md:text-base font-medium leading-relaxed">
                    "{insight?.advice || 'Günlük verilerin tamamlanması bekleniyor...'}"
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-[9px] font-bold text-indigo-300 uppercase mb-0.5">Odak</p>
                  <p className="text-xs font-bold truncate">{insight?.focusArea || '-'}</p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-[9px] font-bold text-emerald-300 uppercase mb-0.5">Mod</p>
                  <p className="text-xs font-bold truncate">{insight?.groupMode || '-'}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-indigo-300/40 font-medium">
              <div className="flex -space-x-1.5">
                {[1, 2, 3].map(i => <div key={i} className="h-5 w-5 rounded-full border border-indigo-900 bg-indigo-500/50" />)}
              </div>
              <span>V3 Quantum Active</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

