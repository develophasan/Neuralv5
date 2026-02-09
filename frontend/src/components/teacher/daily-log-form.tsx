"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label } from "@/components/ui"
import { Select } from "@/components/ui/select"
import { Utensils, Moon, Droplets, Save, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface DailyLogFormProps {
  students: any[]
  onSuccess?: () => void
}

const MEAL_OPTIONS = [
  { value: 'full', label: 'Tam Yedi' },
  { value: 'partial', label: 'Kısmen Yedi' },
  { value: 'none', label: 'Yemedi' },
]

const SLEEP_OPTIONS = [
  { value: 'good', label: 'İyi Uyudu' },
  { value: 'partial', label: 'Kısmen Uyudu' },
  { value: 'none', label: 'Uyumadı' },
]

const TOILET_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'accident', label: 'Kaza Oldu' },
  { value: 'issue', label: 'Sorun Var' },
]

export function DailyLogForm({ students, onSuccess }: DailyLogFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    studentId: '',
    breakfast: '',
    lunch: '',
    snack: '',
    napTime: '',
    napDuration: '',
    toiletStatus: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.studentId) {
      toast.error('Lütfen bir öğrenci seçin')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/napi/teacher/daily-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: formData.studentId,
          logDate: new Date().toISOString(),
          mealBreakfast: formData.breakfast,
          mealLunch: formData.lunch,
          mealSnack: formData.snack,
          napStart: formData.napTime || null,
          napDuration: formData.napDuration ? parseInt(formData.napDuration) : null,
          toiletNotes: formData.toiletStatus,
          notes: formData.notes,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Günlük log kaydedilemedi')
      }

      toast.success('Günlük log kaydedildi')

      // Reset form
      setFormData({
        studentId: '',
        breakfast: '',
        lunch: '',
        snack: '',
        napTime: '',
        napDuration: '',
        toiletStatus: '',
        notes: '',
      })
      onSuccess?.()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="rounded-2xl border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Utensils className="h-6 w-6 text-harmony-heart" />
          <CardTitle>Günlük Log</CardTitle>
        </div>
        <CardDescription>
          Öğrencinin günlük yemek, uyku ve tuvalet durumunu kaydedin
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Öğrenci Seçimi */}
          <div className="space-y-2">
            <Label htmlFor="student">Öğrenci *</Label>
            <Select
              id="student"
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
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

          {/* Yemek Bölümü */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Utensils className="h-5 w-5 text-amber-500" />
              Yemek Durumu
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Kahvaltı</Label>
                <Select
                  value={formData.breakfast}
                  onChange={(e) => setFormData({ ...formData, breakfast: e.target.value })}
                  className="rounded-xl"
                >
                  <option value="">Seçin</option>
                  {MEAL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Öğle Yemeği</Label>
                <Select
                  value={formData.lunch}
                  onChange={(e) => setFormData({ ...formData, lunch: e.target.value })}
                  className="rounded-xl"
                >
                  <option value="">Seçin</option>
                  {MEAL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Atıştırmalık</Label>
                <Select
                  value={formData.snack}
                  onChange={(e) => setFormData({ ...formData, snack: e.target.value })}
                  className="rounded-xl"
                >
                  <option value="">Seçin</option>
                  {MEAL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          {/* Uyku Bölümü */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Moon className="h-5 w-5 text-indigo-500" />
              Uyku Durumu
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Uyku Başlangıcı</Label>
                <Input
                  type="time"
                  value={formData.napTime}
                  onChange={(e) => setFormData({ ...formData, napTime: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Uyku Süresi (dk)</Label>
                <Input
                  type="number"
                  min={0}
                  max={180}
                  value={formData.napDuration}
                  onChange={(e) => setFormData({ ...formData, napDuration: e.target.value })}
                  placeholder="Dakika"
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Tuvalet Bölümü */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Droplets className="h-5 w-5 text-blue-500" />
              Tuvalet Durumu
            </h3>
            <Select
              value={formData.toiletStatus}
              onChange={(e) => setFormData({ ...formData, toiletStatus: e.target.value })}
              className="rounded-xl"
            >
              <option value="">Seçin</option>
              {TOILET_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Select>
          </div>

          {/* Notlar */}
          <div className="space-y-2">
            <Label htmlFor="notes">Ek Notlar</Label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Günle ilgili notlarınız..."
              className="w-full h-24 px-4 py-3 rounded-xl border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading || !formData.studentId}
            className="w-full rounded-xl h-12"
            data-testid="submit-daily-log-btn"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Günlük Logu Kaydet
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
