"use client"

import { LoginForm } from "@/components/auth/login-form"
import { Users, Brain } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

function AdminLoginContent() {
  return (
    <LoginForm
      role="admin"
      title="Yönetici Girişi"
      description="Okul yönetim sistemine erişin"
      icon={<Users className="h-8 w-8 text-harmony-brain" />}
      accentColor="bg-gradient-to-br from-harmony-brain/20 to-harmony-brain/5"
      redirectTo="/admin"
    />
  )
}

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-harmony-soft via-white to-harmony-soft/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Brain className="h-8 w-8 text-harmony-brain" />
            <span className="text-2xl font-heading font-bold bg-gradient-to-r from-harmony-brain to-harmony-heart bg-clip-text text-transparent">
              Harmoni OS
            </span>
          </Link>
        </div>

        <Suspense fallback={<div className="text-center">Yükleniyor...</div>}>
          <AdminLoginContent />
        </Suspense>
      </div>
    </main>
  )
}
