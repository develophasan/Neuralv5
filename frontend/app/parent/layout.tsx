"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
  LayoutDashboard, Heart, TrendingUp, Activity, Calendar,
  Sparkles, Bell, BarChart3, LogOut, User, Home, BookOpen
} from "lucide-react"
import { motion } from "framer-motion"
import { NotificationProvider } from "@/lib/realtime/notification-provider"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { useSchoolSettings } from "@/lib/providers/school-settings-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const menuItems = [
  { href: "/parent/dashboard", label: "Ana Sayfa", icon: Home },
  { href: "/parent/children", label: "Cocuklarim", icon: Heart },
  { href: "/parent/reports", label: "Gelisim Raporlari", icon: BarChart3 },
  { href: "/parent/activities", label: "Aktiviteler", icon: Activity },
  { href: "/parent/calendar", label: "Takvim", icon: Calendar },
  { href: "/parent/ai-insights", label: "AI Oneriler", icon: Sparkles },
]

// Mobile bottom navigation items
const mobileNavItems = [
  { href: "/parent/dashboard", label: "Ana Sayfa", icon: Home },
  { href: "/parent/children", label: "Cocuklar", icon: Heart },
  { href: "/parent/reports", label: "Raporlar", icon: BarChart3 },
  { href: "/parent/activities", label: "Aktivite", icon: Activity },
]

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { settings, loading } = useSchoolSettings()

  return (
    <NotificationProvider userId={session?.user?.id}>
      <div className="parent-layout flex flex-col md:flex-row">
        {/* Desktop Sidebar - Hidden on mobile */}
        <aside className="hidden md:flex parent-sidebar flex-col">
          {/* Logo */}
          <div className="mb-6">
            <Link href="/parent/dashboard" className="flex items-center gap-3">
              <div
                className="h-11 w-11 rounded-xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: settings?.logoUrl ? 'transparent' : 'hsl(var(--primary))' }}
              >
                {loading ? (
                  <div className="h-full w-full animate-pulse bg-white/10 rounded-xl" />
                ) : settings?.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="h-full w-full object-contain" />
                ) : (
                  <Heart className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                {loading ? (
                  <div className="space-y-1">
                    <div className="h-4 w-20 animate-pulse bg-stone-200 rounded" />
                    <div className="h-3 w-12 animate-pulse bg-stone-100 rounded" />
                  </div>
                ) : (
                  <>
                    <h1 className="font-heading font-bold text-lg" style={{ color: "hsl(var(--text-primary))" }}>
                      {settings?.name || "Yükleniyor..."}
                    </h1>
                    <p className="text-xs opacity-70" style={{ color: "hsl(var(--text-primary))" }}>Veli Paneli</p>
                  </>
                )}
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`parent-sidebar-item ${isActive ? 'active' : ''}`}
                  data-testid={`parent-nav-${item.href.split('/').pop()}`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* User Info */}
          <div className="pt-4 mt-4 border-t" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-10 w-10 rounded-xl overflow-hidden border border-white/10">
                <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                <AvatarFallback className="bg-primary/20 text-primary font-bold">
                  {session?.user?.name?.[0] || 'V'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-sm" style={{ color: "hsl(var(--text-primary))" }}>{session?.user?.name || 'Veli'}</p>
                <p className="text-xs opacity-60" style={{ color: "hsl(var(--text-primary))" }}>Veli</p>
              </div>
              <NotificationBell />
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="parent-sidebar-item w-full text-left text-red-500 hover:bg-red-50"
              data-testid="parent-logout-btn"
            >
              <LogOut className="h-5 w-5" />
              <span>Cikis Yap</span>
            </button>
          </div>
        </aside>

        {/* Mobile Header - Visible only on mobile */}
        <header
          className="md:hidden sticky top-0 z-40 border-b px-4 py-3 flex items-center justify-between"
          style={{ backgroundColor: "hsl(var(--sidebar-bg))", borderColor: "hsl(var(--sidebar-border))" }}
        >
          <Link href="/parent/dashboard" className="flex items-center gap-2">
            <div
              className="h-9 w-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: settings?.logoUrl ? 'transparent' : 'hsl(var(--primary))' }}
            >
              {loading ? (
                <div className="h-full w-full animate-pulse bg-white/10 rounded-lg" />
              ) : settings?.logoUrl ? (
                <img src={settings.logoUrl} alt="L" className="h-full w-full object-contain" />
              ) : (
                <Heart className="h-5 w-5 text-white" />
              )}
            </div>
            <span className="font-heading font-bold text-white">
              {loading ? "..." : (settings?.name || "Okul")}
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="p-2 rounded-lg hover:bg-stone-100"
            >
              <LogOut className="h-5 w-5 text-stone-500" />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto pb-20 md:pb-0">
          {children}
        </main>

        {/* Mobile Bottom Navigation - Visible only on mobile */}
        <nav className="md:hidden parent-mobile-nav pb-safe">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`parent-mobile-nav-item ${isActive ? 'active' : ''}`}
                data-testid={`parent-mobile-nav-${item.href.split('/').pop()}`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </NotificationProvider>
  )
}
