"use client"

import { useAdminDashboard, useAdminUsers } from "@/hooks/api/use-admin"
import { PageContainer } from "@/components/layout/page-container"
import { MetricCard } from "@/components/dashboard/metric-card"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui"
import {
  Users,
  GraduationCap,
  BookOpen,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Plus,
  Bell,
  Settings,
  MoreVertical,
  Database,
  Cpu,
  Zap,
  CheckCircle,
  Clock,
  Sparkles,
  Target,
  Lightbulb
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Mock Data for Charts
const activityData = [
  { name: 'Pzt', value: 40, previous: 35 },
  { name: 'Sal', value: 30, previous: 32 },
  { name: 'Çar', value: 45, previous: 38 },
  { name: 'Per', value: 25, previous: 30 },
  { name: 'Cum', value: 55, previous: 48 },
  { name: 'Cmt', value: 60, previous: 52 },
  { name: 'Paz', value: 50, previous: 45 },
]

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b']

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useAdminDashboard()
  const { data: recentUsers, isLoading: usersLoading } = useAdminUsers({ limit: 5 })

  // Calculate User Distribution
  const userDistribution = [
    { name: 'Öğrenci', value: stats?.totalStudents || 0 },
    { name: 'Öğretmen', value: stats?.totalTeachers || 0 },
    { name: 'Veli', value: stats?.totalParents || 0 },
    { name: 'Diğer', value: Math.max(0, (stats?.totalUsers || 0) - (stats?.totalStudents || 0) - (stats?.totalTeachers || 0) - (stats?.totalParents || 0)) }
  ].filter(item => item.value > 0)

  // Quick Actions Configuration
  const quickActions = [
    { label: "Kullanıcı Ekle", icon: Users, href: "/admin/users", color: "text-blue-600 bg-blue-50 border-blue-100" },
    { label: "Öğrenci Ekle", icon: GraduationCap, href: "/admin/students", color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
    { label: "Sınıf Oluştur", icon: BookOpen, href: "/admin/classes", color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { label: "Bildirim Gönder", icon: Bell, href: "/admin/notifications/send", color: "text-amber-600 bg-amber-50 border-amber-100" },
  ]

  return (
    <PageContainer
      title="Dashboard"
      description={`Hoş geldiniz, bugün sistemde ${stats?.totalActivities || 0} yeni aktivite var.`}
    >
      {/* 1. Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Toplam Öğrenci"
          value={stats?.totalStudents || 0}
          icon={GraduationCap}
          trend="up"
          trendValue="+12%"
          color="blue"
          data={[10, 15, 13, 18, 20, 25, 22]}
          delay={0.1}
        />
        <MetricCard
          title="Öğretmenler"
          value={stats?.totalTeachers || 0}
          icon={Users}
          trend="up"
          trendValue="+3%"
          color="emerald"
          data={[5, 8, 7, 10, 12, 11, 14]}
          delay={0.2}
        />
        <MetricCard
          title="Aktif Sınıflar"
          value={stats?.activeClasses || 0}
          icon={BookOpen}
          trend="neutral"
          trendValue="0%"
          color="purple"
          data={[3, 3, 3, 4, 4, 3, 3]}
          delay={0.3}
        />
        <MetricCard
          title="Değerlendirmeler"
          value={stats?.pendingAssessments || 0}
          icon={Activity}
          trend="up"
          trendValue="+8%"
          color="amber"
          data={[10, 12, 15, 18, 22, 25, 28]}
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* 2. System Status & Activity Summary */}
        <div className="space-y-6">
          <GlassCard delay={0.5}>
            <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" />
              Sistem Durumu
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100">
                <div className="flex items-center gap-3">
                  <Database className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium text-stone-700">Veritabanı</span>
                </div>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Aktif
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100">
                <div className="flex items-center gap-3">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-stone-700">AI Servisi</span>
                </div>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  Aktif
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100">
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium text-stone-700">Bildirimler</span>
                </div>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-purple-600 uppercase tracking-wider">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                  Aktif
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium text-stone-700">Cron Jobs</span>
                </div>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Zamanlı
                </span>
              </div>
            </div>
          </GlassCard>

          <GlassCard delay={0.6} className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20 relative overflow-hidden group">
            <div className="absolute top-[-20px] right-[-20px] opacity-10 group-hover:scale-110 transition-transform duration-700">
              <Sparkles size={120} className="text-primary" />
            </div>
            <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              AI Gelişim Analizi
            </h3>
            <div className="space-y-4 relative z-10">
              <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 shadow-sm">
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Target className="h-3 w-3 text-amber-500" />
                  Haftalık Öneri
                </p>
                <p className="text-sm font-medium text-stone-700 leading-relaxed italic">
                  "Öğrencilerin %70'inde dil gelişiminde hızlanma görüldü. Masa başı hikaye anlatma aktivitelerine ağırlık verilmesi önerilir."
                </p>
              </div>
              <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 shadow-sm">
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Lightbulb className="h-3 w-3 text-blue-500" />
                  Kritik İçgörü
                </p>
                <p className="text-sm font-medium text-stone-700 leading-relaxed">
                  İnce motor becerileri beklenen düzeyin üzerinde seyrediyor.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* 3. Charts Area */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="min-h-[400px]" delay={0.7}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-stone-800">Sistem Aktivitesi</h3>
                <p className="text-sm text-muted-foreground italic">Son 7 günlük etkileşim grafiği</p>
              </div>
              <div className="flex bg-stone-100 p-1 rounded-xl">
                <button className="px-4 py-1.5 text-xs font-bold bg-white shadow-sm rounded-lg transition-all">Haftalık</button>
                <button className="px-4 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-all">Aylık</button>
              </div>
            </div>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#78716c', fontSize: 10, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#78716c', fontSize: 10, fontWeight: 600 }}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                    cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                  <Area
                    type="monotone"
                    dataKey="previous"
                    stroke="#e7e5e4"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fill="none"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard delay={0.8}>
              <h3 className="text-md font-bold text-stone-800 mb-6">Kullanıcı Dağılımı</h3>
              <div className="h-[200px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {userDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-stone-800">{stats?.totalUsers || 0}</span>
                  <span className="text-[10px] text-stone-500 uppercase font-bold tracking-tighter">Toplam</span>
                </div>
              </div>
            </GlassCard>

            <GlassCard delay={0.9}>
              <h3 className="text-md font-bold text-stone-800 mb-4">Hızlı İşlemler</h3>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, i) => (
                  <Link key={i} href={action.href} className="block group">
                    <div className={`p-4 rounded-2xl border border-transparent transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:border-current/10 ${action.color} bg-opacity-20 flex flex-col items-center justify-center text-center h-full min-h-[100px]`}>
                      <action.icon className="h-6 w-6 mb-2 opacity-80 group-hover:opacity-100 transition-opacity" />
                      <span className="text-[10px] font-bold uppercase tracking-wider block leading-tight">{action.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* 4. Bottom Grid: Recent Users */}
      <GlassCard className="mb-20 md:mb-0" delay={1.0}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold text-stone-800">Son Katılan Kullanıcılar</h3>
            <p className="text-xs text-stone-500">Sisteme yeni dahil olan topluluk üyeleri</p>
          </div>
          <Link href="/admin/users">
            <Button variant="outline" size="sm" className="rounded-xl border-stone-200 hover:bg-stone-50 text-xs font-bold">
              Tümünü Gör
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {usersLoading ? (
            [1, 2, 3].map(i => <div key={i} className="h-20 bg-stone-100 rounded-2xl animate-pulse" />)
          ) : (
            recentUsers?.data?.map((user: any) => (
              <div key={user.id} className="group p-4 rounded-3xl bg-white border border-stone-100 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-white shadow-md ring-1 ring-stone-100">
                    <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xs font-bold">
                      {user.fullName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="overflow-hidden max-w-[120px]">
                    <h4 className="text-sm font-bold text-stone-900 truncate">{user.fullName}</h4>
                    <p className="text-[10px] text-stone-500 truncate opacity-80">{user.email}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-widest ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                    user.role === 'teacher' ? 'bg-blue-100 text-blue-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                    {user.role}
                  </span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-3 w-3 text-stone-400" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </PageContainer>
  )
}
