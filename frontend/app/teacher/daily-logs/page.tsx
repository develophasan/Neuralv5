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
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-10">
        {/* Header - More Responsive */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-2xl md:text-5xl font-bold text-slate-900 mb-2 flex items-center gap-3">
              <div className="h-10 w-10 md:h-14 md:w-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg flex items-center justify-center shrink-0">
                <Calendar className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <span>Günlük <span className="text-primary">Takip</span></span>
            </h1>
            <p className="text-slate-500 text-base md:text-xl font-medium">
              Öğrencilerin günlük yaşamını ve duygusal gelişimini koordine edin.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex p-1 bg-stone-100/50 backdrop-blur-md rounded-2xl border border-stone-200 shadow-sm w-full md:w-auto"
          >
            {[
              { id: 'logs', label: 'Arşiv', icon: Calendar },
              { id: 'bulk-log', label: 'Giriş', icon: Plus },
              { id: 'bulk-mood', label: 'Duygu', icon: Smile },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${activeTab === tab.id
                  ? 'bg-white shadow-sm text-primary'
                  : 'text-stone-500 hover:text-stone-700'
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
          <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                <BookOpen className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="flex-1 w-full">
                <Label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">SINIF SEÇİMİ</Label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full h-12 rounded-xl border border-stone-200 bg-stone-50/50 px-3 text-base font-bold text-stone-800 focus:border-primary transition-all outline-none"
                >
                  <option value="">Sınıf seçiniz...</option>
                  {classes.map((cls: any) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Area */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {!selectedClassId ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-16 bg-white border border-stone-100 rounded-[2rem]"
              >
                <Users className="h-16 w-16 mx-auto mb-4 text-stone-200" />
                <h3 className="text-xl font-bold text-stone-900 mb-2">Henüz Sınıf Seçilmedi</h3>
                <p className="text-stone-500 text-sm px-8">Lütfen yukarıdaki menüden işlem yapmak istediğiniz sınıfı seçin.</p>
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
                  <div className="space-y-4">
                    {logs.length === 0 ? (
                      <div className="text-center py-16 bg-stone-50/50 rounded-2xl border-2 border-dashed border-stone-200">
                        <Calendar className="h-10 w-10 mx-auto mb-3 text-stone-300" />
                        <p className="text-stone-500 font-bold p-2 text-sm">Bugün için henüz log kaydı girilmemiş.</p>
                        <Button onClick={() => setActiveTab('bulk-log')} className="mt-4 bg-primary text-white rounded-xl h-10 px-6 text-sm">Hemen Giriş Yap</Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {logs.map((log: any, idx) => (
                          <motion.div key={log.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                            <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm border-l-4 border-l-primary">
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <h3 className="text-lg font-bold text-stone-900">{log.student?.firstName} {log.student?.lastName}</h3>
                                  <p className="text-[10px] font-bold text-stone-400 capitalize">
                                    {new Date(log.logDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'short' })}
                                  </p>
                                </div>
                                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                <div className="p-2 rounded-xl bg-amber-50/50 border border-amber-100 flex flex-col items-center justify-center">
                                  <Utensils className="h-4 w-4 text-amber-500 mb-1" />
                                  <span className="text-[9px] font-bold text-amber-700 uppercase">YEMEK</span>
                                  <span className="text-[10px] font-bold truncate w-full text-center">Yeterli</span>
                                </div>
                                <div className="p-2 rounded-xl bg-indigo-50/50 border border-indigo-100 flex flex-col items-center justify-center">
                                  <Moon className="h-4 w-4 text-indigo-500 mb-1" />
                                  <span className="text-[9px] font-bold text-indigo-700 uppercase">UYKU</span>
                                  <span className="text-[10px] font-bold">{log.napDuration ? `${log.napDuration}'` : '-'}</span>
                                </div>
                                <div className="p-2 rounded-xl bg-blue-50/50 border border-blue-100 flex flex-col items-center justify-center">
                                  <Droplets className="h-4 w-4 text-blue-500 mb-1" />
                                  <span className="text-[9px] font-bold text-blue-700 uppercase">TUVALET</span>
                                  <span className="text-[10px] font-bold truncate w-full text-center">{log.toiletNotes || 'Normal'}</span>
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
                  <div className="space-y-4">
                    <div className="flex flex-col gap-4 bg-gradient-to-br from-primary to-indigo-700 p-6 md:p-8 rounded-3xl text-white shadow-xl">
                      <div>
                        <h2 className="text-xl md:text-2xl font-bold">Toplu Giriş</h2>
                        <p className="text-indigo-100/80 text-sm">Tüm sınıf verilerini hızlıca kaydedin.</p>
                      </div>
                      <Button
                        onClick={handleSaveBulkLogs}
                        disabled={saving || Object.keys(bulkLogData).length === 0}
                        className="bg-white text-primary hover:bg-stone-50 font-bold h-12 w-full md:w-auto px-8 rounded-xl shadow-lg transition-all"
                      >
                        {saving ? "Kaydediliyor..." : "Tümünü Kaydet"}
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {students.map((student: any, idx) => (
                        <motion.div
                          key={student.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className={`bg-white p-4 md:p-6 rounded-2xl border border-stone-100 shadow-sm transition-all ${bulkLogData[student.id] ? 'border-primary/30 bg-primary/5' : ''}`}
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-lg bg-stone-50 flex items-center justify-center text-sm font-bold text-stone-400 shrink-0">
                                {idx + 1}
                              </div>
                              <h3 className="text-base font-bold text-stone-800">{student.firstName} {student.lastName}</h3>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 flex-1 gap-3 md:gap-4">
                              <div className="space-y-1">
                                <Label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">YEMEK</Label>
                                <select
                                  value={bulkLogData[student.id]?.mealLunch || ''}
                                  onChange={(e) => handleBulkLogChange(student.id, 'mealLunch', e.target.value)}
                                  className="w-full h-10 bg-white rounded-lg border border-stone-200 text-xs font-bold px-2 outline-none focus:border-primary"
                                >
                                  <option value="">Seçiniz</option>
                                  {mealOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                              </div>

                              <div className="space-y-1">
                                <Label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">UYKU (DK)</Label>
                                <Input
                                  type="number"
                                  placeholder="90"
                                  value={bulkLogData[student.id]?.napDuration || ''}
                                  onChange={(e) => handleBulkLogChange(student.id, 'napDuration', parseInt(e.target.value) || null)}
                                  className="h-10 bg-white rounded-lg border-stone-200 text-xs font-bold"
                                />
                              </div>

                              <div className="space-y-1 col-span-2 md:col-span-1">
                                <Label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">TUVALET</Label>
                                <Input
                                  placeholder="Not..."
                                  value={bulkLogData[student.id]?.toiletNotes || ''}
                                  onChange={(e) => handleBulkLogChange(student.id, 'toiletNotes', e.target.value)}
                                  className="h-10 bg-white rounded-lg border-stone-200 text-xs font-bold"
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
                  <div className="space-y-6">
                    <div className="flex flex-col gap-4 bg-gradient-to-br from-pink-500 to-rose-600 p-6 md:p-8 rounded-3xl text-white shadow-xl">
                      <div>
                        <h2 className="text-xl md:text-2xl font-bold">Duygu Durumu</h2>
                        <p className="text-rose-100/80 text-sm">Sınıfın genel havasını kaydedin.</p>
                      </div>
                      <Button
                        onClick={handleSaveBulkMood}
                        disabled={saving || Object.keys(bulkMoodData).length === 0}
                        className="bg-white text-rose-600 hover:bg-stone-50 font-bold h-12 w-full md:w-auto px-8 rounded-xl shadow-lg transition-all"
                      >
                        {saving ? "Kaydediliyor..." : "Kaydet ve Bitir"}
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {students.map((student: any, idx) => (
                        <motion.div
                          key={student.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          className="bg-white p-5 rounded-3xl border border-stone-100 shadow-sm"
                        >
                          <h3 className="text-base font-bold text-stone-800 mb-4">{student.firstName} {student.lastName}</h3>
                          <div className="grid grid-cols-5 gap-2 mb-4">
                            {moodOptions.map((mood) => (
                              <button
                                key={mood.value}
                                onClick={() => setBulkMoodData(prev => ({ ...prev, [student.id]: mood.value }))}
                                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${bulkMoodData[student.id] === mood.value
                                  ? `${mood.color} text-white shadow-lg scale-105`
                                  : `bg-stone-50 text-stone-400 grayscale`
                                  }`}
                              >
                                <mood.icon className="h-5 w-5 md:h-6 md:w-6" />
                                <span className="text-[8px] font-bold uppercase truncate w-full text-center">{mood.label}</span>
                              </button>
                            ))}
                          </div>
                          <Input
                            placeholder="Not (isteğe bağlı)..."
                            value={bulkMoodNotes[student.id] || ''}
                            onChange={(e) => setBulkMoodNotes(prev => ({ ...prev, [student.id]: e.target.value }))}
                            className="h-10 bg-stone-50/50 rounded-xl border-stone-200 text-xs font-medium"
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
