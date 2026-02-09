"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge } from "@/components/ui"
import { GraduationCap, TrendingUp, Activity, Calendar, ArrowLeft, Plus, Star, ShieldCheck, Heart, User, ChevronRight, Zap } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useTeacherStudent } from "@/hooks/api/use-teacher"
import { NeuroDNAProfile } from "@/components/neuro/NeuroDNAProfile"
import { motion, AnimatePresence } from "framer-motion"

export default function TeacherStudentDetailPage() {
  const params = useParams()
  const { data: student, isLoading: loading } = useTeacherStudent(params.id as string | null)

  const calculateAge = (dateOfBirth: string) => {
    const birth = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center bg-mesh-gradient">
        <div className="text-center">
          <div className="h-16 w-16 border-4 border-sapphire-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-slate-500 font-black uppercase tracking-widest text-sm text-center">Profil Verileri Hazırlanıyor...</p>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="min-h-screen p-8 flex flex-col items-center justify-center teacher-layout text-center">
        <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
          <User className="h-10 w-10 text-slate-300" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Öğrenci Bulunamadı</h2>
        <p className="text-slate-500 mb-8 max-w-sm">Erişmeye çalıştığınız profil silinmiş veya başka bir sınıfa aktarılmış olabilir.</p>
        <Link href="/teacher/students">
          <Button variant="outline" className="rounded-2xl border-2">Sınıf Listesine Dön</Button>
        </Link>
      </div>
    )
  }

  const age = calculateAge(student.dateOfBirth)
  const classInfo = student.classStudents?.[0]?.class
  const lastAssessment = student.assessments?.[0]

  return (
    <div className="min-h-screen teacher-layout p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Header - Premium Sapphire Style */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col md:flex-row items-center md:items-start gap-8"
          >
            <div className="relative">
              <div className="h-24 w-24 md:h-32 md:w-32 rounded-[2.5rem] bg-gradient-to-br from-sapphire-600 to-indigo-700 shadow-2xl flex items-center justify-center relative z-10 overflow-hidden text-5xl font-black text-white">
                {student.firstName[0]}
              </div>
              <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg border-4 border-white z-20">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>

            <div className="text-center md:text-left pt-2">
              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-3">
                <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-slate-900 tracking-tight">
                  {student.firstName} {student.lastName}
                </h1>
                <Badge className="bg-amber-50 text-amber-600 border-amber-100 rounded-full px-4 py-1 self-center md:self-auto font-black text-[10px] uppercase tracking-widest">
                  AKTİF ÖĞRENCİ
                </Badge>
              </div>
              <p className="text-slate-500 text-xl font-medium tracking-tight">
                {age} Yaşında <span className="text-slate-300 mx-2">|</span> {classInfo?.name} • {classInfo?.ageGroup} Yaş Grubu
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3"
          >
            <Link href="/teacher/students">
              <Button variant="outline" className="h-14 w-14 rounded-2xl border-2 border-slate-100 hover:bg-slate-50 transition-all p-0">
                <ArrowLeft className="h-6 w-6 text-slate-600" />
              </Button>
            </Link>
            <Link href={`/teacher/assessments/new?studentId=${student.id}`}>
              <Button className="h-14 px-8 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all gap-2 shadow-xl shadow-slate-200">
                <Zap className="h-5 w-5 text-amber-400" />
                Hızlı Analiz Başlat
              </Button>
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol Kolon - Neuro Bilgileri ve Arşivler */}
          <div className="lg:col-span-2 space-y-10">
            {/* Neuro DNA Profile - Integrates seamlessly into our grid */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <NeuroDNAProfile studentId={student.id} />
            </motion.div>

            {/* Son Değerlendirme - Premium Look */}
            {lastAssessment && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div className="teacher-card-premium group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-sapphire-50 border border-sapphire-100 flex items-center justify-center">
                        <TrendingUp className="h-7 w-7 text-sapphire-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Son Gelişim Analizi</h3>
                        <p className="text-sm font-bold text-slate-400">
                          {new Date(lastAssessment.assessmentDate).toLocaleDateString("tr-TR", { day: 'numeric', month: 'long', year: 'numeric' })} tarihinde yapıldı.
                        </p>
                      </div>
                    </div>
                    <Link href={`/teacher/assessments?studentId=${student.id}`}>
                      <Button variant="outline" className="rounded-xl border-2 border-slate-100 font-bold hover:bg-slate-50">
                        Arşive Git
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    {lastAssessment.scores.slice(0, 5).map((score: any, idx: number) => (
                      <div key={idx} className="p-6 rounded-[2rem] bg-slate-50/50 border border-slate-100 flex flex-col items-center text-center group-hover:bg-white transition-all">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 h-8 leading-tight flex items-center">
                          {score.domain.nameTr}
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-slate-900">{score.score}</span>
                          <span className="text-xs font-bold text-slate-300">/5</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {lastAssessment.notes && (
                    <div className="mt-8 p-6 rounded-3xl bg-indigo-50/30 border-2 border-dashed border-indigo-100 italic text-slate-600 font-medium">
                      &ldquo;{lastAssessment.notes}&rdquo;
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Son Günlük Loglar */}
            {student.dailyLogs && student.dailyLogs.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <div className="teacher-card-premium">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                        <Calendar className="h-7 w-7 text-amber-500" />
                      </div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">Yaşam Takip Akışı</h3>
                    </div>
                    <Link href={`/teacher/daily-logs?studentId=${student.id}`}>
                      <Button variant="ghost" className="text-slate-400 font-black text-xs tracking-widest hover:text-slate-600">tümünü gör</Button>
                    </Link>
                  </div>

                  <div className="space-y-4">
                    {student.dailyLogs.slice(0, 3).map((log: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-6 p-6 rounded-3xl border border-slate-100 hover:border-slate-200 transition-all">
                        <div className="hidden sm:flex flex-col items-center justify-center w-24 text-center border-r-2 border-slate-100 pr-6">
                          <span className="text-3xl font-black text-slate-900">{new Date(log.logDate).getDate()}</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(log.logDate).toLocaleDateString('tr-TR', { month: 'short' })}</span>
                        </div>
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">BESLENME</span>
                            <span className="text-sm font-bold text-slate-700">{log.breakfastEaten ? 'Gayet İyi' : 'Normal'}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">UYKU</span>
                            <span className="text-sm font-bold text-slate-700">{log.napDurationMinutes || '0'} Dakika</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">SAĞLIK</span>
                            <span className="text-sm font-bold text-emerald-600">Her Şey Yolunda</span>
                          </div>
                          <div className="flex items-center justify-end">
                            <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                              <ChevronRight className="h-5 w-5" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sağ Kolon - Hızlı İşlemler ve Özetler */}
          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <div className="glass-card-premium p-8 space-y-6 border-slate-100 shadow-2xl">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <Activity className="h-5 w-5 text-indigo-500" />
                  Hızlı İşlemler
                </h3>
                <div className="space-y-3">
                  <Link href={`/teacher/assessments/new?studentId=${student.id}`} className="block">
                    <Button className="w-full h-14 bg-white border-2 border-slate-100 text-slate-900 font-bold hover:bg-slate-50 transition-all justify-start px-6 gap-3 rounded-2xl">
                      <TrendingUp className="h-5 w-5 text-sapphire-600" />
                      Değerlendirme Yap
                    </Button>
                  </Link>
                  <Link href={`/teacher/daily-logs?studentId=${student.id}&tab=bulk-log`} className="block">
                    <Button className="w-full h-14 bg-white border-2 border-slate-100 text-slate-900 font-bold hover:bg-slate-50 transition-all justify-start px-6 gap-3 rounded-2xl">
                      <Calendar className="h-5 w-5 text-amber-500" />
                      Günlük Log Ekle
                    </Button>
                  </Link>
                  <Link href={`/teacher/students/${student.id}/edit`} className="block">
                    <Button className="w-full h-14 bg-white border-2 border-slate-100 text-slate-900 font-bold hover:bg-slate-50 transition-all justify-start px-6 gap-3 rounded-2xl">
                      <Star className="h-5 w-5 text-pink-500" />
                      Profil Düzenle
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <div className="teacher-card-premium p-8 bg-gradient-to-br from-slate-900 to-indigo-950 text-white border-0 shadow-2xl">
                <h3 className="text-lg font-black uppercase tracking-tight mb-8 opacity-60">SİSTEM ÖZETİ</h3>
                <div className="space-y-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-indigo-300" />
                      </div>
                      <span className="font-bold text-slate-300">Toplam Analiz</span>
                    </div>
                    <span className="text-3xl font-black">{student.assessments?.length || 0}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-amber-300" />
                      </div>
                      <span className="font-bold text-slate-300">Günlük Kayıt</span>
                    </div>
                    <span className="text-3xl font-black">{student.dailyLogs?.length || 0}</span>
                  </div>

                  <div className="pt-6 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <Heart className="h-5 w-5 text-pink-500 fill-pink-500" />
                      <span className="text-sm font-bold text-slate-300 uppercase tracking-widest">AİLE ETKİLEŞİMİ</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-4/5 bg-gradient-to-r from-pink-500 to-rose-400" />
                      </div>
                      <span className="text-xs font-black">%82</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

