"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui"
import { BookOpen, Users, ArrowRight, Plus } from "lucide-react"
import Link from "next/link"
import { useTeacherId, useTeacherClasses } from "@/hooks/api/use-teacher"

export default function TeacherClassesPage() {
  const { data: teacherId, isLoading: teacherIdLoading, error: teacherIdError } = useTeacherId()
  const { data: classes = [], isLoading: classesLoading, error: classesError, refetch } = useTeacherClasses(teacherId || null)
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    ageGroup: "",
    academicYear: new Date().getFullYear() + "-" + (new Date().getFullYear() + 1),
    capacity: 20,
  })

  const loading = teacherIdLoading || classesLoading
  const error = teacherIdError || classesError

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teacherId) return
    
    setSaving(true)
    try {
      // Create class
      const createRes = await fetch('/napi/admin/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          isActive: true,
        }),
      })
      
      if (!createRes.ok) throw new Error('Failed to create class')
      const newClass = await createRes.json()
      const classId = newClass?.data?.id || newClass?.id
      
      // Assign teacher to class
      await fetch('/napi/admin/class-teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId,
          teacherId,
          isLeadTeacher: true,
        }),
      })
      
      setIsCreateModalOpen(false)
      setFormData({
        name: "",
        ageGroup: "",
        academicYear: new Date().getFullYear() + "-" + (new Date().getFullYear() + 1),
        capacity: 20,
      })
      refetch()
    } catch (error) {
      console.error('Error creating class:', error)
      alert('Sinif olusturulurken hata olustu')
    } finally {
      setSaving(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Hata: {error instanceof Error ? error.message : 'Bilinmeyen hata'}</p>
          <Button onClick={() => window.location.reload()}>Yeniden Dene</Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Sınıflarım</h1>
            <p className="text-muted-foreground">
              Yönetmek istediğiniz sınıfı seçin veya yeni sınıf oluşturun
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Sinif
          </Button>
        </div>

        {classes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground mb-4">
                Henüz sınıfınız bulunmuyor.
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Ilk Sinifi Olustur
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((classData: any) => (
              <Link key={classData.id} href={`/teacher/classes/${classData.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <CardTitle>{classData.name}</CardTitle>
                    <CardDescription>
                      {classData.ageGroup} yaş grubu • {classData.academicYear}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {classData.student_count || 0} öğrenci
                      </span>
                    </div>
                    <Button className="w-full">
                      Sınıfı Aç
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Create Class Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Sinif Olustur</DialogTitle>
              <DialogDescription>
                Yeni bir sinif olusturun ve yonetmeye baslayin
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateClass}>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="name">Sinif Adi *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Papatyalar Sinifi"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="ageGroup">Yas Grubu *</Label>
                  <Input
                    id="ageGroup"
                    value={formData.ageGroup}
                    onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
                    placeholder="3-4"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="academicYear">Akademik Yil *</Label>
                  <Input
                    id="academicYear"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    placeholder="2024-2025"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="capacity">Kapasite</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Iptal
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Olusturuluyor..." : "Olustur"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
