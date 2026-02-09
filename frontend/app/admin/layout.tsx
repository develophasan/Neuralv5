"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, Activity,
  TrendingUp, Brain, Shield, Send, LogOut, Clock, Bell,
  ChevronRight, Settings, HelpCircle, Loader2, Menu, X,
  ChevronLeft, Smartphone
} from "lucide-react"
import { NotificationProvider } from "@/lib/realtime/notification-provider"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { ErrorBoundary } from "@/components/error-boundary"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui"
import { useSchoolSettings } from "@/lib/providers/school-settings-provider"

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Kullanicılar", icon: Users },
  { href: "/admin/students", label: "Öğrenciler", icon: GraduationCap },
  { href: "/admin/classes", label: "Sınıflar", icon: BookOpen },
  { href: "/admin/activities", label: "Aktiviteler", icon: Activity },
  { href: "/admin/assessments", label: "Değerlendirmeler", icon: TrendingUp },
  { href: "/admin/audit", label: "Audit Log", icon: Shield },
  { href: "/admin/notifications/send", label: "Bildirim Gönder", icon: Send },
  { href: "/admin/cron", label: "Zamanlı Görevler", icon: Clock },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const { settings, loading } = useSchoolSettings()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Load sidebar state from localStorage
    const saved = localStorage.getItem("sidebarCollapsed")
    if (saved) setIsSidebarCollapsed(saved === "true")
  }, [])

  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed
    setIsSidebarCollapsed(newState)
    localStorage.setItem("sidebarCollapsed", String(newState))
  }

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push("/login")
  }


  return (
    <NotificationProvider userId={session?.user?.id}>
      <div className="admin-layout flex min-h-screen bg-stone-50 font-sans">
        {/* Sidebar Colors are now handled globally via RootLayout */}

        {/* Desktop Sidebar */}
        <aside
          className={`hidden md:flex flex-col sticky top-0 h-screen transition-all duration-300 admin-sidebar z-50 ${isSidebarCollapsed ? 'w-[80px]' : 'w-64'
            }`}
        >
          {/* Sidebar Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-20 rounded-full p-1 transition-colors z-[60] border shadow-md"
            style={{
              backgroundColor: 'hsl(var(--sidebar-bg))',
              borderColor: 'hsl(var(--sidebar-border))',
              color: 'hsl(var(--text-sidebar))'
            }}
          >
            {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          {/* Logo Area */}
          <div className="p-4 border-b border-[var(--sidebar-border)] h-20 flex items-center overflow-hidden"
            style={{ borderColor: 'hsl(var(--sidebar-border))' }}>
            <Link href="/admin" className="flex items-center gap-3">
              <div
                className="h-10 w-10 shrink-0 rounded-xl flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: settings?.logoUrl ? 'transparent' : 'hsl(var(--primary))' }}
              >
                {loading ? (
                  <div className="h-full w-full animate-pulse bg-white/10" />
                ) : settings?.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="h-full w-full object-contain" />
                ) : (
                  <Brain className="h-6 w-6 text-white" />
                )}
              </div>
              {!isSidebarCollapsed && (
                <div className="overflow-hidden">
                  {loading ? (
                    <div className="h-4 w-32 animate-pulse bg-white/10 rounded" />
                  ) : (
                    <h1 className="font-bold text-white text-sm leading-tight line-clamp-2" title={settings?.name || "Yükleniyor..."}>
                      {settings?.name || "Yükleniyor..."}
                    </h1>
                  )}
                </div>
              )}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-hide py-6">
            {menuItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${isActive
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'opacity-70 hover:bg-primary/5 hover:opacity-100'
                    }`}
                  style={{ color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--text-sidebar))' }}
                  title={isSidebarCollapsed ? item.label : ""}
                >
                  <item.icon
                    className={`p-2 rounded-xl transition-colors duration-200 ${isActive
                      ? 'bg-primary/20 text-primary'
                      : 'bg-white/5 opacity-60 group-hover:opacity-100'}`}
                    style={{ color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--text-sidebar))' }}
                  />
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                  {isActive && !isSidebarCollapsed && <ChevronRight className="h-4 w-4 ml-auto opacity-50" />}
                  {isActive && isSidebarCollapsed && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Footer Navigation */}
          <div className="p-3 border-t h-32 flex flex-col justify-end space-y-1 py-4"
            style={{ borderTopColor: 'hsl(var(--sidebar-border))' }}>
            <Link
              href="/admin/settings"
              className={`flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl transition-all ${pathname === '/admin/settings' ? 'bg-primary/10 text-primary' : 'opacity-70 hover:opacity-100 hover:bg-primary/5'
                }`}
              style={{ color: pathname === '/admin/settings' ? 'hsl(var(--primary))' : 'hsl(var(--text-sidebar))' }}
            >
              <Settings className="h-5 w-5 shrink-0" />
              {!isSidebarCollapsed && <span>Okul Ayarları</span>}
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium text-red-400 rounded-xl hover:text-red-300 hover:bg-red-900/20 transition-all text-left"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {!isSidebarCollapsed && <span>Çıkış Yap</span>}
            </button>
          </div>
        </aside>


        {/* Mobile Header (Fixed Top) */}
        <header
          className="md:hidden fixed top-0 left-0 right-0 h-16 border-b flex items-center justify-between px-4 z-[100]"
          style={{ backgroundColor: 'hsl(var(--sidebar-bg))', borderColor: 'hsl(var(--sidebar-border))' }}
        >
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white p-2">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center overflow-hidden">
              {settings?.logoUrl ? <img src={settings.logoUrl} alt="L" className="h-full w-full object-contain" /> : <Brain size={18} className="text-white" />}
            </div>
            <span className="font-bold text-white text-sm truncate max-w-[150px]">{settings?.name || "Harmoni OS"}</span>
          </div>
          <NotificationBell />
        </header>

        {/* Mobile Side Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Side Menu */}
        <div
          className={`md:hidden fixed top-0 left-0 h-screen w-[280px] z-[120] transition-transform duration-300 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col border-r`}
          style={{ backgroundColor: 'hsl(var(--sidebar-bg))', borderColor: 'hsl(var(--sidebar-border))' }}
        >
          <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'hsl(var(--sidebar-border))' }}>
            <div className="flex items-center gap-3">
              <Brain size={24} className="text-primary" />
              <span className="font-bold text-white">Harmoni OS</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="text-stone-500 hover:text-white">
              <X size={20} />
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3.5 text-sm font-medium rounded-xl transition-all ${pathname === item.href ? 'bg-primary/10 text-primary' : 'text-stone-400'
                  }`}
              >
                <item.icon size={20} className={pathname === item.href ? "text-primary" : ""} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-[var(--sidebar-border)] flex flex-col gap-2 mb-20">
            <Link
              href="/admin/settings"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-stone-400 rounded-xl"
            >
              <Settings size={20} />
              <span>Okul Ayarları</span>
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-red-400 rounded-xl">
              <LogOut size={20} />
              <span>Çıkış Yap</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar (Desktop Only) */}
          <header className="hidden md:flex h-20 bg-white border-b border-stone-200 px-8 items-center justify-between sticky top-0 z-40 backdrop-blur-md bg-white/80">
            <div className="flex items-center gap-4">
              <div className="h-8 w-1 bg-primary rounded-full shadow-sm shadow-primary/40" />
              <h2 className="font-heading font-bold text-xl text-stone-800 tracking-tight">
                {menuItems.find(item =>
                  pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(item.href))
                )?.label || 'Dashboard'}
              </h2>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <NotificationBell />
              </div>
              <div className="h-8 w-px bg-stone-200 mx-1" />
              <Link href="/admin/profile" className="flex items-center gap-3 group transition-all">
                <div className="flex flex-col items-end">
                  <p className="text-sm font-bold text-stone-800 group-hover:text-primary transition-colors duration-200">{session?.user?.name || 'Admin'}</p>
                  <p className="text-[10px] text-stone-500 uppercase tracking-tighter font-bold opacity-60">Yönetici Paneli</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-stone-100 flex items-center justify-center border border-stone-200 overflow-hidden shadow-sm group-hover:border-primary/30 transition-all duration-200">
                  {session?.user?.image ? (
                    <img src={session.user.image} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-stone-600 group-hover:text-primary">
                      {session?.user?.name?.[0] || 'A'}
                    </span>
                  )}
                </div>
              </Link>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-x-hidden pt-16 md:pt-0 pb-24 md:pb-6 px-4 md:px-6">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-stone-200 flex items-center justify-around px-2 z-[90] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-[32px]">
          <Link href="/admin" className={`flex flex-col items-center gap-1.5 p-2 transition-all ${pathname === '/admin' ? 'text-primary' : 'text-stone-400'}`}>
            <LayoutDashboard size={22} className={pathname === '/admin' ? "text-primary" : ""} />
            <span className="text-[10px] font-bold uppercase tracking-tight">Dashboard</span>
          </Link>
          <Link href="/admin/students" className={`flex flex-col items-center gap-1.5 p-2 transition-all ${pathname.startsWith('/admin/students') ? 'text-primary' : 'text-stone-400'}`}>
            <GraduationCap size={22} className={pathname.startsWith('/admin/students') ? "text-primary" : ""} />
            <span className="text-[10px] font-bold uppercase tracking-tight">Öğrenciler</span>
          </Link>
          <div className="relative -top-6">
            <Link href="/admin/notifications/send" className="h-14 w-14 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/40 transition-transform active:scale-90 bg-primary">
              <Send size={24} />
            </Link>
          </div>
          <Link href="/admin/classes" className={`flex flex-col items-center gap-1.5 p-2 transition-all ${pathname.startsWith('/admin/classes') ? 'text-primary' : 'text-stone-400'}`}>
            <BookOpen size={22} className={pathname.startsWith('/admin/classes') ? "text-primary" : ""} />
            <span className="text-[10px] font-bold uppercase tracking-tight">Sınıflar</span>
          </Link>
          <Link href="/admin/profile" className={`flex flex-col items-center gap-1.5 p-2 transition-all ${pathname === '/admin/profile' ? 'text-primary' : 'text-stone-400'}`}>
            <div className={`h-[22px] w-[22px] rounded-full border overflow-hidden ${pathname === '/admin/profile' ? 'border-primary' : 'border-stone-300'}`}>
              {session?.user?.image ? <img src={session.user.image} className="h-full w-full object-cover" /> : <Users size={14} className="m-auto" />}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tight">Profil</span>
          </Link>
        </nav>
      </div>
    </NotificationProvider >
  )
}
