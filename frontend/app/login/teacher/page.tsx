"use client"

import { LoginForm } from "@/components/auth/login-form"
import { BookOpen, Brain } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

function TeacherLoginContent() {
  return (
    <LoginForm
      role="teacher"
      title="Öğretmen Girişi"
      description="Sınıf ve öğrenci yönetimine erişin"
      icon={<BookOpen className="h-8 w-8 text-neuro-purple" />}
      accentColor="bg-gradient-to-br from-neuro-purple/20 to-neuro-purple/5"
      redirectTo="/teacher/dashboard"
    />
  )
}

export default function TeacherLoginPage() {
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
          <TeacherLoginContent />
        </Suspense>
      </div>
    </main>
  )
}
