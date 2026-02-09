"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui"
import { Activity, Plus, Search, Edit, Trash2 } from "lucide-react"
import { useAdminActivities, useDeleteActivity, useCreateActivity, useUpdateActivity } from "@/hooks/api/use-admin"

export default function AdminActivitiesPage() {
  const [pagination, setPagination] = useState({ page: 1, limit: 20 })
  const [search, setSearch] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<any>(null)
  const [domains, setDomains] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    domainId: "",
    ageMin: 2,
    ageMax: 6,
    durationMinutes: "",
    materialsNeeded: "",
    instructions: "",
    difficultyLevel: 1,
    imageUrl: "",
    videoUrl: "",
  })
  
  const { data, isLoading: loading, error } = useAdminActivities({
    page: pagination.page,
    limit: pagination.limit,
    search: search || undefined,
  })
  
  const deleteActivity = useDeleteActivity()
  const createActivity = useCreateActivity()
  const updateActivity = useUpdateActivity()

  // Fetch domains
  useEffect(() => {
    fetch("/napi/admin/domains")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDomains(data.data || [])
        }
      })
      .catch(err => console.error("Error fetching domains:", err))
  }, [])
  
  const activities = data?.data || []
  const paginationData = data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu aktiviteyi silmek istediğinizden emin misiniz?')) return
    deleteActivity.mutate(id)
  }

  const handleEdit = (activity: any) => {
    setEditingActivity(activity)
    setFormData({
      title: activity.title || "",
      description: activity.description || "",
      domainId: activity.domainId || "",
      ageMin: activity.ageMin || 2,
      ageMax: activity.ageMax || 6,
      durationMinutes: activity.durationMinutes?.toString() || "",
      materialsNeeded: Array.isArray(activity.materialsNeeded) 
        ? activity.materialsNeeded.join(", ") 
        : (activity.materialsNeeded || ""),
      instructions: activity.instructions || "",
      difficultyLevel: activity.difficultyLevel || 1,
      imageUrl: activity.imageUrl || "",
      videoUrl: activity.videoUrl || "",
    })
    setIsEditModalOpen(true)
  }

  const handleCreate = () => {
    setEditingActivity(null)
    setFormData({
      title: "",
      description: "",
      domainId: "",
      ageMin: 2,
      ageMax: 6,
      durationMinutes: "",
      materialsNeeded: "",
      instructions: "",
      difficultyLevel: 1,
      imageUrl: "",
      videoUrl: "",
    })
    setIsCreateModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const submitData: any = {
        title: formData.title,
        domainId: formData.domainId,
        ageMin: formData.ageMin,
        ageMax: formData.ageMax,
        difficultyLevel: formData.difficultyLevel,
      }
      if (formData.description) submitData.description = formData.description
      if (formData.durationMinutes) submitData.durationMinutes = parseInt(formData.durationMinutes)
      if (formData.materialsNeeded) {
        submitData.materialsNeeded = formData.materialsNeeded.split(",").map((m: string) => m.trim()).filter(Boolean)
      }
      if (formData.instructions) submitData.instructions = formData.instructions
      if (formData.imageUrl) submitData.imageUrl = formData.imageUrl
      if (formData.videoUrl) submitData.videoUrl = formData.videoUrl

      if (editingActivity) {
        await updateActivity.mutateAsync({ id: editingActivity.id, data: submitData })
        setIsEditModalOpen(false)
      } else {
        await createActivity.mutateAsync(submitData)
        setIsCreateModalOpen(false)
      }
    } catch (error) {
      console.error("Error saving activity:", error)
      alert("Aktivite kaydedilirken hata oluştu: " + (error instanceof Error ? error.message : "Bilinmeyen hata"))
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

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Aktivite Yönetimi</h1>
            <p className="text-muted-foreground">Tüm aktiviteleri görüntüle ve yönet</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Aktivite
          </Button>
        </div>

        {/* Arama */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Aktivite adı ile ara..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Aktivite Listesi */}
        <Card>
          <CardHeader>
            <CardTitle>Aktiviteler ({paginationData.total})</CardTitle>
            <CardDescription>
              Sayfa {paginationData.page} / {paginationData.totalPages}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Yükleniyor...</p>
              </div>
            ) : activities.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">Aktivite bulunamadı</p>
            ) : (
              <div className="space-y-2">
                {activities.map((activity: any) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: activity.domain?.color ? activity.domain.color + '20' : '#f0f0f0' }}
                        >
                          <Activity className="h-5 w-5" style={{ color: activity.domain?.color || '#666' }} />
                        </div>
                        <div>
                          <h3 className="font-semibold">{activity.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {activity.domain?.nameTr || 'Bilinmeyen'} • {activity.ageMin}-{activity.ageMax} yaş
                            • Zorluk: {activity.difficultyLevel}/5
                          </p>
                          {activity.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {activity.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-md font-medium ${
                          activity.isActive
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {activity.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(activity)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(activity.id)}
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
              <div className="flex items-center justify-between mt-6">
                <Button
                  variant="outline"
                  disabled={paginationData.page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Önceki
                </Button>
                <span className="text-sm text-muted-foreground">
                  Sayfa {paginationData.page} / {paginationData.totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={paginationData.page === paginationData.totalPages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Sonraki
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Yeni Aktivite Ekle</DialogTitle>
              <DialogDescription>
                Yeni bir aktivite oluşturun
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="title">Başlık *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Açıklama</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="domainId">Gelişim Alanı *</Label>
                  <select
                    id="domainId"
                    value={formData.domainId}
                    onChange={(e) => setFormData({ ...formData, domainId: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Seçiniz</option>
                    {domains.map((domain) => (
                      <option key={domain.id} value={domain.id}>
                        {domain.nameTr}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ageMin">Minimum Yaş *</Label>
                    <Input
                      id="ageMin"
                      type="number"
                      min="2"
                      max="6"
                      value={formData.ageMin}
                      onChange={(e) => setFormData({ ...formData, ageMin: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="ageMax">Maksimum Yaş *</Label>
                    <Input
                      id="ageMax"
                      type="number"
                      min="2"
                      max="6"
                      value={formData.ageMax}
                      onChange={(e) => setFormData({ ...formData, ageMax: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="difficultyLevel">Zorluk Seviyesi * (1-5)</Label>
                  <Input
                    id="difficultyLevel"
                    type="number"
                    min="1"
                    max="5"
                    value={formData.difficultyLevel}
                    onChange={(e) => setFormData({ ...formData, difficultyLevel: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="durationMinutes">Süre (dakika)</Label>
                  <Input
                    id="durationMinutes"
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="materialsNeeded">Gerekli Malzemeler (virgülle ayırın)</Label>
                  <Input
                    id="materialsNeeded"
                    value={formData.materialsNeeded}
                    onChange={(e) => setFormData({ ...formData, materialsNeeded: e.target.value })}
                    placeholder="Örn: Kağıt, Boya, Fırça"
                  />
                </div>
                <div>
                  <Label htmlFor="instructions">Talimatlar</Label>
                  <textarea
                    id="instructions"
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="imageUrl">Görsel URL</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="videoUrl">Video URL</Label>
                  <Input
                    id="videoUrl"
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  İptal
                </Button>
                <Button type="submit" disabled={createActivity.isPending}>
                  {createActivity.isPending ? "Kaydediliyor..." : "Kaydet"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Aktivite Düzenle</DialogTitle>
              <DialogDescription>
                Aktivite bilgilerini güncelleyin
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="edit-title">Başlık *</Label>
                  <Input
                    id="edit-title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">Açıklama</Label>
                  <textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-domainId">Gelişim Alanı *</Label>
                  <select
                    id="edit-domainId"
                    value={formData.domainId}
                    onChange={(e) => setFormData({ ...formData, domainId: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Seçiniz</option>
                    {domains.map((domain) => (
                      <option key={domain.id} value={domain.id}>
                        {domain.nameTr}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-ageMin">Minimum Yaş *</Label>
                    <Input
                      id="edit-ageMin"
                      type="number"
                      min="2"
                      max="6"
                      value={formData.ageMin}
                      onChange={(e) => setFormData({ ...formData, ageMin: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-ageMax">Maksimum Yaş *</Label>
                    <Input
                      id="edit-ageMax"
                      type="number"
                      min="2"
                      max="6"
                      value={formData.ageMax}
                      onChange={(e) => setFormData({ ...formData, ageMax: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-difficultyLevel">Zorluk Seviyesi * (1-5)</Label>
                  <Input
                    id="edit-difficultyLevel"
                    type="number"
                    min="1"
                    max="5"
                    value={formData.difficultyLevel}
                    onChange={(e) => setFormData({ ...formData, difficultyLevel: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-durationMinutes">Süre (dakika)</Label>
                  <Input
                    id="edit-durationMinutes"
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-materialsNeeded">Gerekli Malzemeler (virgülle ayırın)</Label>
                  <Input
                    id="edit-materialsNeeded"
                    value={formData.materialsNeeded}
                    onChange={(e) => setFormData({ ...formData, materialsNeeded: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-instructions">Talimatlar</Label>
                  <textarea
                    id="edit-instructions"
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-imageUrl">Görsel URL</Label>
                  <Input
                    id="edit-imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-videoUrl">Video URL</Label>
                  <Input
                    id="edit-videoUrl"
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  İptal
                </Button>
                <Button type="submit" disabled={updateActivity.isPending}>
                  {updateActivity.isPending ? "Güncelleniyor..." : "Güncelle"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
