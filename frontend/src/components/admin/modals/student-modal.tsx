"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button, Input, Label } from "@/components/ui"
import { Select } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/toaster"

interface StudentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student?: any
  classes?: any[]
  onSuccess?: () => void
}

export function StudentModal({ open, onOpenChange, student, classes = [], onSuccess }: StudentModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'male',
    classId: '',
    healthNotes: '',
    allergies: '',
  })

  useEffect(() => {
    if (student) {
      setFormData({
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
        gender: student.gender || 'male',
        classId: student.classStudents?.[0]?.classId || '',
        healthNotes: student.healthNotes || '',
        allergies: student.allergies?.join(', ') || '',
      })
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: 'male',
        classId: '',
        healthNotes: '',
        allergies: '',
      })
    }
  }, [student, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = student ? `/api/admin/students/${student.id}` : '/napi/admin/students'
      const method = student ? 'PUT' : 'POST'

      const body = {
        ...formData,
        allergies: formData.allergies ? formData.allergies.split(',').map(a => a.trim()) : [],
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Bir hata oluştu')
      }

      toast({
        title: 'Başarılı!',
        description: student ? 'Öğrenci güncellendi' : 'Öğrenci oluşturuldu',
        variant: 'success',
      })

      onOpenChange(false)
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>{student ? 'Öğrenci Düzenle' : 'Yeni Öğrenci'}</DialogTitle>
          <DialogDescription>
            {student ? 'Öğrenci bilgilerini güncelleyin' : 'Sisteme yeni bir öğrenci ekleyin'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Ad *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Ad"
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Soyad *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Soyad"
                required
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Doğum Tarihi *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Cinsiyet *</Label>
              <Select
                id="gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="rounded-xl"
              >
                <option value="male">Erkek</option>
                <option value="female">Kız</option>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="classId">Sınıf</Label>
            <Select
              id="classId"
              value={formData.classId}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
              className="rounded-xl"
            >
              <option value="">Sınıf Seçin</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="healthNotes">Sağlık Notları</Label>
            <Input
              id="healthNotes"
              value={formData.healthNotes}
              onChange={(e) => setFormData({ ...formData, healthNotes: e.target.value })}
              placeholder="Sağlık ile ilgili notlar"
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="allergies">Alerjiler (virgülle ayırın)</Label>
            <Input
              id="allergies"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              placeholder="Fıstık, Gluten, ..."
              className="rounded-xl"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              İptal
            </Button>
            <Button type="submit" disabled={loading} className="rounded-xl">
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {student ? 'Güncelle' : 'Oluştur'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
