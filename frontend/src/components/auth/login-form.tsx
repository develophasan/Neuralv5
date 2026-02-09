"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label } from "@/components/ui"
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"

interface LoginFormProps {
  role: 'admin' | 'teacher' | 'parent'
  title: string
  description: string
  icon: React.ReactNode
  accentColor: string
  redirectTo: string
}

export function LoginForm({ role, title, description, icon, accentColor, redirectTo }: LoginFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const errorParam = searchParams.get('error')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        role,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else {
        router.push(redirectTo)
        router.refresh()
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md"
    >
      <Card className="rounded-2xl border-0 shadow-2xl glass-card">
        <CardHeader className="text-center pb-2">
          <div className={`h-16 w-16 rounded-2xl ${accentColor} flex items-center justify-center mx-auto mb-4`}>
            {icon}
          </div>
          <CardTitle className="text-2xl font-heading">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {(error || errorParam) && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{error || (errorParam === 'unauthorized' ? 'Bu sayfaya erişim yetkiniz yok' : errorParam)}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@harmoni.edu.tr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl"
                required
                data-testid="login-email-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl pr-10"
                  required
                  data-testid="login-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded"
                />
                <span className="text-muted-foreground">Beni hatırla</span>
              </label>
              <a href="#" className="text-sm text-primary hover:underline">
                Şifremi unuttum
              </a>
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl h-12"
              disabled={loading}
              data-testid="login-submit-button"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Giriş yapılıyor...
                </>
              ) : (
                'Giriş Yap'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <a href="/login" className="text-sm text-muted-foreground hover:text-foreground">
              ← Giriş seçeneklerine dön
            </a>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
