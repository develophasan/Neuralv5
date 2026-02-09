"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Label, Input } from "@/components/ui"
import { Calendar, Utensils, Moon, Droplets, Plus, Users, BookOpen, Smile, Frown, Meh, Heart, AlertCircle, Save, CheckCircle2 } from "lucide-react"
import { useTeacherId, useTeacherClasses } from "@/hooks/api/use-teacher"

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
  const [saved, setSaved] = useState(false)

  // Load students when class is selected
  useEffect(() => {
    if (selectedClassId) {
      fetch(`/napi/teacher/class/${selectedClassId}`)
        .then(res => res.json())
        .then(data => {
          const classStudents = data?.data?.classStudents?.filter((cs: any) => cs.isActive) || []
          setStudents(classStudents.map((cs: any) => cs.student))
        })
        .catch(err => console.error('Error fetching students:', err))
      
      // Load existing logs
      fetch(`/napi/teacher/daily-logs?teacherId=${teacherId}`)
        .then(res => res.json())
        .then(data => setLogs(data.data || []))
        .catch(err => console.error('Error fetching logs:', err))
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
    setSaved(false)
    const today = new Date().toISOString().split('T')[0]

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
          }
        })
      )
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      // Refresh logs
      const res = await fetch(`/napi/teacher/daily-logs?teacherId=${teacherId}`)
      const data = await res.json()
      setLogs(data.data || [])
    } catch (error) {
      console.error('Error saving logs:', error)
      alert('Kayit sirasinda hata olustu')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveBulkMood = async () => {
    setSaving(true)
    setSaved(false)
    const today = new Date().toISOString().split('T')[0]

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
        })
      )
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving mood:', error)
      alert('Kayit sirasinda hata olustu')
    } finally {
      setSaving(false)
    }
  }

  const loading = teacherIdLoading || classesLoading

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yukleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Calendar className="h-8 w-8 text-orange-500" />
              Gunluk Takip
            </h1>
            <p className="text-muted-foreground">
              Ogrencilerin gunluk aktivitelerini ve duygu durumlarini kaydedin
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={activeTab === 'logs' ? 'default' : 'outline'}
              onClick={() => setActiveTab('logs')}
              className="rounded-xl"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Kayitlar
            </Button>
            <Button
              variant={activeTab === 'bulk-log' ? 'default' : 'outline'}
              onClick={() => setActiveTab('bulk-log')}
              className="rounded-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Toplu Log
            </Button>
            <Button
              variant={activeTab === 'bulk-mood' ? 'default' : 'outline'}
              onClick={() => setActiveTab('bulk-mood')}
              className="rounded-xl"
            >
              <Smile className="h-4 w-4 mr-2" />
              Toplu Duygu
            </Button>
          </div>
        </div>

        {/* Class Selection */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <Label className="mb-2 block">Sinif Secin</Label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="flex h-10 w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Sinif seciniz...</option>
                  {classes.map((cls: any) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} - {cls.ageGroup} yas ({cls.student_count || 0} ogrenci)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content based on active tab */}
        {!selectedClassId ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Islem yapmak icin bir sinif secin.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Existing Logs Tab */}
            {activeTab === 'logs' && (
              <div className="space-y-4">
                {logs.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      <p>Henuz gunluk log kaydi bulunmuyor.</p>
                      <Button className="mt-4" onClick={() => setActiveTab('bulk-log')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Toplu Log Gir
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  logs.map((log: any) => (
                    <Card key={log.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {log.student?.firstName} {log.student?.lastName}
                            </CardTitle>
                            <CardDescription>
                              {new Date(log.logDate).toLocaleDateString('tr-TR')}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-3 rounded-xl bg-amber-50">
                            <div className="flex items-center gap-2 mb-2">
                              <Utensils className="h-4 w-4 text-amber-600" />
                              <span className="text-sm font-medium">Yemek</span>
                            </div>
                            <div className="space-y-1 text-xs">
                              <p>Kahvalti: {log.mealBreakfast || '-'}</p>
                              <p>Ogle: {log.mealLunch || '-'}</p>
                              <p>Atistirma: {log.mealSnack || '-'}</p>
                            </div>
                          </div>
                          <div className="p-3 rounded-xl bg-indigo-50">
                            <div className="flex items-center gap-2 mb-2">
                              <Moon className="h-4 w-4 text-indigo-600" />
                              <span className="text-sm font-medium">Uyku</span>
                            </div>
                            <p className="text-xs">{log.napDuration ? `${log.napDuration} dk` : '-'}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-blue-50">
                            <div className="flex items-center gap-2 mb-2">
                              <Droplets className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium">Tuvalet</span>
                            </div>
                            <p className="text-xs">{log.toiletNotes || 'Normal'}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Bulk Log Entry Tab */}
            {activeTab === 'bulk-log' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Toplu Log Girisi ({students.length} ogrenci)</h2>
                  <div className="flex gap-2 items-center">
                    {saved && (
                      <span className="text-green-600 text-sm flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Kaydedildi!
                      </span>
                    )}
                    <Button 
                      onClick={handleSaveBulkLogs} 
                      disabled={saving || Object.keys(bulkLogData).length === 0}
                    >
                      {saving ? 'Kaydediliyor...' : 'Tumu Kaydet'}
                    </Button>
                  </div>
                </div>

                {students.map((student: any) => (
                  <Card key={student.id} className={`transition-all ${bulkLogData[student.id] ? 'ring-2 ring-primary/30' : ''}`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{student.firstName} {student.lastName}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Kahvaltı */}
                        <div>
                          <Label className="text-xs">Kahvalti</Label>
                          <select
                            value={bulkLogData[student.id]?.mealBreakfast || ''}
                            onChange={(e) => handleBulkLogChange(student.id, 'mealBreakfast', e.target.value)}
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                          >
                            <option value="">Seciniz</option>
                            {mealOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                        {/* Öğle */}
                        <div>
                          <Label className="text-xs">Ogle Yemegi</Label>
                          <select
                            value={bulkLogData[student.id]?.mealLunch || ''}
                            onChange={(e) => handleBulkLogChange(student.id, 'mealLunch', e.target.value)}
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                          >
                            <option value="">Seciniz</option>
                            {mealOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                        {/* Atıştırmalık */}
                        <div>
                          <Label className="text-xs">Atistirmalik</Label>
                          <select
                            value={bulkLogData[student.id]?.mealSnack || ''}
                            onChange={(e) => handleBulkLogChange(student.id, 'mealSnack', e.target.value)}
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                          >
                            <option value="">Seciniz</option>
                            {mealOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                        {/* Uyku */}
                        <div>
                          <Label className="text-xs">Uyku Suresi (dk)</Label>
                          <Input
                            type="number"
                            placeholder="90"
                            value={bulkLogData[student.id]?.napDuration || ''}
                            onChange={(e) => handleBulkLogChange(student.id, 'napDuration', parseInt(e.target.value) || null)}
                            className="h-9 mt-1"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Bulk Mood Entry Tab */}
            {activeTab === 'bulk-mood' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Toplu Duygu Takibi ({students.length} ogrenci)</h2>
                  <div className="flex gap-2 items-center">
                    {saved && (
                      <span className="text-green-600 text-sm flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Kaydedildi!
                      </span>
                    )}
                    <Button 
                      onClick={handleSaveBulkMood} 
                      disabled={saving || Object.keys(bulkMoodData).length === 0}
                    >
                      {saving ? 'Kaydediliyor...' : 'Tumu Kaydet'}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {students.map((student: any) => (
                    <Card key={student.id} className={`transition-all ${bulkMoodData[student.id] ? 'ring-2 ring-primary/30' : ''}`}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{student.firstName} {student.lastName}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* Mood Selection */}
                        <div className="flex flex-wrap gap-2">
                          {moodOptions.map((mood) => (
                            <button
                              key={mood.value}
                              onClick={() => setBulkMoodData(prev => ({ ...prev, [student.id]: mood.value }))}
                              className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                                bulkMoodData[student.id] === mood.value
                                  ? `${mood.color} text-white border-transparent`
                                  : `border-gray-200 hover:border-gray-300 ${mood.textColor}`
                              }`}
                            >
                              <mood.icon className="h-5 w-5" />
                              <span className="text-xs font-medium">{mood.label}</span>
                            </button>
                          ))}
                        </div>
                        {/* Note */}
                        <Input
                          placeholder="Not ekleyin (opsiyonel)"
                          value={bulkMoodNotes[student.id] || ''}
                          onChange={(e) => setBulkMoodNotes(prev => ({ ...prev, [student.id]: e.target.value }))}
                          className="text-sm"
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
