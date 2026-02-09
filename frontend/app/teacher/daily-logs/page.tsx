"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Label, Input } from "@/components/ui"
import { Calendar, Utensils, Moon, Droplets, Plus, Users, BookOpen, Smile, Frown, Meh, Heart, AlertCircle, Save, CheckCircle2 } from "lucide-react"
import { useTeacherId, useTeacherClasses } from "@/hooks/api/use-teacher"
import { toast } from "sonner"
import { DailyLogSkeleton } from "@/components/skeletons/daily-log-skeleton"
import { motion, AnimatePresence } from "framer-motion"

const moodOptions = [
  { value: "very_happy", label: "Cok Mutlu", icon: Heart, color: "bg-green-500", textColor: "text-green-500" },
  { value: "happy", label: "Mutlu", icon: Smile, color: "bg-emerald-500", textColor: "text-emerald-500" },
  { value: "neutral", label: "Normal", icon: Meh, color: "bg-yellow-500", textColor: "text-yellow-500" },
  { value: "sad", label: "Uzgun", icon: Frown, color: "bg-orange-500", textColor: "text-orange-500" },
  { value: "very_sad", label: "Cok Uzgun", icon: AlertCircle, color: "bg-red-500", textColor: "text-red-500" },
]

const mealOptions = [
  { value: "all", label: "Hepsini Yedi" },
  { value: "most", label: "Coğunu Yedi" },
  { value: "half", label: "Yarısını Yedi" },
  { value: "little", label: "Az Yedi" },
  { value: "none", label: "Yemedi" },
]

export default function TeacherDailyLogsPage() {
  const { data: teacherId, isLoading: teacherIdLoading } = useTeacherId()
  const { data: classes = [], isLoading: classesLoading } = useTeacherClasses(teacherId || null)

  const [selectedClassId, setSelectedClassId] = useState<string>("")
  const [students, setStudents] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'logs' | 'bulk-log' | 'bulk-mood'>('logs')

  // Bulk data
  const [bulkLogData, setBulkLogData] = useState<Record<string, any>>({})
  const [bulkMoodData, setBulkMoodData] = useState<Record<string, string>>({})
  const [bulkMoodNotes, setBulkMoodNotes] = useState<Record<string, string>>({})

  const [saving, setSaving] = useState(false)

  // Load students when class is selected
  useEffect(() => {
    if (selectedClassId) {
      const loadData = async () => {
        try {
          const classRes = await fetch(`/napi/teacher/class/${selectedClassId}`)
          const classData = await classRes.json()
          const classStudents = classData?.data?.classStudents?.filter((cs: any) => cs.isActive) || []
          setStudents(classStudents.map((cs: any) => cs.student))

          const logsRes = await fetch(`/napi/teacher/daily-logs?teacherId=${teacherId}`)
          const logsData = await logsRes.json()
          setLogs(logsData.data || [])
        } catch (err) {
          console.error('Error loading data:', err)
          toast.error("Veriler yüklenirken bir hata oluştu.")
        }
      }
      loadData()
    } else {
      setStudents([])
      setLogs([])
    }
    setBulkLogData({})
    setBulkMoodData({})
    setBulkMoodNotes({})
  }, [selectedClassId, teacherId])

  const handleBulkLogChange = (studentId: string, field: string, value: any) => {
    setBulkLogData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }))
  }

  const handleSaveBulkLogs = async () => {
    setSaving(true)
    const today = new Date().toISOString().split('T')[0]
    let successCount = 0

    try {
      await Promise.all(
        Object.entries(bulkLogData).map(async ([studentId, logData]) => {
          if (Object.keys(logData).length > 0) {
            await fetch('/napi/teacher/daily-logs', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                studentId,
                logDate: today,
                recordedBy: teacherId,
                ...logData,
              }),
            })
            successCount++
          }
        })
      )

      if (successCount > 0) {
        toast.success(`${successCount} öğrenci için günlük log kaydedildi.`)
        const res = await fetch(`/napi/teacher/daily-logs?teacherId=${teacherId}`)
        const data = await res.json()
        setLogs(data.data || [])
        setBulkLogData({})
        setActiveTab('logs')
      } else {
        toast.info("Kaydedilecek değişiklik bulunamadı.")
      }
    } catch (error) {
      console.error('Error saving logs:', error)
      toast.error("Kayıt sırasında beklenmeyen bir hata oluştu.")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveBulkMood = async () => {
    setSaving(true)
    const today = new Date().toISOString().split('T')[0]
    let successCount = 0

    try {
      await Promise.all(
        Object.entries(bulkMoodData).map(async ([studentId, mood]) => {
          await fetch('/napi/mood-tracker', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              studentId,
              mood,
              notes: bulkMoodNotes[studentId] || null,
              date: today,
              recordedBy: teacherId,
            }),
          })
          successCount++
        })
      )

      if (successCount > 0) {
        toast.success(`${successCount} öğrenci için duygu durumu kaydedildi.`)
        setBulkMoodData({})
        setBulkMoodNotes({})
        setActiveTab('logs')
      } else {
        toast.info("Kaydedilecek değişiklik bulunamadı.")
      }
    } catch (error) {
      console.error('Error saving mood:', error)
      toast.error("Duygu durumu kaydedilirken hata oluştu.")
    } finally {
      setSaving(false)
    }
  }

  if (teacherIdLoading || classesLoading) {
    return <DailyLogSkeleton />
  }

  return (
    <div className="min-h-screen teacher-layout p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-slate-900 mb-3 flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl flex items-center justify-center">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              Günlük <span className="text-transparent bg-clip-text bg-gradient-to-r from-sapphire-600 to-indigo-600">Takip</span>
            </h1>
            <p className="text-slate-500 text-xl font-medium">
              Öğrencilerin günlük yaşamını ve duygusal gelişimini koordine edin.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex p-2 bg-white/50 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm"
          >
            {[
              { id: 'logs', label: 'Arşiv', icon: Calendar },
              { id: 'bulk-log', label: 'Log Girişi', icon: Plus },
              { id: 'bulk-mood', label: 'Duygu', icon: Smile },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === tab.id
                  ? 'bg-white shadow-lg text-sapphire-600'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/30'
                  }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Class Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="teacher-card-premium group">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="h-16 w-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center group-hover:rotate-6 transition-transform">
                <BookOpen className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="flex-1">
                <Label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">YÖNETİLECEK SINIFI SEÇİN</Label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full max-w-lg h-14 rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-4 text-lg font-bold text-slate-800 focus:border-sapphire-500 focus:ring-4 focus:ring-sapphire-500/10 transition-all outline-none"
                >
                  <option value="">Sınıf seçiniz...</option>
                  {classes.map((cls: any) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} • {cls.ageGroup} yaş
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Area */}
        <div className="relative pt-6">
          <AnimatePresence mode="wait">
            {!selectedClassId ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-24 glass-card-premium rounded-[3rem]"
              >
                <Users className="h-20 w-20 mx-auto mb-6 text-slate-300 opacity-50" />
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Henüz Sınıf Seçilmedi</h3>
                <p className="text-slate-500 font-medium">Lütfen yukarıdaki menüden işlem yapmak istediğiniz sınıfı seçin.</p>
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Kayıtlar Arşivi */}
                {activeTab === 'logs' && (
                  <div className="space-y-6">
                    {logs.length === 0 ? (
                      <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                        <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                        <p className="text-slate-500 font-bold">Bugün için henüz log kaydı girilmemiş.</p>
                        <Button onClick={() => setActiveTab('bulk-log')} className="mt-6 bg-sapphire-600 text-white rounded-xl">Hemen Giriş Yap</Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {logs.map((log: any, idx) => (
                          <motion.div key={log.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                            <div className="teacher-card-premium border-l-8 border-l-sapphire-500">
                              <div className="flex items-center justify-between mb-6">
                                <div>
                                  <h3 className="text-xl font-black text-slate-900">{log.student?.firstName} {log.student?.lastName}</h3>
                                  <p className="text-sm font-bold text-slate-400 capitalize">
                                    {new Date(log.logDate).toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                  </p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center">
                                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 flex flex-col items-center">
                                  <Utensils className="h-6 w-6 text-amber-500 mb-2" />
                                  <span className="text-[10px] font-black text-amber-700 uppercase">BESLENME</span>
                                  <span className="text-xs font-bold mt-1">Yeterli</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col items-center">
                                  <Moon className="h-6 w-6 text-indigo-500 mb-2" />
                                  <span className="text-[10px] font-black text-indigo-700 uppercase">UYKU</span>
                                  <span className="text-xs font-bold mt-1">{log.napDuration ? `${log.napDuration}'` : '-'}</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex flex-col items-center">
                                  <Droplets className="h-6 w-6 text-blue-500 mb-2" />
                                  <span className="text-[10px] font-black text-blue-700 uppercase">TUVALET</span>
                                  <span className="text-xs font-bold mt-1 truncate w-full text-center">{log.toiletNotes || 'Normal'}</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Toplu Log Girişi */}
                {activeTab === 'bulk-log' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between bg-gradient-to-r from-sapphire-600 to-indigo-700 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-100">
                      <div>
                        <h2 className="text-2xl font-black">Toplu Log Girişi</h2>
                        <p className="text-indigo-100 font-medium">Tüm sınıf verilerini tek seferde kaydedin.</p>
                      </div>
                      <Button
                        onClick={handleSaveBulkLogs}
                        disabled={saving || Object.keys(bulkLogData).length === 0}
                        className="bg-white text-sapphire-600 hover:bg-slate-50 font-black h-14 px-8 rounded-2xl shadow-xl transition-all"
                      >
                        {saving ? "Kaydediliyor..." : "Tümünü Kaydet"}
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {students.map((student: any, idx) => (
                        <motion.div
                          key={student.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className={`teacher-card-premium transition-all ${bulkLogData[student.id] ? 'border-sapphire-200 bg-sapphire-50/10' : ''}`}
                        >
                          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-500">
                                {idx + 1}
                              </div>
                              <h3 className="text-lg font-extrabold text-slate-800">{student.firstName} {student.lastName}</h3>
                            </div>

                            <div className="grid grid-cols-3 col-span-3 gap-6">
                              <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">YEMEK</Label>
                                <select
                                  value={bulkLogData[student.id]?.mealLunch || ''}
                                  onChange={(e) => handleBulkLogChange(student.id, 'mealLunch', e.target.value)}
                                  className="w-full h-12 bg-white rounded-xl border border-slate-100 text-sm font-bold focus:ring-4 focus:ring-sapphire-500/10 outline-none px-3"
                                >
                                  <option value="">Seçiniz</option>
                                  {mealOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">UYKU (DK)</Label>
                                <Input
                                  type="number"
                                  placeholder="90"
                                  value={bulkLogData[student.id]?.napDuration || ''}
                                  onChange={(e) => handleBulkLogChange(student.id, 'napDuration', parseInt(e.target.value) || null)}
                                  className="h-12 bg-white rounded-xl border border-slate-100 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">TUVALET</Label>
                                <Input
                                  placeholder="Not..."
                                  value={bulkLogData[student.id]?.toiletNotes || ''}
                                  onChange={(e) => handleBulkLogChange(student.id, 'toiletNotes', e.target.value)}
                                  className="h-12 bg-white rounded-xl border border-slate-100 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 transition-all"
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Toplu Duygu Takibi */}
                {activeTab === 'bulk-mood' && (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between bg-gradient-to-r from-pink-500 to-rose-600 p-8 rounded-[2rem] text-white shadow-xl shadow-rose-100">
                      <div>
                        <h2 className="text-2xl font-black">Sınıfın Enerjisi</h2>
                        <p className="text-rose-100 font-medium">Bireysel ve kolektif duygu durumu takibi.</p>
                      </div>
                      <Button
                        onClick={handleSaveBulkMood}
                        disabled={saving || Object.keys(bulkMoodData).length === 0}
                        className="bg-white text-rose-600 hover:bg-slate-50 font-black h-14 px-8 rounded-2xl shadow-xl transition-all"
                      >
                        {saving ? "Kaydediliyor..." : "Kaydet ve Bitir"}
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {students.map((student: any, idx) => (
                        <motion.div
                          key={student.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          className="teacher-card-premium group"
                        >
                          <h3 className="text-lg font-black text-slate-800 mb-6">{student.firstName} {student.lastName}</h3>
                          <div className="flex justify-between gap-3 mb-6">
                            {moodOptions.map((mood) => (
                              <motion.button
                                key={mood.value}
                                whileHover={{ y: -4 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setBulkMoodData(prev => ({ ...prev, [student.id]: mood.value }))}
                                className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300 ${bulkMoodData[student.id] === mood.value
                                  ? `${mood.color} text-white border-transparent shadow-xl scale-110 z-10`
                                  : `bg-slate-50 border-slate-100 ${mood.textColor} hover:border-slate-300`
                                  }`}
                              >
                                <mood.icon className="h-8 w-8" />
                                <span className="text-[10px] font-black uppercase">{mood.label}</span>
                              </motion.button>
                            ))}
                          </div>
                          <Input
                            placeholder="Özel bir durum var mı?"
                            value={bulkMoodNotes[student.id] || ''}
                            onChange={(e) => setBulkMoodNotes(prev => ({ ...prev, [student.id]: e.target.value }))}
                            className="h-12 bg-slate-50/50 rounded-xl border-slate-100 text-sm font-medium focus:bg-white transition-all"
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
