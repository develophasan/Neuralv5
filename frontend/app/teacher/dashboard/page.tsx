"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from "@/components/ui"
import { Users, BookOpen, Activity, TrendingUp, Mic, Brain, Plus, AlertCircle, Smile, Calendar, Star, ChevronRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { useTeacherId, useTeacherClasses, useTeacherStats, useTeacherActivities } from "@/hooks/api/use-teacher"
import { motion } from "framer-motion"
import { useSession } from "next-auth/react"

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

      {/* Quick Action Buttons - Large Touch Targets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Link href="/teacher/assessments/new">
          <button className="teacher-btn-primary w-full h-24 flex flex-col items-center justify-center gap-2">
            <Star className="h-7 w-7" />
            <span className="font-playful text-center">Degerlendirme</span>
          </button>
        </Link>
        <Link href="/teacher/daily-logs">
          <button className="teacher-btn-play w-full h-24 flex flex-col items-center justify-center gap-2">
            <Calendar className="h-7 w-7" />
            <span className="font-playful text-center">Gunluk Log</span>
          </button>
        </Link>
        <Link href="/teacher/mood-tracker">
          <button className="w-full h-24 text-lg font-semibold rounded-2xl shadow-soft-md bg-pink-500 text-white hover:bg-pink-600 hover:scale-105 transition-all duration-200 flex flex-col items-center justify-center gap-2">
            <Smile className="h-7 w-7" />
            <span className="font-playful text-center">Duygu Takibi</span>
          </button>
        </Link>
        <Link href="/teacher/students">
          <button className="w-full h-24 text-lg font-semibold rounded-2xl shadow-soft-md bg-indigo-500 text-white hover:bg-indigo-600 hover:scale-105 transition-all duration-200 flex flex-col items-center justify-center gap-2">
            <Users className="h-7 w-7" />
            <span className="font-playful text-center">Ogrenciler</span>
          </button>
        </Link>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Link href={stat.href}>
                <div className="teacher-stat-card cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className={`h-14 w-14 rounded-2xl ${stat.color} flex items-center justify-center shadow-soft-md`}>
                      <stat.icon className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-stone-500 font-medium">{stat.label}</p>
                      <p className="text-3xl font-bold text-stone-800">{stat.value}</p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Classes Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="teacher-card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-playful font-bold text-stone-800">Siniflarim</h2>
                <p className="text-sm text-stone-500">Sinifini sec ve basla!</p>
              </div>
              <Link href="/teacher/classes">
                <Button variant="ghost" size="sm" className="rounded-xl">
                  Tumu <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                <ClassCardSkeleton />
                <ClassCardSkeleton />
              </div>
            ) : classes.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto text-stone-300 mb-3" />
                <p className="text-stone-500">Henuz sinif atanmamis</p>
              </div>
            ) : (
              <div className="space-y-3">
                {classes.slice(0, 3).map((cls: any, index: number) => (
                  <Link key={cls.id} href={`/teacher/classes/${cls.id}`}>
                    <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-stone-100 hover:border-brand-200 hover:bg-brand-50/50 transition-all cursor-pointer">
                      <div className={`h-14 w-14 rounded-xl flex items-center justify-center text-white font-playful font-bold text-lg ${index % 3 === 0 ? 'bg-blue-500' : index % 3 === 1 ? 'bg-purple-500' : 'bg-emerald-500'
                        }`}>
                        {cls.name?.substring(0, 2)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-stone-800">{cls.name}</h3>
                        <p className="text-sm text-stone-500">
                          {cls.ageGroup} yas • {cls.student_count || 0} ogrenci
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-stone-400" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Today's Activities */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="teacher-card bg-gradient-to-br from-indigo-50/50 to-transparent border-indigo-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-playful font-bold text-stone-800 flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-indigo-500 animate-pulse" />
                  AI Sınıf İncelemesi
                </h2>
                <p className="text-sm text-stone-500">Yapay zeka analizleri ve grup önerileri</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-white/80 rounded-2xl border border-indigo-50 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:rotate-12 transition-transform">
                  <Brain size={48} className="text-indigo-600" />
                </div>
                <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">Grup Dinamiği Analizi</h4>
                <p className="text-sm text-stone-700 leading-relaxed font-medium">
                  "Bugün çocukların enerjisi yüksek gözüküyor. Öğleden sonraki aktivitelerde 'Aktif Oyun' grubuna ağırlık vermeniz, odaklanma sürelerini artırabilir."
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white/60 rounded-xl border border-stone-100">
                  <p className="text-[10px] font-bold text-stone-400 uppercase mb-1">Odak Noktası</p>
                  <p className="text-sm font-bold text-stone-800">Dil Gelişimi</p>
                </div>
                <div className="p-3 bg-white/60 rounded-xl border border-stone-100">
                  <p className="text-[10px] font-bold text-stone-400 uppercase mb-1">Grup Modu</p>
                  <p className="text-sm font-bold text-emerald-600">Yüksek Enerji</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating Action Button - Mobile */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <Link href="/teacher/assessments/new">
          <button className="h-16 w-16 rounded-full bg-gradient-brand text-white shadow-brand-lg flex items-center justify-center hover:scale-110 transition-transform">
            <Plus className="h-8 w-8" />
          </button>
        </Link>
      </div>
    </div>
  )
}
