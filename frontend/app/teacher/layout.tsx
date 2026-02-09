"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
  LayoutDashboard, BookOpen, GraduationCap, TrendingUp,
  FileText, Brain, Send, LogOut, Smile, CalendarDays, Menu
} from "lucide-react"
import { motion } from "framer-motion"
import { NotificationProvider } from "@/lib/realtime/notification-provider"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { useSchoolSettings } from "@/lib/providers/school-settings-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const menuItems = [
  { href: "/teacher/dashboard", label: "Ana Sayfa", icon: LayoutDashboard, color: "text-orange-500" },
  { href: "/teacher/classes", label: "Sınıflarım", icon: BookOpen, color: "text-blue-500" },
  { href: "/teacher/students", label: "Öğrencilerim", icon: GraduationCap, color: "text-purple-500" },
  { href: "/teacher/assessments", label: "Değerlendirme", icon: TrendingUp, color: "text-emerald-500" },
  { href: "/teacher/daily-logs", label: "Günlük Takip", icon: CalendarDays, color: "text-orange-500" },
  { href: "/teacher/mood-tracker", label: "Duygu Durumu", icon: Smile, color: "text-pink-500" },
  { href: "/teacher/reports", label: "Raporlar", icon: FileText, color: "text-indigo-500" },
  { href: "/teacher/notifications/send", label: "Bildirim Gönder", icon: Send, color: "text-amber-500" },
]

function TeacherSidebarContent({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { settings, loading } = useSchoolSettings()

  return (
    <div className="flex flex-col h-full bg-white md:bg-transparent">
      {/* Logo */}
      <div className="mb-6 px-2">
        <Link href="/teacher/dashboard" className="flex items-center gap-3" onClick={onItemClick}>
          <motion.div
            className="h-12 w-12 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all border border-stone-100"
            style={{ backgroundColor: settings?.logoUrl ? 'transparent' : 'white' }}
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? (
              <div className="h-full w-full animate-pulse bg-stone-100 rounded-xl" />
            ) : settings?.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="h-full w-full object-contain" />
            ) : (
              <div className="bg-gradient-to-br from-primary to-primary/80 h-full w-full rounded-xl flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
            )}
          </motion.div>
          <div>
            {loading ? (
              <div className="space-y-2">
                <div className="h-4 w-20 animate-pulse bg-stone-200 rounded" />
                <div className="h-3 w-12 animate-pulse bg-stone-100 rounded" />
              </div>
            ) : (
              <>
                <h1 className="font-playful font-bold text-lg leading-tight text-stone-800">
                  {settings?.name || "Harmoni OS"}
                </h1>
                <p className="text-xs text-stone-500 font-medium">Öğretmen Paneli</p>
              </>
            )}
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-hide py-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive
                ? 'bg-gradient-to-r from-primary/10 to-primary/5 text-primary font-semibold shadow-sm'
                : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                }`}
            >
              <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-primary text-white shadow-sm' : 'bg-stone-100/80 group-hover:bg-white'
                }`}>
                <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : item.color}`} />
              </div>
              <span className="text-sm relative z-10">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute left-0 w-1 h-1/2 bg-primary rounded-r-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="pt-4 mt-auto border-t border-stone-100 px-2 pb-2">
        <Link
          href="/teacher/profile"
          onClick={onItemClick}
          className="flex items-center gap-3 p-3 mb-2 bg-stone-50/50 hover:bg-stone-100 transition-all rounded-xl border border-stone-100/50 text-left group"
        >
          <Avatar className="h-10 w-10 rounded-xl shadow-sm border border-stone-200 group-hover:scale-105 transition-transform shrink-0">
            <AvatarImage src={session?.user?.image || ""} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white font-bold text-sm">
              {session?.user?.name?.[0] || 'Ö'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-stone-800 truncate group-hover:text-primary transition-colors">{session?.user?.name || 'Öğretmen'}</p>
            <p className="text-xs text-stone-500">Profil Ayarları</p>
          </div>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all border border-transparent hover:border-red-100"
        >
          <LogOut className="h-4 w-4" />
          Çıkış Yap
        </button>
      </div>
    </div>
  )
}

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <NotificationProvider userId={session?.user?.id}>
      <div className="flex h-screen w-full flex-col md:flex-row bg-stone-50/30 overflow-hidden">

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-md border-b sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-primary to-primary/80 h-8 w-8 rounded-lg flex items-center justify-center shadow-lg">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg text-stone-800 tracking-tight">Harmoni OS</span>
          </div>
          <div className="flex items-center gap-1">
            <NotificationBell align="down" />
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 text-stone-600">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85%] max-w-[300px] p-5 pt-8">
                <TeacherSidebarContent onItemClick={() => setIsMobileOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-72 flex-col border-r bg-white/50 backdrop-blur-sm p-6 h-screen sticky top-0 overflow-hidden z-10 transition-all duration-300">
          <TeacherSidebarContent />
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Desktop Top Bar */}
          <header className="hidden md:flex items-center justify-end px-8 py-4 bg-white/50 backdrop-blur-sm border-b border-stone-100 z-10 shrink-0">
            <div className="flex items-center gap-4">
              <NotificationBell align="down" />
            </div>
          </header>

          {/* Scrollable Content */}
          <main className="flex-1 overflow-auto p-4 md:p-8 relative scroll-smooth focus:scroll-auto">
            {children}
          </main>
        </div>
      </div>
    </NotificationProvider>
  )
}
