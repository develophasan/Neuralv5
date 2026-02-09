"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Badge } from "@/components/ui"
import { BookOpen, Users, GraduationCap, ArrowLeft, TrendingUp, Plus, Edit, Trash2, UserPlus, Settings } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useTeacherClass, useTeacherId } from "@/hooks/api/use-teacher"

export default function TeacherClassDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: teacherId } = useTeacherId()
  const { data: classData, isLoading: loading, refetch } = useTeacherClass(params.id as string | null)
  
  // Modals
  const [isEditClassModalOpen, setIsEditClassModalOpen] = useState(false)
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false)
  const [isEditStudentModalOpen, setIsEditStudentModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<any>(null)
  
  // Available students (not in this class)
  const [availableStudents, setAvailableStudents] = useState<any[]>([])
  const [loadingAvailable, setLoadingAvailable] = useState(false)
  
  // Form data
  const [classFormData, setClassFormData] = useState({
    name: "",
    ageGroup: "",
    academicYear: "",
    capacity: 20,
  })
  
  const [studentFormData, setStudentFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "" as "male" | "female" | "other" | "",
  })
  
  const [saving, setSaving] = useState(false)

  // Populate class form when data loads
  useEffect(() => {
    if (classData) {
      setClassFormData({
        name: classData.name || "",
        ageGroup: classData.ageGroup || "",
        academicYear: classData.academicYear || "",
        capacity: classData.capacity || 20,
      })
    }
  }, [classData])

  const calculateAge = (dateOfBirth: string) => {
    const birth = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  // Load available students when add modal opens
  const handleOpenAddStudentModal = async () => {
    setIsAddStudentModalOpen(true)
    setLoadingAvailable(true)
    try {
      // Get all students
      const res = await fetch('/napi/admin/students?limit=1000')
      const data = await res.json()
      const allStudents = data?.data?.data || data?.data || []
      
      // Filter out students already in this class
      const classStudentIds = new Set(
        classData?.classStudents?.map((cs: any) => cs.student.id) || []
      )
      const available = allStudents.filter((s: any) => !classStudentIds.has(s.id))
      setAvailableStudents(available)
    } catch (error) {
      console.error('Error loading students:', error)
    } finally {
      setLoadingAvailable(false)
    }
  }

  // Add existing student to class
  const handleAddStudentToClass = async (studentId: string) => {
    setSaving(true)
    try {
      const res = await fetch('/napi/teacher/class-students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: params.id,
          studentId,
        }),
      })
      
      if (!res.ok) throw new Error('Failed to add student')
      
      setIsAddStudentModalOpen(false)
      refetch()
    } catch (error) {
      console.error('Error adding student:', error)
      alert('Ogrenci eklenirken hata olustu')
    } finally {
      setSaving(false)
    }
  }

  // Create new student and add to class
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      // Create student
      const createRes = await fetch('/napi/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...studentFormData,
          enrollmentDate: new Date().toISOString(),
        }),
      })
      
      if (!createRes.ok) throw new Error('Failed to create student')
      const newStudent = await createRes.json()
      const studentId = newStudent?.data?.id || newStudent?.id
      
      // Add to class
      await fetch('/napi/teacher/class-students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: params.id,
          studentId,
        }),
      })
      
      setIsAddStudentModalOpen(false)
      setStudentFormData({ firstName: "", lastName: "", dateOfBirth: "", gender: "" })
      refetch()
    } catch (error) {
      console.error('Error creating student:', error)
      alert('Ogrenci olusturulurken hata olustu')
    } finally {
      setSaving(false)
    }
  }

  // Edit student
  const handleEditStudent = (student: any) => {
    setEditingStudent(student)
    setStudentFormData({
      firstName: student.firstName || "",
      lastName: student.lastName || "",
      dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : "",
      gender: student.gender || "",
    })
    setIsEditStudentModalOpen(true)
  }

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingStudent) return
    
    setSaving(true)
    try {
      const res = await fetch(`/napi/admin/students/${editingStudent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentFormData),
      })
      
      if (!res.ok) throw new Error('Failed to update student')
      
      setIsEditStudentModalOpen(false)
      setEditingStudent(null)
      refetch()
    } catch (error) {
      console.error('Error updating student:', error)
      alert('Ogrenci guncellenirken hata olustu')
    } finally {
      setSaving(false)
    }
  }

  // Remove student from class
  const handleRemoveStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`${studentName} ogrencisini siniftan cikarmak istediginizden emin misiniz?`)) return
    
    setSaving(true)
    try {
      const res = await fetch(`/napi/teacher/class-students?classId=${params.id}&studentId=${studentId}`, {
        method: 'DELETE',
      })
      
      if (!res.ok) throw new Error('Failed to remove student')
      
      refetch()
    } catch (error) {
      console.error('Error removing student:', error)
      alert('Ogrenci cikarilirken hata olustu')
    } finally {
      setSaving(false)
    }
  }

  // Delete student completely
  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`${studentName} ogrencisini ve tum verilerini KALICI olarak silmek istediginizden emin misiniz? Bu islem geri alinamaz!`)) return
    
    setSaving(true)
    try {
      const res = await fetch(`/napi/admin/students/${studentId}`, {
        method: 'DELETE',
      })
      
      if (!res.ok) throw new Error('Failed to delete student')
      
      refetch()
    } catch (error) {
      console.error('Error deleting student:', error)
      alert('Ogrenci silinirken hata olustu')
    } finally {
      setSaving(false)
    }
  }

  // Update class
  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/napi/admin/classes/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classFormData),
      })
      
      if (!res.ok) throw new Error('Failed to update class')
      
      setIsEditClassModalOpen(false)
      refetch()
    } catch (error) {
      console.error('Error updating class:', error)
      alert('Sinif guncellenirken hata olustu')
    } finally {
      setSaving(false)
    }
  }

  // Delete class
  const handleDeleteClass = async () => {
    if (!confirm('Bu sinifi silmek istediginizden emin misiniz? Siniftaki ogrenci kayitlari korunacaktir.')) return
    
    setSaving(true)
    try {
      const res = await fetch(`/napi/admin/classes/${params.id}`, {
        method: 'DELETE',
      })
      
      if (!res.ok) throw new Error('Failed to delete class')
      
      router.push('/teacher/classes')
    } catch (error) {
      console.error('Error deleting class:', error)
      alert('Sinif silinirken hata olustu')
    } finally {
      setSaving(false)
    }
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

  if (!classData) {
    return (
      <div className="min-h-screen p-8">
        <p className="text-center text-muted-foreground">Sınıf bulunamadı</p>
      </div>
    )
  }

  const activeStudents = classData.classStudents?.filter((cs: any) => cs.isActive) || []

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/teacher/classes">
              <Button variant="ghost" className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Geri
              </Button>
            </Link>
            <h1 className="text-3xl font-bold mb-1">{classData.name}</h1>
            <p className="text-muted-foreground">
              {classData.ageGroup} yaş grubu • {classData.academicYear}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditClassModalOpen(true)}>
              <Settings className="mr-2 h-4 w-4" />
              Sinifi Duzenle
            </Button>
            <Button onClick={handleOpenAddStudentModal}>
              <UserPlus className="mr-2 h-4 w-4" />
              Ogrenci Ekle
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Öğrenci</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeStudents.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Kapasite: {classData.capacity}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Students List */}
        <Card>
          <CardHeader>
            <CardTitle>Öğrenciler</CardTitle>
            <CardDescription>
              Sınıftaki tüm öğrencileri yönetin
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeStudents.length === 0 ? (
              <div className="text-center py-12">
                <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground mb-4">Bu sınıfta henüz öğrenci bulunmuyor.</p>
                <Button onClick={handleOpenAddStudentModal}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Ogrenci Ekle
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {activeStudents.map((cs: any) => {
                  const age = calculateAge(cs.student.dateOfBirth)
                  return (
                    <div
                      key={cs.student.id}
                      className="flex items-center justify-between p-4 border rounded-xl hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <GraduationCap className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {cs.student.firstName} {cs.student.lastName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {age} yaşında
                            {cs.student.gender && ` • ${cs.student.gender === 'male' ? 'Erkek' : 'Kız'}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/teacher/students/${cs.student.id}`}>
                          <Button variant="ghost" size="sm">
                            <TrendingUp className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditStudent(cs.student)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                          onClick={() => handleRemoveStudent(cs.student.id, `${cs.student.firstName} ${cs.student.lastName}`)}
                        >
                          <UserPlus className="h-4 w-4 rotate-45" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteStudent(cs.student.id, `${cs.student.firstName} ${cs.student.lastName}`)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Class Modal */}
        <Dialog open={isEditClassModalOpen} onOpenChange={setIsEditClassModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sinifi Duzenle</DialogTitle>
              <DialogDescription>
                Sinif bilgilerini guncelleyin
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateClass}>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="class-name">Sinif Adi *</Label>
                  <Input
                    id="class-name"
                    value={classFormData.name}
                    onChange={(e) => setClassFormData({ ...classFormData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="age-group">Yas Grubu *</Label>
                  <Input
                    id="age-group"
                    value={classFormData.ageGroup}
                    onChange={(e) => setClassFormData({ ...classFormData, ageGroup: e.target.value })}
                    placeholder="3-4"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="academic-year">Akademik Yil *</Label>
                  <Input
                    id="academic-year"
                    value={classFormData.academicYear}
                    onChange={(e) => setClassFormData({ ...classFormData, academicYear: e.target.value })}
                    placeholder="2024-2025"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="capacity">Kapasite</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={classFormData.capacity}
                    onChange={(e) => setClassFormData({ ...classFormData, capacity: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteClass}
                  disabled={saving}
                >
                  Sinifi Sil
                </Button>
                <div className="flex-1" />
                <Button type="button" variant="outline" onClick={() => setIsEditClassModalOpen(false)}>
                  Iptal
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Kaydediliyor..." : "Kaydet"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add Student Modal */}
        <Dialog open={isAddStudentModalOpen} onOpenChange={setIsAddStudentModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ogrenci Ekle</DialogTitle>
              <DialogDescription>
                Mevcut bir ogrenciyi sinifa ekleyin veya yeni ogrenci olusturun
              </DialogDescription>
            </DialogHeader>
            
            {/* Existing Students */}
            <div className="py-4">
              <h3 className="font-semibold mb-3">Mevcut Ogrenciler</h3>
              {loadingAvailable ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : availableStudents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Eklenebilecek ogrenci bulunamadi
                </p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-2">
                  {availableStudents.map((student: any) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-2 hover:bg-accent rounded-lg"
                    >
                      <span className="text-sm">
                        {student.firstName} {student.lastName}
                      </span>
                      <Button 
                        size="sm" 
                        onClick={() => handleAddStudentToClass(student.id)}
                        disabled={saving}
                      >
                        Ekle
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Yeni Ogrenci Olustur</h3>
              <form onSubmit={handleCreateStudent}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Ad *</Label>
                    <Input
                      id="firstName"
                      value={studentFormData.firstName}
                      onChange={(e) => setStudentFormData({ ...studentFormData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Soyad *</Label>
                    <Input
                      id="lastName"
                      value={studentFormData.lastName}
                      onChange={(e) => setStudentFormData({ ...studentFormData, lastName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Dogum Tarihi *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={studentFormData.dateOfBirth}
                      onChange={(e) => setStudentFormData({ ...studentFormData, dateOfBirth: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Cinsiyet</Label>
                    <select
                      id="gender"
                      value={studentFormData.gender}
                      onChange={(e) => setStudentFormData({ ...studentFormData, gender: e.target.value as any })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Seciniz</option>
                      <option value="male">Erkek</option>
                      <option value="female">Kiz</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddStudentModalOpen(false)}>
                    Iptal
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? "Olusturuluyor..." : "Olustur ve Ekle"}
                  </Button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Student Modal */}
        <Dialog open={isEditStudentModalOpen} onOpenChange={setIsEditStudentModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ogrenci Duzenle</DialogTitle>
              <DialogDescription>
                Ogrenci bilgilerini guncelleyin
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateStudent}>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="edit-firstName">Ad *</Label>
                  <Input
                    id="edit-firstName"
                    value={studentFormData.firstName}
                    onChange={(e) => setStudentFormData({ ...studentFormData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-lastName">Soyad *</Label>
                  <Input
                    id="edit-lastName"
                    value={studentFormData.lastName}
                    onChange={(e) => setStudentFormData({ ...studentFormData, lastName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-dateOfBirth">Dogum Tarihi *</Label>
                  <Input
                    id="edit-dateOfBirth"
                    type="date"
                    value={studentFormData.dateOfBirth}
                    onChange={(e) => setStudentFormData({ ...studentFormData, dateOfBirth: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-gender">Cinsiyet</Label>
                  <select
                    id="edit-gender"
                    value={studentFormData.gender}
                    onChange={(e) => setStudentFormData({ ...studentFormData, gender: e.target.value as any })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Seciniz</option>
                    <option value="male">Erkek</option>
                    <option value="female">Kiz</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditStudentModalOpen(false)}>
                  Iptal
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Kaydediliyor..." : "Kaydet"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
