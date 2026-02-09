"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
  LayoutDashboard, BookOpen, GraduationCap, TrendingUp,
  Activity, FileText, Brain, Send, LogOut, Smile, CalendarDays
} from "lucide-react"
import { motion } from "framer-motion"
import { NotificationProvider } from "@/lib/realtime/notification-provider"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { useSchoolSettings } from "@/lib/providers/school-settings-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const menuItems = [
  { href: "/teacher/dashboard", label: "Ana Sayfa", icon: LayoutDashboard, color: "text-brand-500" },
  { href: "/teacher/classes", label: "Siniflarim", icon: BookOpen, color: "text-blue-500" },
  { href: "/teacher/students", label: "Ogrencilerim", icon: GraduationCap, color: "text-purple-500" },
  { href: "/teacher/assessments", label: "Degerlendirme", icon: TrendingUp, color: "text-emerald-500" },
  { href: "/teacher/daily-logs", label: "Gunluk Takip", icon: CalendarDays, color: "text-orange-500" },
  { href: "/teacher/mood-tracker", label: "Duygu Durumu", icon: Smile, color: "text-pink-500" },
  { href: "/teacher/reports", label: "Raporlar", icon: FileText, color: "text-indigo-500" },
  { href: "/teacher/notifications/send", label: "Bildirim Gonder", icon: Send, color: "text-amber-500" },
]

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { settings, loading } = useSchoolSettings()

  return (
    <NotificationProvider userId={session?.user?.id}>
      <div className="teacher-layout flex">
        {/* Sidebar - Playful & Touch-Friendly */}
        <aside className="teacher-sidebar flex flex-col">
          {/* Logo */}
          <div className="mb-8">
            <Link href="/teacher/dashboard" className="flex items-center gap-3">
              <motion.div
                className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: settings?.logoUrl ? 'transparent' : 'hsl(var(--primary))' }}
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                {loading ? (
                  <div className="h-full w-full animate-pulse bg-white/10 rounded-2xl" />
                ) : settings?.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="h-full w-full object-contain" />
                ) : (
                  <Brain className="h-8 w-8 text-white" />
                )}
              </motion.div>
              <div>
                {loading ? (
                  <div className="space-y-2">
                    <div className="h-5 w-24 animate-pulse bg-stone-200 rounded" />
                    <div className="h-3 w-16 animate-pulse bg-stone-100 rounded" />
                  </div>
                ) : (
                  <>
                    <h1 className="font-playful font-bold text-xl" style={{ color: "hsl(var(--text-primary))" }}>
                      {settings?.name || "Yükleniyor..."}
                    </h1>
                    <p className="text-sm opacity-70" style={{ color: "hsl(var(--text-primary))" }}>Ogretmen Paneli</p>
                  </>
                )}
              </div>
            </Link>
          </div>

          {/* Navigation - Large Touch Targets */}
          <nav className="flex-1 space-y-2 overflow-y-auto scrollbar-hide">
            {menuItems.map((item, index) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    className={`teacher-sidebar-item touch-target ${isActive ? 'active' : ''}`}
                    style={{ color: isActive ? "white" : "hsl(var(--text-sidebar))" }}
                    data-testid={`teacher-nav-${item.href.split('/').pop()}`}
                  >
                    <div className={`p-2 rounded-xl ${isActive ? 'bg-white/20' : 'bg-stone-100/50'}`}>
                      <item.icon className={`h-6 w-6 ${isActive ? 'text-white' : item.color}`} />
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </motion.div>
              )
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="pt-4 mt-4 border-t border-stone-100">
            <div className="flex items-center gap-3 px-4 py-3 mb-2">
              <Avatar className="h-12 w-12 rounded-2xl shadow-play border-2 border-white">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="bg-gradient-play text-white text-lg font-bold">
                  {session?.user?.name?.[0] || 'O'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-stone-800 truncate">{session?.user?.name || 'Ogretmen'}</p>
                <p className="text-sm text-stone-500">Ogretmen</p>
              </div>
              <NotificationBell />
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="teacher-sidebar-item w-full text-left text-red-500 hover:bg-red-50"
              data-testid="teacher-logout-btn"
            >
              <div className="p-2 rounded-xl bg-red-100">
                <LogOut className="h-6 w-6 text-red-500" />
              </div>
              <span className="font-medium">Cikis Yap</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </NotificationProvider>
  )
}
