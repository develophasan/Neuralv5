"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from "@/components/ui"
import { Select } from "@/components/ui/select"
import { Smile, Meh, Frown, Zap, Users, Save, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface MoodTrackerProps {
  students: any[]
  onSuccess?: () => void
}

const MOOD_OPTIONS = [
  { value: 'very_happy', label: 'Çok Mutlu', icon: Smile, color: 'text-green-500 bg-green-100' },
  { value: 'happy', label: 'Mutlu', icon: Smile, color: 'text-emerald-500 bg-emerald-100' },
  { value: 'neutral', label: 'Normal', icon: Meh, color: 'text-yellow-500 bg-yellow-100' },
  { value: 'sad', label: 'Üzgün', icon: Frown, color: 'text-orange-500 bg-orange-100' },
  { value: 'very_sad', label: 'Çok Üzgün', icon: Frown, color: 'text-red-500 bg-red-100' },
]

const ENERGY_OPTIONS = [
  { value: 'very_high', label: 'Çok Yüksek' },
  { value: 'high', label: 'Yüksek' },
  { value: 'normal', label: 'Normal' },
  { value: 'low', label: 'Düşük' },
  { value: 'very_low', label: 'Çok Düşük' },
]

const SOCIAL_OPTIONS = [
  { value: 'very_active', label: 'Çok Aktif' },
  { value: 'active', label: 'Aktif' },
  { value: 'normal', label: 'Normal' },
  { value: 'withdrawn', label: 'İçe Kapanık' },
  { value: 'isolated', label: 'İzole' },
]

export function MoodTracker({ students, onSuccess }: MoodTrackerProps) {
  const [loading, setLoading] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState('')
  const [mood, setMood] = useState('')
  const [energyLevel, setEnergyLevel] = useState('normal')
  const [socialEngagement, setSocialEngagement] = useState('normal')
  const [notes, setNotes] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedStudent || !mood) {
      toast.error('Lütfen öğrenci ve duygu durumu seçin')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/napi/mood-tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent,
          mood,
          energyLevel,
          socialEngagement,
          notes,
        }),
      })

      if (!res.ok) throw new Error('Kaydedilemedi')

      toast.success('Duygu durumu kaydedildi')

      // Reset form
      setSelectedStudent('')
      setMood('')
      setNotes('')
      onSuccess?.()
    } catch (error) {
      toast.error('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="rounded-2xl border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Smile className="h-6 w-6 text-harmony-heart" />
          <CardTitle>Duygu Durumu Takibi</CardTitle>
        </div>
        <CardDescription>
          Öğrencinin günlük duygu durumunu kaydedin
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Öğrenci Seçimi */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Öğrenci *</label>
            <Select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="rounded-xl"
            >
              <option value="">Öğrenci Seçin</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName}
                </option>
              ))}
            </Select>
          </div>

          {/* Duygu Durumu */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Smile className="h-4 w-4" /> Duygu Durumu *
            </label>
            <div className="grid grid-cols-5 gap-2">
              {MOOD_OPTIONS.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMood(option.value)}
                    className={`
                      p-3 rounded-xl border-2 transition-all text-center
                      ${mood === option.value
                        ? 'border-primary bg-primary/10 scale-105'
                        : 'border-muted hover:border-primary/50'
                      }
                    `}
                  >
                    <Icon className={`h-6 w-6 mx-auto mb-1 ${option.color.split(' ')[0]}`} />
                    <span className="text-xs">{option.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Enerji Seviyesi */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" /> Enerji Seviyesi
            </label>
            <Select
              value={energyLevel}
              onChange={(e) => setEnergyLevel(e.target.value)}
              className="rounded-xl"
            >
              {ENERGY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Select>
          </div>

          {/* Sosyal Katılım */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" /> Sosyal Katılım
            </label>
            <Select
              value={socialEngagement}
              onChange={(e) => setSocialEngagement(e.target.value)}
              className="rounded-xl"
            >
              {SOCIAL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Select>
          </div>

          {/* Notlar */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Notlar</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ek gözlemler..."
              className="w-full h-20 px-4 py-3 rounded-xl border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading || !selectedStudent || !mood}
            className="w-full rounded-xl h-12"
            data-testid="submit-mood-btn"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Kaydediliyor...</>
            ) : (
              <><Save className="h-4 w-4 mr-2" /> Kaydet</>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
