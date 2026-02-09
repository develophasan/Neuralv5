"use client"

import { Card, CardContent, Button } from "@/components/ui"
import { Heart, TrendingUp, Activity, Calendar, ChevronRight, Star, BarChart3, Bell, Sparkles } from "lucide-react"
import Link from "next/link"
import { useParentId, useParentChildren } from "@/hooks/api/use-parent"
import { useNotifications } from "@/lib/realtime/notification-provider"
import { motion } from "framer-motion"
import { useSession } from "next-auth/react"

// Skeleton Components
function ChildCardSkeleton() {
  return (
    <div className="parent-card animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="h-16 w-16 rounded-2xl bg-stone-200" />
        <div className="flex-1">
          <div className="h-5 w-32 bg-stone-200 rounded mb-2" />
          <div className="h-4 w-24 bg-stone-100 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="h-16 bg-stone-100 rounded-xl" />
        <div className="h-16 bg-stone-100 rounded-xl" />
        <div className="h-16 bg-stone-100 rounded-xl" />
      </div>
    </div>
  )
}

function StatCardSkeleton() {
  return (
    <div className="parent-stat-card animate-pulse">
      <div className="h-10 w-10 bg-stone-200 rounded-xl mb-3" />
      <div className="h-4 w-16 bg-stone-200 rounded mb-2" />
      <div className="h-6 w-12 bg-stone-100 rounded" />
    </div>
  )
}

export default function ParentDashboardPage() {
  const { data: session } = useSession()
  const { data: parentId, isLoading: parentIdLoading } = useParentId()
  const { data: children = [], isLoading: childrenLoading } = useParentChildren(parentId || null)
  const { notifications, unreadCount } = useNotifications()

  const loading = parentIdLoading || childrenLoading
  const firstName = session?.user?.name?.split(' ')[0] || 'Veli'

  const calculateAge = (dateOfBirth: string) => {
    const birth = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  // Calculate average score for a child
  const getAverageScore = (child: any) => {
    const assessments = child.assessments || []
    if (!assessments.length || !assessments[0]?.scores?.length) return null
    const scores = assessments[0].scores.filter((s: any) => s.score != null)
    if (!scores.length) return null
    return (scores.reduce((sum: number, s: any) => sum + s.score, 0) / scores.length).toFixed(1)
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-stone-800">
          Merhaba, {firstName}! 👋
        </h1>
        <p className="text-stone-500 mt-1">
          Cocugunuzun gelisimini takip edin
        </p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="parent-stat-card">
                <div className="h-10 w-10 rounded-xl bg-pink-100 flex items-center justify-center mb-3">
                  <Heart className="h-5 w-5 text-pink-600" />
                </div>
                <p className="text-xs text-stone-500">Cocuklarim</p>
                <p className="text-2xl font-bold text-stone-800">{children.length}</p>
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Link href="/parent/reports">
                <div className="parent-stat-card cursor-pointer hover:border-brand-200">
                  <div className="h-10 w-10 rounded-xl bg-brand-100 flex items-center justify-center mb-3">
                    <BarChart3 className="h-5 w-5 text-brand-600" />
                  </div>
                  <p className="text-xs text-stone-500">Raporlar</p>
                  <p className="text-2xl font-bold text-stone-800">{children.reduce((sum: number, c: any) => sum + (c.assessments?.length || 0), 0)}</p>
                </div>
              </Link>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="parent-stat-card">
                <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center mb-3">
                  <Bell className="h-5 w-5 text-amber-600" />
                </div>
                <p className="text-xs text-stone-500">Bildirimler</p>
                <p className="text-2xl font-bold text-stone-800">{unreadCount}</p>
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <Link href="/parent/ai-insights">
                <div className="parent-stat-card cursor-pointer hover:border-purple-200">
                  <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center mb-3">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                  </div>
                  <p className="text-xs text-stone-500">AI Oneriler</p>
                  <p className="text-2xl font-bold text-stone-800">3</p>
                </div>
              </Link>
            </motion.div>
          </>
        )}
      </div>

      {/* Children Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading font-semibold text-stone-800">Cocuklarim</h2>
          <Link href="/parent/children">
            <Button variant="ghost" size="sm" className="text-brand-600">
              Tumu <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            <ChildCardSkeleton />
          </div>
        ) : children.length === 0 ? (
          <div className="parent-card text-center py-8">
            <Heart className="h-12 w-12 mx-auto text-stone-300 mb-3" />
            <p className="text-stone-500">Henuz cocuk kaydi bulunmuyor</p>
          </div>
        ) : (
          <div className="space-y-4">
            {children.map((child: any, index: number) => {
              const avgScore = getAverageScore(child)
              const age = calculateAge(child.dateOfBirth)
              const lastAssessment = child.assessments?.[0]
              
              return (
                <motion.div
                  key={child.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <div className="parent-card">
                    {/* Child Header */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`h-16 w-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl ${
                        child.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'
                      }`}>
                        {child.firstName?.[0]}{child.lastName?.[0]}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-stone-800 text-lg">
                          {child.firstName} {child.lastName}
                        </h3>
                        <p className="text-sm text-stone-500">
                          {age} yasinda • {child.classStudents?.[0]?.class?.name || 'Sinif atanmamis'}
                        </p>
                      </div>
                      <Link href={`/parent/children/${child.id}`}>
                        <Button variant="outline" size="sm" className="rounded-xl">
                          Detay
                        </Button>
                      </Link>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-stone-50 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Star className="h-4 w-4 text-amber-500" />
                          <span className="text-lg font-bold text-stone-800">
                            {avgScore || '-'}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500">Ortalama</p>
                      </div>
                      
                      <div className="bg-stone-50 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <TrendingUp className="h-4 w-4 text-emerald-500" />
                          <span className="text-lg font-bold text-stone-800">
                            {child.assessments?.length || 0}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500">Degerlendirme</p>
                      </div>
                      
                      <div className="bg-stone-50 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Activity className="h-4 w-4 text-purple-500" />
                          <span className="text-lg font-bold text-stone-800">
                            {child.dailyLogs?.length || 0}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500">Gunluk Log</p>
                      </div>
                    </div>

                    {/* Last Assessment Info */}
                    {lastAssessment && (
                      <div className="mt-4 pt-4 border-t border-stone-100">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-stone-500">
                            Son degerlendirme: {new Date(lastAssessment.assessmentDate).toLocaleDateString('tr')}
                          </p>
                          <Link href={`/parent/reports?studentId=${child.id}`}>
                            <Button variant="ghost" size="sm" className="text-brand-600 text-xs">
                              Raporu Gor <ChevronRight className="h-3 w-3 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Recent Notifications Preview */}
      {notifications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading font-semibold text-stone-800">Son Bildirimler</h2>
            <Link href="/parent/notifications">
              <Button variant="ghost" size="sm" className="text-brand-600">
                Tumu <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          
          <div className="space-y-2">
            {notifications.slice(0, 3).map((notification: any) => (
              <div 
                key={notification.id} 
                className={`parent-card p-4 ${!notification.isRead ? 'border-l-4 border-l-brand-500' : ''}`}
              >
                <p className="font-medium text-stone-800 text-sm">{notification.title}</p>
                <p className="text-xs text-stone-500 mt-1 line-clamp-1">{notification.message}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
