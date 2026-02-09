"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input } from "@/components/ui"
import { GraduationCap, Search, ArrowRight, X } from "lucide-react"
import Link from "next/link"
import { useTeacherId, useTeacherStudents, useTeacherClasses } from "@/hooks/api/use-teacher"
import { motion, AnimatePresence } from "framer-motion"

export default function TeacherStudentsPage() {
  const { data: teacherId, isLoading: teacherIdLoading, error: teacherIdError } = useTeacherId()
  const { data: students = [], isLoading: studentsLoading, error: studentsError } = useTeacherStudents(teacherId || null)
  const { data: classes = [] } = useTeacherClasses(teacherId || null)
  const [search, setSearch] = useState("")

  const primaryClassName = classes[0]?.name || "Tüm"

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
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-2xl md:text-5xl font-bold text-slate-900 mb-2 tracking-tight">
              {primaryClassName} <span className="text-primary">Öğrencilerimiz</span>
            </h1>
            <p className="text-slate-500 text-base md:text-xl font-medium">
              Sınıfındaki tüm minik kahramanlara buradan ulaşabilirsin.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full md:w-96 relative group"
          >
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Öğrenci ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 md:h-14 bg-white/70 backdrop-blur-md border-slate-100 rounded-2xl shadow-sm focus:ring-primary/20 focus:border-primary text-base md:text-lg transition-all"
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
                <div className="text-center py-16 md:py-24 bg-white border border-stone-100 rounded-[2rem] md:rounded-[3rem]">
                  <div className="h-16 w-16 md:h-24 md:w-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                    <Search className="h-8 w-8 md:h-10 md:w-10 text-slate-300" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">Kimseyi bulamadık</h3>
                  <p className="text-slate-500 text-sm md:text-base font-medium px-4">{search ? 'Aradığın kriterlere uygun yıldızımız yok gibi görünüyor.' : 'Henüz bu sınıfa atanmış bir yıldız yok.'}</p>
                  {search && <Button onClick={() => setSearch("")} variant="link" className="mt-4 text-primary font-bold">Aramayı Temizle</Button>}
                </div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
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
                        <div className="bg-white p-5 md:p-6 rounded-3xl border border-stone-100 shadow-sm hover:shadow-xl transition-all group h-full">
                          <div className="flex items-start justify-between mb-4 md:mb-6">
                            <div className="h-14 w-14 md:h-20 md:w-20 rounded-2xl bg-stone-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-500">
                              {student.photoUrl ? (
                                <img src={student.photoUrl} alt={student.firstName} className="h-full w-full object-cover" />
                              ) : (
                                <GraduationCap className="h-8 w-8 md:h-10 md:w-10 text-primary transform -rotate-6" />
                              )}
                            </div>
                            <div className={`p-2 rounded-xl border ${student.gender === 'male' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-rose-50 border-rose-100 text-rose-600'
                              }`}>
                              {student.gender === 'male' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path><path d="M10 14l-2 -2"></path><path d="M12 12l1 1"></path><path d="M15 15l-4 -4"></path><path d="M11 7l4 4"></path></svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 11m-5 0a5 5 0 1 0 10 0a5 5 0 1 0 -10 0"></path><path d="M12 16v5"></path><path d="M15 11l-3 3"></path><path d="M12 14l-3 -3"></path><path d="M9 19h6"></path></svg>
                              )}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <h3 className="text-xl md:text-2xl font-bold text-slate-900 group-hover:text-primary transition-colors leading-tight truncate">
                                {student.firstName} {student.lastName}
                              </h3>
                              <p className="text-slate-500 font-bold text-xs">
                                {age} Yaşında {classInfo && <span className="text-slate-300 mx-2">|</span>} {classInfo?.name}
                              </p>
                            </div>

                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-primary"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.random() * 40 + 60}%` }}
                                transition={{ duration: 1, delay: idx * 0.1 }}
                              />
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                              <span className="text-[10px] font-bold text-slate-400">GELİŞİM</span>
                              <div className="flex items-center gap-1">
                                <span className="text-base font-black text-slate-900">8.4</span>
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              </div>
                            </div>

                            <Button className="w-full bg-stone-50 text-slate-900 hover:bg-slate-900 hover:text-white rounded-xl h-10 text-sm font-bold transition-all border-0 shadow-none">
                              Profile Git
                              <ArrowRight className="ml-2 h-4 w-4" />
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

