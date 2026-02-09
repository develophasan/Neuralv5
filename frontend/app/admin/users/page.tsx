"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Users, Plus, Search, Edit, Trash2, Download, FilterX } from "lucide-react"
import { useAdminUsers, useDeleteUser, useCreateUser, useUpdateUser, useAdminStudents } from "@/hooks/api/use-admin"
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
        a.download = `${type === 'users' ? 'kullanicilar' : type}.xlsx`
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

export default function AdminUsersPage() {
  const [pagination, setPagination] = useState({ page: 1, limit: 20 })
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 500) // 500ms debounce
  const [roleFilter, setRoleFilter] = useState<string>("all")

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [editingUser, setEditingUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "", // Added password
    fullName: "",
    role: "teacher" as "admin" | "teacher" | "parent",
    phone: "",
    avatarUrl: "",
    studentId: "", // Added studentId for parents
  })

  // Students list for parent selection
  const { data: studentsData } = useAdminStudents({ limit: 100 })
  const students = studentsData?.data || []

  // Reset pagination when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [debouncedSearch, roleFilter])

  const { data, isLoading: loading, error } = useAdminUsers({
    page: pagination.page,
    limit: pagination.limit,
    search: debouncedSearch || undefined,
    role: roleFilter !== 'all' ? roleFilter : undefined,
  })

  const deleteUser = useDeleteUser()
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()

  const users = data?.data || []
  const paginationData = data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 }

  const handleDelete = async () => {
    if (!deleteId) return

    toast.promise(deleteUser.mutateAsync(deleteId), {
      loading: 'Siliniyor...',
      success: () => {
        setDeleteId(null)
        return 'Kullanıcı başarıyla silindi'
      },
      error: 'Silme işlemi başarısız oldu'
    })
  }

  const handleEdit = (user: any) => {
    setEditingUser(user)
    setFormData({
      email: user.email || "",
      password: "", // Added password
      fullName: user.fullName || "",
      role: user.role || "teacher",
      phone: user.phone || "",
      avatarUrl: user.avatarUrl || "",
      studentId: user.student?.id || "",
    })
    setIsEditModalOpen(true)
  }

  const handleCreate = () => {
    setEditingUser(null)
    setFormData({
      email: "",
      password: "", // Added password
      fullName: "",
      role: "teacher",
      phone: "",
      avatarUrl: "",
      studentId: "",
    })
    setIsCreateModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const submitData: any = {
      email: formData.email,
      fullName: formData.fullName,
      role: formData.role,
    }
    submitData.studentId = formData.studentId

    if (!editingUser) submitData.password = formData.password // Pass password only on creation
    if (formData.phone) submitData.phone = formData.phone
    if (formData.avatarUrl) submitData.avatarUrl = formData.avatarUrl

    const promise = editingUser
      ? updateUser.mutateAsync({ id: editingUser.id, data: submitData })
      : createUser.mutateAsync(submitData)

    toast.promise(promise, {
      loading: 'Kaydediliyor...',
      success: () => {
        setIsEditModalOpen(false)
        setIsCreateModalOpen(false)
        setFormData({ email: "", password: "", fullName: "", role: "teacher", phone: "", avatarUrl: "", studentId: "" })
        return editingUser ? 'Kullanıcı güncellendi' : 'Yeni kullanıcı oluşturuldu'
      },
      error: (err) => `Hata: ${err.message}`
    })
  }

  const clearFilters = () => {
    setSearch("")
    setRoleFilter("all")
  }

  const hasActiveFilters = search !== "" || roleFilter !== "all"

  return (
    <PageContainer
      title="Kullanıcı Yönetimi"
      description="Sistemdeki tüm kullanıcıları görüntüleyin ve yönetin."
      actions={
        <>
          <Button variant="outline" onClick={() => handleExport('users')} className="shadow-sm bg-white/50 border-stone-200">
            <Download className="mr-2 h-4 w-4" />
            Excel'e Aktar
          </Button>
          <Button onClick={handleCreate} className="shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Kullanıcı
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
                placeholder="İsim veya e-posta ile ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10 bg-white border-stone-200 focus:border-primary focus:ring-primary/20 transition-all rounded-xl"
              />
            </div>
          </div>
          <div className="w-full sm:w-[200px] space-y-2">
            <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Rol Filtresi</Label>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="h-10 bg-white border-stone-200 rounded-xl">
                <SelectValue placeholder="Rol Seçiniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Roller</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="teacher">Öğretmen</SelectItem>
                <SelectItem value="parent">Veli</SelectItem>
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
              <CardTitle className="text-lg font-semibold">Kullanıcı Listesi</CardTitle>
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
          ) : users.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Kullanıcı Bulunamadı"
              description={hasActiveFilters ? "Arama kriterlerinize uygun kullanıcı bulunamadı." : "Sistemde henüz kayıtlı kullanıcı yok."}
              action={
                hasActiveFilters ? (
                  <Button variant="outline" onClick={clearFilters}>Filtreleri Temizle</Button>
                ) : (
                  <Button onClick={handleCreate}>İlk Kullanıcıyı Ekle</Button>
                )
              }
            />
          ) : (
            <div className="divide-y divide-stone-100">
              {users.map((user: any) => (
                <div
                  key={user.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 hover:bg-stone-50/80 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center text-stone-600 font-semibold shadow-inner">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.fullName} className="h-full w-full object-cover rounded-full" />
                      ) : (
                        user.fullName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{user.fullName}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold
                                ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                            user.role === 'teacher' ? 'bg-blue-100 text-blue-700' :
                              'bg-emerald-100 text-emerald-700'}`}>
                          {user.role === 'admin' ? 'Admin' : user.role === 'teacher' ? 'Öğretmen' : 'Veli'}
                        </span>
                        {user.phone && (
                          <span className="text-xs text-muted-foreground bg-stone-100 px-2 py-0.5 rounded-full">
                            {user.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 sm:mt-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(user)} className="hover:bg-blue-50 hover:text-blue-600 rounded-xl">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(user.id)}
                      className="hover:bg-red-50 hover:text-red-600 rounded-xl"
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
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{isEditModalOpen ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}</DialogTitle>
            <DialogDescription>
              Kullanıcı bilgilerini aşağıdan yönetebilirsiniz.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-email">E-posta</Label>
                  <Input
                    id="create-email"
                    type="email"
                    placeholder="ornek@okul.com"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    required
                    autoComplete="off"
                  />
                </div>
                {isCreateModalOpen && (
                  <div className="space-y-2">
                    <Label htmlFor="create-password">Şifre</Label>
                    <Input
                      id="create-password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                      required
                      autoComplete="off"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-name">Ad Soyad</Label>
                <Input
                  id="create-name"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                  required
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select
                  value={formData.role}
                  onValueChange={(val: any) => setFormData({ ...formData, role: val })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="teacher">Öğretmen</SelectItem>
                    <SelectItem value="parent">Veli</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatarUrl">Avatar URL</Label>
                <Input
                  id="avatarUrl"
                  type="url"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  className="rounded-xl"
                  placeholder="Opsiyonel"
                />
              </div>

              {formData.role === "parent" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Label htmlFor="studentId" className="text-primary font-bold">İlişkili Öğrenci *</Label>
                  <Select
                    value={formData.studentId}
                    onValueChange={(val) => setFormData({ ...formData, studentId: val })}
                    required
                  >
                    <SelectTrigger className="rounded-xl border-primary/20 bg-primary/5">
                      <SelectValue placeholder="Öğrenci Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student: any) => {
                        const hasParent = student.parentStudents && student.parentStudents.length > 0;
                        return (
                          <SelectItem key={student.id} value={student.id}>
                            {student.firstName} {student.lastName} {hasParent ? "(Zaten velisi var)" : ""}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground italic">Veli hesabı için öğrenci seçimi zorunludur.</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => {
                setIsCreateModalOpen(false)
                setIsEditModalOpen(false)
              }} className="rounded-xl">
                İptal
              </Button>
              <Button
                type="submit"
                disabled={createUser.isPending || updateUser.isPending || (formData.role === "parent" && !formData.studentId)}
                className="rounded-xl"
              >
                {createUser.isPending || updateUser.isPending ? "Kaydediliyor..." : "Kaydet"}
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
              Bu işlem geri alınamaz. Kullanıcı kalıcı olarak silinecektir.
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
