"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button, Input, Label } from "@/components/ui"
import { Select } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ClassModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  classData?: any
  onSuccess?: () => void
}

export function ClassModal({ open, onOpenChange, classData, onSuccess }: ClassModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    ageGroup: '3-4',
    capacity: 20,
    academicYear: '2024-2025',
    description: '',
  })

  useEffect(() => {
    if (classData) {
      setFormData({
        name: classData.name || '',
        ageGroup: classData.ageGroup || '3-4',
        capacity: classData.capacity || 20,
        academicYear: classData.academicYear || '2024-2025',
        description: classData.description || '',
      })
    } else {
      setFormData({
        name: '',
        ageGroup: '3-4',
        capacity: 20,
        academicYear: '2024-2025',
        description: '',
      })
    }
  }, [classData, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = classData ? `/api/admin/classes/${classData.id}` : '/napi/admin/classes'
      const method = classData ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Bir hata oluştu')
      }

      toast.success(classData ? 'Sınıf güncellendi' : 'Sınıf oluşturuldu')

      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>{classData ? 'Sınıf Düzenle' : 'Yeni Sınıf'}</DialogTitle>
          <DialogDescription>
            {classData ? 'Sınıf bilgilerini güncelleyin' : 'Sisteme yeni bir sınıf ekleyin'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Sınıf Adı *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Örn: Papatyalar"
              required
              className="rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ageGroup">Yaş Grubu *</Label>
              <Select
                id="ageGroup"
                value={formData.ageGroup}
                onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
                className="rounded-xl"
              >
                <option value="2-3">2-3 Yaş</option>
                <option value="3-4">3-4 Yaş</option>
                <option value="4-5">4-5 Yaş</option>
                <option value="5-6">5-6 Yaş</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Kapasite *</Label>
              <Input
                id="capacity"
                type="number"
                min={1}
                max={50}
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                required
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="academicYear">Akademik Yıl *</Label>
            <Select
              id="academicYear"
              value={formData.academicYear}
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
              className="rounded-xl"
            >
              <option value="2024-2025">2024-2025</option>
              <option value="2025-2026">2025-2026</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Sınıf hakkında notlar"
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
              {classData ? 'Güncelle' : 'Oluştur'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
