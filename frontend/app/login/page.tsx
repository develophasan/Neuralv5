"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from "@/components/ui"
import { Users, BookOpen, Heart, Brain } from "lucide-react"
import { motion } from "framer-motion"

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-harmony-soft via-white to-harmony-soft/50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Logo & Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="h-10 w-10 text-harmony-brain" />
            <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-harmony-brain to-harmony-heart bg-clip-text text-transparent">
              Harmoni OS
            </h1>
          </div>
          <p className="text-muted-foreground">
            Nörobilim Temelli Eğitim Platformuna Hoş Geldiniz
          </p>
        </motion.div>

        {/* Login Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link href="/login/admin">
              <Card className="h-full cursor-pointer hover:shadow-xl transition-all rounded-2xl border-0 glass-card hover-lift">
                <CardHeader className="text-center">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-harmony-brain/20 to-harmony-brain/5 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-harmony-brain" />
                  </div>
                  <CardTitle className="text-xl font-heading">Yönetici Girişi</CardTitle>
                  <CardDescription>
                    Okul yönetimi ve sistem kontrolü
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full rounded-xl bg-harmony-brain hover:bg-harmony-brain/90">
                    Giriş Yap
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link href="/login/teacher">
              <Card className="h-full cursor-pointer hover:shadow-xl transition-all rounded-2xl border-0 glass-card hover-lift">
                <CardHeader className="text-center">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-neuro-purple/20 to-neuro-purple/5 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-neuro-purple" />
                  </div>
                  <CardTitle className="text-xl font-heading">Öğretmen Girişi</CardTitle>
                  <CardDescription>
                    Sınıf ve öğrenci yönetimi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full rounded-xl bg-neuro-purple hover:bg-neuro-purple/90">
                    Giriş Yap
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link href="/login/parent">
              <Card className="h-full cursor-pointer hover:shadow-xl transition-all rounded-2xl border-0 glass-card hover-lift">
                <CardHeader className="text-center">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-harmony-heart/20 to-harmony-heart/5 flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-harmony-heart" />
                  </div>
                  <CardTitle className="text-xl font-heading">Veli Girişi</CardTitle>
                  <CardDescription>
                    Çocuğunuzun gelişimini takip edin
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full rounded-xl bg-harmony-heart hover:bg-harmony-heart/90">
                    Giriş Yap
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-muted-foreground">
            © 2024 Harmoni Anaokulu. Tüm hakları saklıdır.
          </p>
        </motion.div>
      </div>
    </main>
  )
}
