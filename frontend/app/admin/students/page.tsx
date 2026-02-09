"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { GraduationCap, Plus, Search, Edit, Trash2, BookOpen, Download, Calendar as CalendarIcon, FilterX, Power } from "lucide-react"
import { useAdminStudents, useAdminClasses, useDeleteStudent, useCreateStudent, useUpdateStudent } from "@/hooks/api/use-admin"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { EmptyState } from "@/components/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useDebounce } from "@/hooks/use-debounce"
import { PageContainer } from "@/components/layout/page-container"
import { GlassCard } from "@/components/ui/glass-card"


// Export handler
const handleExport = async (type: string) => {
  try {
    const promise = fetch(`/napi/admin/export?type=${type}`).then(async (res) => {
      if (!res.ok) throw new Error('Export failed')
      return res.blob()
    })

    toast.promise(promise, {
      loading: 'Dışa aktarılıyor...',
      success: (blob) => {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${type === 'students' ? 'ogrenciler' : type}.xlsx`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        return 'Dosya başarıyla indirildi'
      },
      error: 'Dışa aktarma başarısız oldu'
    })
  } catch (error) {
    console.error('Export error:', error)
  }
}

export default function AdminStudentsPage() {
  const [pagination, setPagination] = useState({ page: 1, limit: 20 })
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 500)
  const [selectedClassId, setSelectedClassId] = useState<string>("all")

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [permanentDelete, setPermanentDelete] = useState(false)

  const [editingStudent, setEditingStudent] = useState<any>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: undefined as Date | undefined,
    gender: "" as "male" | "female" | "other" | "",
    photoUrl: "",
    enrollmentDate: undefined as Date | undefined,
  })

  // Tüm aktif sınıfları çek (filtre için)
  const { data: classesData, isLoading: classesLoading } = useAdminClasses({
    page: 1,
    limit: 100,
    isActive: true, // Sadece aktif sınıfları getir
  })
  const allClasses = classesData?.data || []
  const classes = allClasses.sort((a: any, b: any) => a.name.localeCompare(b.name))

  // Reset pagination when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [debouncedSearch, selectedClassId])

  const { data, isLoading: loading, error } = useAdminStudents({
    page: pagination.page,
    limit: pagination.limit,
    search: debouncedSearch || undefined,
    classId: selectedClassId !== "all" ? selectedClassId : undefined,
  })

  const deleteStudent = useDeleteStudent()
  const createStudent = useCreateStudent()
  const updateStudent = useUpdateStudent()

  const students = data?.data || []
  const paginationData = data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 }

  const handleDelete = async (hard: boolean = false) => {
    if (!deleteId) return

    toast.promise(deleteStudent.mutateAsync(deleteId + (hard ? "?hard=true" : "")), {
      loading: hard ? 'Kalıcı olarak siliniyor...' : 'Siliniyor...',
      success: () => {
        setDeleteId(null)
        setPermanentDelete(false)
        return hard ? 'Öğrenci kalıcı olarak silindi' : 'Öğrenci pasife alındı'
      },
      error: 'İşlem başarısız oldu'
    })
  }

  const handleToggleActive = async (student: any) => {
    toast.promise(updateStudent.mutateAsync({ id: student.id, data: { isActive: !student.isActive } }), {
      loading: 'Güncelleniyor...',
      success: student.isActive ? 'Öğrenci pasife alındı' : 'Öğrenci aktifleştirildi',
      error: 'İşlem başarısız oldu'
    })
  }

  const handleEdit = (student: any) => {
    setEditingStudent(student)
    setFormData({
      firstName: student.firstName || "",
      lastName: student.lastName || "",
      dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth) : undefined,
      gender: student.gender || "",
      photoUrl: student.photoUrl || "",
      enrollmentDate: student.enrollmentDate ? new Date(student.enrollmentDate) : undefined,
    })
    setIsEditModalOpen(true)
  }

  const handleCreate = () => {
    setEditingStudent(null)
    setFormData({
      firstName: "",
      lastName: "",
      dateOfBirth: undefined,
      gender: "",
      photoUrl: "",
      enrollmentDate: new Date(),
    })
    setIsCreateModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.dateOfBirth) {
      toast.error("Lütfen zorunlu alanları doldurun (Ad, Soyad, Doğum Tarihi)")
      return
    }

    const submitData: any = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      dateOfBirth: format(formData.dateOfBirth, 'yyyy-MM-dd'),
    }
    if (formData.gender) submitData.gender = formData.gender
    if (formData.photoUrl) submitData.photoUrl = formData.photoUrl
    if (formData.enrollmentDate) submitData.enrollmentDate = format(formData.enrollmentDate, 'yyyy-MM-dd')

    const promise = editingStudent
      ? updateStudent.mutateAsync({ id: editingStudent.id, data: submitData })
      : createStudent.mutateAsync(submitData)

    toast.promise(promise, {
      loading: 'Kaydediliyor...',
      success: () => {
        setIsEditModalOpen(false)
        setIsCreateModalOpen(false)
        setFormData({ firstName: "", lastName: "", dateOfBirth: undefined, gender: "", photoUrl: "", enrollmentDate: undefined })
        return editingStudent ? 'Öğrenci güncellendi' : 'Yeni öğrenci oluşturuldu'
      },
      error: (err) => `Hata: ${err.message}`
    })
  }

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

  const clearFilters = () => {
    setSearch("")
    setSelectedClassId("all")
  }

  const hasActiveFilters = search !== "" || selectedClassId !== "all"

  return (
    <PageContainer
      title="Öğrenci Yönetimi"
      description="Sistemdeki tüm öğrencileri görüntüleyin ve yönetin."
      actions={
        <>
          <Button variant="outline" onClick={() => handleExport('students')} className="shadow-sm bg-white/50 border-stone-200">
            <Download className="mr-2 h-4 w-4" />
            Excel
          </Button>
          <Button onClick={handleCreate} className="shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Öğrenci
          </Button>
        </>
      }
    >
      {/* Filters */}
      <GlassCard className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full space-y-2">
            <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Arama</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Öğrenci adı ile ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10 bg-white border-stone-200 focus:border-primary focus:ring-primary/20 transition-all rounded-xl"
              />
            </div>
          </div>
          <div className="w-full sm:w-[250px] space-y-2">
            <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Sınıf Filtresi</Label>
            <Select value={selectedClassId} onValueChange={setSelectedClassId} disabled={classesLoading}>
              <SelectTrigger className="h-10 bg-white border-stone-200 rounded-xl">
                <SelectValue placeholder="Sınıf Seçiniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Sınıflar</SelectItem>
                {classes.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} ({c.ageGroup} yaş)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="mb-0.5 text-muted-foreground hover:text-foreground hover:bg-stone-100 rounded-xl"
            >
              <FilterX className="mr-2 h-4 w-4" />
              Filtreleri Temizle
            </Button>
          )}
        </div>
      </GlassCard>

      {/* Content */}
      <Card className="border-stone-200 shadow-sm overflow-hidden rounded-2xl">
        <CardHeader className="border-b border-stone-100 bg-white/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold">Öğrenci Listesi</CardTitle>
              <CardDescription>Toplam {paginationData.total} kayıt bulundu</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : students.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="Öğrenci Bulunamadı"
              description={hasActiveFilters ? "Arama kriterlerinize uygun öğrenci bulunamadı." : "Sistemde henüz kayıtlı öğrenci yok."}
              action={
                hasActiveFilters ? (
                  <Button variant="outline" onClick={clearFilters}>Filtreleri Temizle</Button>
                ) : (
                  <Button onClick={handleCreate}>İlk Öğrenciyi Ekle</Button>
                )
              }
            />
          ) : (
            <div className="divide-y divide-stone-100">
              {students.map((student: any) => (
                <div
                  key={student.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 hover:bg-stone-50/80 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-indigo-700 font-semibold shadow-inner">
                      {student.photoUrl ? (
                        <img src={student.photoUrl} alt={student.firstName} className="h-full w-full object-cover rounded-full" />
                      ) : (
                        <GraduationCap className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {student.firstName} {student.lastName}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className="text-xs text-muted-foreground bg-stone-100 px-2 py-0.5 rounded-full">
                          {calculateAge(student.dateOfBirth)} yaşında
                        </span>
                        {student.gender && (
                          <span className="text-xs text-muted-foreground bg-stone-100 px-2 py-0.5 rounded-full">
                            {student.gender === 'male' ? 'Erkek' : student.gender === 'female' ? 'Kız' : 'Diğer'}
                          </span>
                        )}
                        {student.classStudents && student.classStudents.length > 0 && (
                          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-700">
                            {student.classStudents[0].class.name}
                          </span>
                        )}
                        <span
                          className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${student.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-stone-200 text-stone-600'
                            }`}
                        >
                          {student.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 sm:mt-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(student)}
                      className={cn(
                        "rounded-xl transition-colors",
                        student.isActive ? "hover:bg-amber-50 hover:text-amber-600" : "hover:bg-green-50 hover:text-green-600"
                      )}
                      title={student.isActive ? "Pasife Al" : "Aktifleştir"}
                    >
                      <Power className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(student)} className="hover:bg-blue-50 hover:text-blue-600 rounded-xl">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDeleteId(student.id)
                        setPermanentDelete(true)
                      }}
                      className="hover:bg-red-50 hover:text-red-600 rounded-xl"
                      title="Kalıcı Sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {paginationData.totalPages > 1 && (
            <div className="border-t border-stone-100 p-4 bg-stone-50/30 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                disabled={paginationData.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                className="rounded-xl"
              >
                Önceki
              </Button>
              <span className="text-sm font-medium text-muted-foreground">
                Sayfa {paginationData.page} / {paginationData.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={paginationData.page === paginationData.totalPages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                className="rounded-xl"
              >
                Sonraki
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={isCreateModalOpen || isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateModalOpen(false)
          setIsEditModalOpen(false)
        }
      }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>{isEditModalOpen ? 'Öğrenci Düzenle' : 'Yeni Öğrenci Ekle'}</DialogTitle>
            <DialogDescription>
              Öğrenci bilgilerini aşağıdan yönetebilirsiniz.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Ad *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
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
                    required
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2 flex flex-col">
                <Label>Doğum Tarihi *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal rounded-xl",
                        !formData.dateOfBirth && "text-muted-foreground"
                      )}
                    >
                      {formData.dateOfBirth ? (
                        format(formData.dateOfBirth, "PPP", { locale: tr })
                      ) : (
                        <span>Tarih seçiniz</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.dateOfBirth}
                      onSelect={(date) => setFormData({ ...formData, dateOfBirth: date })}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Cinsiyet</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(val: any) => setFormData({ ...formData, gender: val })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Erkek</SelectItem>
                    <SelectItem value="female">Kız</SelectItem>
                    <SelectItem value="other">Diğer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 flex flex-col">
                <Label>Kayıt Tarihi</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal rounded-xl",
                        !formData.enrollmentDate && "text-muted-foreground"
                      )}
                    >
                      {formData.enrollmentDate ? (
                        format(formData.enrollmentDate, "PPP", { locale: tr })
                      ) : (
                        <span>Tarih seçiniz</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.enrollmentDate}
                      onSelect={(date) => setFormData({ ...formData, enrollmentDate: date })}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="photoUrl">Fotoğraf URL</Label>
                <Input
                  id="photoUrl"
                  type="url"
                  value={formData.photoUrl}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => {
                setIsCreateModalOpen(false)
                setIsEditModalOpen(false)
              }} className="rounded-xl">
                İptal
              </Button>
              <Button type="submit" disabled={createStudent.isPending || updateStudent.isPending} className="rounded-xl">
                {createStudent.isPending || updateStudent.isPending ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Öğrenci kalıcı olarak silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">İptal</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDelete(true)} className="bg-red-600 hover:bg-red-700 rounded-xl">
              Kalıcı Olarak Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </PageContainer>
  )
}
