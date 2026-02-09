"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from "@/components/ui"
import { GraduationCap, Users, BookOpen, Heart, Brain, Activity, LogIn } from "lucide-react"
import { motion } from "framer-motion"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-harmony-soft via-white to-harmony-soft/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="h-12 w-12 text-harmony-brain" />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold mb-4 tracking-tight bg-gradient-to-r from-harmony-brain to-harmony-heart bg-clip-text text-transparent">
            Harmoni Anaokulu
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-6">
            Nörobilim Temelli Bütünleşik Eğitim Platformu
          </p>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            2-6 yaş arası çocukların bilişsel (zihin) ve duygusal (kalp) gelişimini 
            bütünsel olarak takip eden modern eğitim platformu
          </p>
          <Link href="/login">
            <Button size="lg" className="rounded-xl px-8 py-6 h-auto text-lg bg-gradient-to-r from-harmony-brain to-harmony-heart hover:opacity-90">
              <LogIn className="h-5 w-5 mr-2" />
              Platforma Giriş Yap
            </Button>
          </Link>
        </motion.div>

        {/* Giriş Seçenekleri */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12 sm:mb-16"
        >
          <h2 className="text-2xl font-heading font-bold text-center mb-6">Hızlı Erişim</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/login/admin">
              <Card className="h-full cursor-pointer hover:shadow-xl transition-all rounded-2xl border-0 glass-card hover-lift">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-harmony-brain/20 to-harmony-brain/5 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-harmony-brain" />
                  </div>
                  <CardTitle className="text-xl font-heading">İdare / Okul Yönetimi</CardTitle>
                  <CardDescription className="text-sm">
                    Sistem yönetimi, kullanıcı yönetimi ve genel bakış
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full rounded-xl bg-harmony-brain hover:bg-harmony-brain/90">Giriş Yap</Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/login/teacher">
              <Card className="h-full cursor-pointer hover:shadow-xl transition-all rounded-2xl border-0 glass-card hover-lift">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-neuro-purple/20 to-neuro-purple/5 flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6 text-neuro-purple" />
                  </div>
                  <CardTitle className="text-xl font-heading">Öğretmen Paneli</CardTitle>
                  <CardDescription className="text-sm">
                    Sınıf yönetimi, öğrenci takibi ve değerlendirmeler
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full rounded-xl bg-neuro-purple hover:bg-neuro-purple/90">Giriş Yap</Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/login/parent">
              <Card className="h-full cursor-pointer hover:shadow-xl transition-all rounded-2xl border-0 glass-card hover-lift">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-harmony-heart/20 to-harmony-heart/5 flex items-center justify-center mb-4">
                    <Heart className="h-6 w-6 text-harmony-heart" />
                  </div>
                  <CardTitle className="text-xl font-heading">Veli Paneli</CardTitle>
                  <CardDescription className="text-sm">
                    Çocuğunuzun gelişimini takip edin ve aktiviteleri görün
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full rounded-xl bg-harmony-heart hover:bg-harmony-heart/90">Giriş Yap</Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </motion.div>

        {/* Özellikler */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-center mb-6 sm:mb-8 tracking-tight text-foreground">10 Nörogelişimsel Alan</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            {[
              { name: 'Yürütücü İşlevler', icon: Brain },
              { name: 'Dil ve İletişim', icon: Users },
              { name: 'Sosyal/Duygusal', icon: Heart },
              { name: 'Kaba Motor', icon: Activity },
              { name: 'İnce Motor', icon: Activity },
              { name: 'Mantıksal/Sayısal', icon: Brain },
              { name: 'Yaratıcı İfade', icon: Heart },
              { name: 'Mekansal Farkındalık', icon: Brain },
              { name: 'Dünya Keşfi', icon: GraduationCap },
              { name: 'Öz-Bakım', icon: Users },
            ].map((item, idx) => (
              <Card key={idx} className="text-center">
                <CardContent className="pt-6 pb-6">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-foreground">{item.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Bilgi */}
        <Card className="bg-muted/30 border-border">
          <CardContent className="pt-6 pb-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                MindChamps ve Harvard Center on the Developing Child metodolojilerinden esinlenilmiştir.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
