"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Plus, Search, Edit, Trash2, Users, School, Download, FilterX } from "lucide-react"
import { useAdminClasses, useDeleteClass, useCreateClass, useUpdateClass } from "@/hooks/api/use-admin"
import { EmptyState } from "@/components/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useDebounce } from "@/hooks/use-debounce"
import { PageContainer } from "@/components/layout/page-container"
import { GlassCard } from "@/components/ui/glass-card"

export default function AdminClassesPage() {
  const [pagination, setPagination] = useState({ page: 1, limit: 20 })
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 500)

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [editingClass, setEditingClass] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    ageGroup: "",
    capacity: 20,
    academicYear: "",
  })

  // Reset pagination when search changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [debouncedSearch])

  // Set current academic year as default
  useEffect(() => {
    const currentYear = new Date().getFullYear()
    const nextYear = currentYear + 1
    if (!formData.academicYear) {
      setFormData(prev => ({ ...prev, academicYear: `${currentYear}-${nextYear}` }))
    }
  }, [])

  const { data, isLoading: loading, error } = useAdminClasses({
    page: pagination.page,
    limit: pagination.limit,
    search: debouncedSearch || undefined,
  })

  const deleteClass = useDeleteClass()
  const createClass = useCreateClass()
  const updateClass = useUpdateClass()

  const classes = data?.data || []
  const paginationData = data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 }

  const handleDelete = async () => {
    if (!deleteId) return

    toast.promise(deleteClass.mutateAsync(deleteId), {
      loading: 'Siliniyor...',
      success: () => {
        setDeleteId(null)
        return 'Sınıf başarıyla silindi'
      },
      error: 'Silme işlemi başarısız oldu'
    })
  }

  const handleEdit = (classData: any) => {
    setEditingClass(classData)
    setFormData({
      name: classData.name || "",
      ageGroup: classData.ageGroup || "",
      capacity: classData.capacity || 20,
      academicYear: classData.academicYear || "",
    })
    setIsEditModalOpen(true)
  }

  const handleCreate = () => {
    setEditingClass(null)
    const currentYear = new Date().getFullYear()
    const nextYear = currentYear + 1
    setFormData({
      name: "",
      ageGroup: "",
      capacity: 20,
      academicYear: `${currentYear}-${nextYear}`,
    })
    setIsCreateModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.name || !formData.ageGroup || !formData.academicYear) {
      toast.error("Lütfen zorunlu alanları doldurun")
      return
    }

    const promise = editingClass
      ? updateClass.mutateAsync({ id: editingClass.id, data: formData })
      : createClass.mutateAsync(formData)

    toast.promise(promise, {
      loading: 'Kaydediliyor...',
      success: () => {
        setIsEditModalOpen(false)
        setIsCreateModalOpen(false)
        return editingClass ? 'Sınıf güncellendi' : 'Yeni sınıf oluşturuldu'
      },
      error: (err) => `Hata: ${err.message}`
    })
  }

  return (
    <PageContainer
      title="Sınıf Yönetimi"
      description="Sistemdeki tüm sınıfları görüntüleyin ve yönetin."
      actions={
        <Button onClick={handleCreate} className="shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Yeni Sınıf
        </Button>
      }
    >
      {/* Search */}
      <GlassCard className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Sınıf adı ile ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 bg-white border-stone-200 focus:border-primary focus:ring-primary/20 transition-all rounded-xl"
          />
        </div>
      </GlassCard>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden border-stone-100 shadow-sm">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-2 w-full mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-1/2" />
                  <Skeleton className="h-9 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : classes.length === 0 ? (
        <EmptyState
          icon={School}
          title="Sınıf Bulunamadı"
          description={search ? "Arama kriterlerinize uygun sınıf bulunamadı." : "Sistemde henüz kayıtlı sınıf yok."}
          action={
            search ? (
              <Button variant="outline" onClick={() => setSearch("")}>Aramayı Temizle</Button>
            ) : (
              <Button onClick={handleCreate}>İlk Sınıfı Ekle</Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classData: any) => {
            const studentCount = classData.studentCount || 0
            const capacity = classData.capacity || 20
            const occupancy = (studentCount / capacity) * 100
            const isFull = studentCount >= capacity

            return (
              <Card key={classData.id} className="group overflow-hidden border-stone-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <CardHeader className="bg-gradient-to-br from-stone-50 to-white border-b border-stone-100 pb-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="h-10 w-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-inner">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <span
                      className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full font-bold ${classData.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-stone-200 text-stone-600'
                        }`}
                    >
                      {classData.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                  <CardTitle className="text-xl">{classData.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{classData.ageGroup} Yaş</span>
                    <span>•</span>
                    <span>{classData.academicYear}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Users className="h-4 w-4" />
                          Doluluk
                        </span>
                        <span className={`font-medium ${isFull ? 'text-red-500' : 'text-foreground'}`}>
                          {studentCount} / {capacity}
                        </span>
                      </div>
                      <Progress value={occupancy} className={`h-2 ${isFull ? 'bg-red-100' : 'bg-secondary'}`} />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition-colors" onClick={() => handleEdit(classData)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Düzenle
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteId(classData.id)}
                        className="hover:border-red-200 hover:bg-red-50 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {paginationData.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            disabled={paginationData.page === 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            className="rounded-xl shadow-sm"
          >
            Önceki
          </Button>
          <span className="text-sm font-medium bg-white px-4 py-2 rounded-xl border border-stone-200 shadow-sm">
            {paginationData.page} / {paginationData.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={paginationData.page === paginationData.totalPages}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            className="rounded-xl shadow-sm"
          >
            Sonraki
          </Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isCreateModalOpen || isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateModalOpen(false)
          setIsEditModalOpen(false)
        }
      }}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{isEditModalOpen ? 'Sınıf Düzenle' : 'Yeni Sınıf Ekle'}</DialogTitle>
            <DialogDescription>
              Sınıf bilgilerini aşağıdan yönetebilirsiniz.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Sınıf Adı *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ageGroup">Yaş Grubu *</Label>
                  <Select
                    value={formData.ageGroup}
                    onValueChange={(val: any) => setFormData({ ...formData, ageGroup: val })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3-4">3-4 Yaş</SelectItem>
                      <SelectItem value="4-5">4-5 Yaş</SelectItem>
                      <SelectItem value="5-6">5-6 Yaş</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Kapasite *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    max="30"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    required
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="academicYear">Akademik Yıl *</Label>
                <Input
                  id="academicYear"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  required
                  className="rounded-xl"
                  placeholder="2024-2025"
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
              <Button type="submit" disabled={createClass.isPending || updateClass.isPending} className="rounded-xl">
                {createClass.isPending || updateClass.isPending ? "Kaydediliyor..." : "Kaydet"}
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
              Bu işlem geri alınamaz. Sınıf kalıcı olarak silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 rounded-xl">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </PageContainer>
  )
}
