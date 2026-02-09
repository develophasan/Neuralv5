"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input } from "@/components/ui"
import { GraduationCap, Search, ArrowRight, X } from "lucide-react"
import Link from "next/link"
import { useTeacherId, useTeacherStudents } from "@/hooks/api/use-teacher"
import { motion, AnimatePresence } from "framer-motion"

export default function TeacherStudentsPage() {
  const { data: teacherId, isLoading: teacherIdLoading, error: teacherIdError } = useTeacherId()
  const { data: students = [], isLoading: studentsLoading, error: studentsError } = useTeacherStudents(teacherId || null)
  const [search, setSearch] = useState("")

  const loading = teacherIdLoading || studentsLoading
  const error = teacherIdError || studentsError

  if (error) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center bg-mesh-gradient">
        <div className="text-center p-12 glass-card-premium rounded-[2rem] max-w-md">
          <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Eyvah! Bir Hata Oluştu</h2>
          <p className="text-slate-500 mb-8">{error instanceof Error ? error.message : 'Veriler alınırken bir sorun çıktı.'}</p>
          <Button onClick={() => window.location.reload()} className="teacher-btn-premium bg-slate-900 text-white w-full">Yeniden Dene</Button>
        </div>
      </div>
    )
  }

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

  const filteredStudents = students.filter((student) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      student.firstName.toLowerCase().includes(searchLower) ||
      student.lastName.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center bg-mesh-gradient">
        <div className="text-center">
          <div className="h-16 w-16 border-4 border-sapphire-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Kahramanlar Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen teacher-layout p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-slate-900 mb-3 tracking-tight">
              Geleceğin <span className="text-transparent bg-clip-text bg-gradient-to-r from-sapphire-600 to-indigo-600">Yıldızları</span>
            </h1>
            <p className="text-slate-500 text-xl font-medium">
              Sınıfındaki tüm minik kahramanlara buradan ulaşabilirsin.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full md:w-96 relative group"
          >
            <div className="absolute inset-0 bg-sapphire-500/5 blur-xl group-hover:bg-sapphire-500/10 transition-all rounded-full" />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-sapphire-500 transition-colors" />
            <Input
              placeholder="Öğrenci adı veya soyadı..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-14 bg-white/70 backdrop-blur-md border-slate-100 rounded-2xl shadow-sm focus:ring-sapphire-500/20 focus:border-sapphire-500 text-lg transition-all"
            />
          </motion.div>
        </div>

        {/* Öğrenci Listesi */}
        <div className="relative">
          <AnimatePresence mode="popLayout">
            {filteredStudents.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div className="text-center py-24 glass-card-premium rounded-[3rem]">
                  <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="h-10 w-10 text-slate-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Hımm, kimseyi bulamadık!</h3>
                  <p className="text-slate-500 font-medium">{search ? 'Aradığın kriterlere uygun yıldızımız yok gibi görünüyor.' : 'Henüz bu sınıfa atanmış bir yıldız yok.'}</p>
                  {search && <Button onClick={() => setSearch("")} variant="link" className="mt-4 text-sapphire-600 font-bold">Aramayı Temizle</Button>}
                </div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredStudents.map((student, idx) => {
                  const age = calculateAge(student.dateOfBirth)
                  const classInfo = student.classStudents[0]?.class

                  return (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      layout
                    >
                      <Link href={`/teacher/students/${student.id}`}>
                        <div className="teacher-card-premium group h-full">
                          <div className="flex items-start justify-between mb-6">
                            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-sapphire-50 to-indigo-50 border border-slate-100 flex items-center justify-center overflow-hidden shadow-inner group-hover:scale-110 transition-transform duration-500">
                              {student.photoUrl ? (
                                <img src={student.photoUrl} alt={student.firstName} className="h-full w-full object-cover" />
                              ) : (
                                <GraduationCap className="h-10 w-10 text-sapphire-600 transform -rotate-6" />
                              )}
                            </div>
                            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${student.gender === 'male' ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'
                              }`}>
                              {student.gender === 'male' ? 'Prens' : 'Prenses'}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <h3 className="text-2xl font-black text-slate-900 group-hover:text-sapphire-600 transition-colors leading-tight">
                                {student.firstName} {student.lastName}
                              </h3>
                              <p className="text-slate-500 font-bold text-sm">
                                {age} Yaşında {classInfo && <span className="text-slate-300 mx-2">|</span>} {classInfo?.name}
                              </p>
                            </div>

                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-sapphire-500 to-indigo-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.random() * 40 + 60}%` }} // Örnek doluluk
                                transition={{ duration: 1, delay: idx * 0.1 }}
                              />
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                              <span className="text-xs font-bold text-slate-400">GELİŞİM SKORU</span>
                              <div className="flex items-center gap-1">
                                <span className="text-lg font-black text-slate-900">8.4</span>
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              </div>
                            </div>

                            <Button className="w-full teacher-btn-premium bg-slate-50 text-slate-900 border-0 shadow-none hover:bg-slate-900 hover:text-white group-hover:shadow-lg transition-all">
                              Profile Git
                              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

