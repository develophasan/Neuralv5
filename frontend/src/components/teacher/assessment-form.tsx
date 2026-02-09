"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Label } from "@/components/ui"
import { Select } from "@/components/ui/select"
import { Brain, Save, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/toaster"

interface AssessmentFormProps {
  students: any[]
  domains: any[]
  onSuccess?: () => void
}

const SCORE_OPTIONS = [
  { value: 1, label: '1 - Çok Zayıf', color: 'text-red-500' },
  { value: 2, label: '2 - Zayıf', color: 'text-orange-500' },
  { value: 3, label: '3 - Orta', color: 'text-yellow-500' },
  { value: 4, label: '4 - İyi', color: 'text-blue-500' },
  { value: 5, label: '5 - Çok İyi', color: 'text-green-500' },
]

export function AssessmentForm({ students, domains, onSuccess }: AssessmentFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState('')
  const [scores, setScores] = useState<Record<string, number>>({})
  const [notes, setNotes] = useState('')

  // Reset scores when student changes
  useEffect(() => {
    const initialScores: Record<string, number> = {}
    domains.forEach((d) => {
      initialScores[d.id] = 3 // Default to middle score
    })
    setScores(initialScores)
  }, [domains])

  const handleScoreChange = (domainId: string, value: number) => {
    setScores((prev) => ({ ...prev, [domainId]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedStudent) {
      toast({ title: 'Hata', description: 'Lütfen bir öğrenci seçin', variant: 'error' })
      return
    }

    setLoading(true)

    try {
      const assessmentScores = Object.entries(scores).map(([domainId, score]) => ({
        domainId,
        score,
      }))

      const res = await fetch('/napi/teacher/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent,
          scores: assessmentScores,
          notes,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Değerlendirme kaydedilemedi')
      }

      toast({
        title: 'Başarılı!',
        description: 'Değerlendirme kaydedildi',
        variant: 'success',
      })

      // Reset form
      setSelectedStudent('')
      setNotes('')
      onSuccess?.()
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="rounded-2xl border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-harmony-brain" />
          <CardTitle>Yeni Değerlendirme</CardTitle>
        </div>
        <CardDescription>
          10 gelişim alanında öğrenci değerlendirmesi yapın
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Öğrenci Seçimi */}
          <div className="space-y-2">
            <Label htmlFor="student">Öğrenci *</Label>
            <Select
              id="student"
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

          {/* Gelişim Alanları Puanlama */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Gelişim Alanları</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {domains.map((domain) => (
                <div
                  key={domain.id}
                  className="p-4 rounded-xl border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: domain.color }}
                    />
                    <Label className="font-medium">{domain.nameTr}</Label>
                  </div>
                  <div className="flex gap-1">
                    {SCORE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleScoreChange(domain.id, option.value)}
                        className={`
                          flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all
                          ${scores[domain.id] === option.value
                            ? 'bg-primary text-primary-foreground shadow-md scale-105'
                            : 'bg-muted hover:bg-muted/80'
                          }
                        `}
                      >
                        {option.value}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {SCORE_OPTIONS.find(o => o.value === scores[domain.id])?.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Notlar */}
          <div className="space-y-2">
            <Label htmlFor="notes">Ek Notlar</Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Değerlendirme ile ilgili notlarınız..."
              className="w-full h-24 px-4 py-3 rounded-xl border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading || !selectedStudent}
            className="w-full rounded-xl h-12"
            data-testid="submit-assessment-btn"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Değerlendirmeyi Kaydet
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
