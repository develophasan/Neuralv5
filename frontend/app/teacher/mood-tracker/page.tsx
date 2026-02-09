"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Label } from "@/components/ui"
import { Smile, Frown, Meh, Heart, AlertCircle, Save, Users } from "lucide-react"
import { useTeacherId, useTeacherClasses } from "@/hooks/api/use-teacher"

const moodOptions = [
  { value: "very_happy", label: "Cok Mutlu", icon: Heart, color: "bg-green-500", textColor: "text-green-500" },
  { value: "happy", label: "Mutlu", icon: Smile, color: "bg-emerald-500", textColor: "text-emerald-500" },
  { value: "neutral", label: "Normal", icon: Meh, color: "bg-yellow-500", textColor: "text-yellow-500" },
  { value: "sad", label: "Uzgun", icon: Frown, color: "bg-orange-500", textColor: "text-orange-500" },
  { value: "very_sad", label: "Cok Uzgun", icon: AlertCircle, color: "bg-red-500", textColor: "text-red-500" },
]

export default function TeacherMoodTrackerPage() {
  const { data: teacherId, isLoading: teacherIdLoading } = useTeacherId()
  const { data: classes = [], isLoading: classesLoading } = useTeacherClasses(teacherId || null)
  const [selectedClassId, setSelectedClassId] = useState<string>("")
  const [students, setStudents] = useState<any[]>([])
  const [moodData, setMoodData] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Sınıf seçildiğinde öğrencileri getir
  useEffect(() => {
    if (selectedClassId) {
      const selectedClass = classes.find((c: any) => c.id === selectedClassId)
      if (selectedClass) {
        // Fetch class details with students - use /class/ not /classes/
        fetch(`/napi/teacher/class/${selectedClassId}`)
          .then(res => res.json())
          .then(data => {
            const classStudents = data?.data?.classStudents?.filter((cs: any) => cs.isActive) || []
            setStudents(classStudents.map((cs: any) => cs.student))
          })
          .catch(err => console.error('Error fetching class students:', err))
      }
    } else {
      setStudents([])
    }
    setMoodData({})
    setNotes({})
  }, [selectedClassId, classes])

  const handleMoodSelect = (studentId: string, mood: string) => {
    setMoodData(prev => ({ ...prev, [studentId]: mood }))
  }

  const handleNoteChange = (studentId: string, note: string) => {
    setNotes(prev => ({ ...prev, [studentId]: note }))
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)

    try {
      const today = new Date().toISOString().split('T')[0]
      
      // Save mood data for each student
      await Promise.all(
        Object.entries(moodData).map(async ([studentId, mood]) => {
          await fetch('/napi/mood-tracker', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              studentId,
              mood,
              notes: notes[studentId] || null,
              date: today,
              recordedBy: teacherId,
            }),
          })
        })
      )

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving mood data:', error)
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
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Smile className="h-8 w-8 text-pink-500" />
            Duygu Durumu Takibi
          </h1>
          <p className="text-muted-foreground">
            Ogrencilerinizin gunluk duygu durumlarini kaydedin
          </p>
        </div>

        {/* Class Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Sinif Secin
            </CardTitle>
            <CardDescription>
              Duygu takibi yapmak istediginiz sinifi secin
            </CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Student Mood Cards */}
        {selectedClassId && students.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Ogrenciler ({students.length})</h2>
              <div className="flex gap-2">
                {saved && (
                  <span className="text-green-600 text-sm flex items-center gap-1">
                    <Save className="h-4 w-4" /> Kaydedildi!
                  </span>
                )}
                <Button 
                  onClick={handleSave} 
                  disabled={saving || Object.keys(moodData).length === 0}
                  className="rounded-xl"
                >
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {students.map((student: any) => (
                <Card key={student.id} className={`transition-all ${moodData[student.id] ? 'ring-2 ring-primary/50' : ''}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">
                      {student.firstName} {student.lastName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Mood Selection */}
                    <div className="flex flex-wrap gap-2">
                      {moodOptions.map((mood) => (
                        <button
                          key={mood.value}
                          onClick={() => handleMoodSelect(student.id, mood.value)}
                          className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                            moodData[student.id] === mood.value
                              ? `${mood.color} text-white border-transparent`
                              : `border-gray-200 hover:border-gray-300 ${mood.textColor}`
                          }`}
                        >
                          <mood.icon className="h-6 w-6" />
                          <span className="text-xs font-medium">{mood.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Notes */}
                    <div>
                      <Label className="text-sm text-muted-foreground">Not (Opsiyonel)</Label>
                      <textarea
                        value={notes[student.id] || ''}
                        onChange={(e) => handleNoteChange(student.id, e.target.value)}
                        placeholder="Ogrenci hakkinda not ekleyin..."
                        className="mt-1 flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {selectedClassId && students.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Smile className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Bu sinifta henuz ogrenci bulunmuyor.</p>
            </CardContent>
          </Card>
        )}

        {!selectedClassId && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Duygu takibi yapmak icin bir sinif secin.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
