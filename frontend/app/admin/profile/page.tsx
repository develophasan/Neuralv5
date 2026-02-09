"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label, Skeleton } from "@/components/ui"
import { User, Mail, Phone, Lock, Camera, Save, Loader2 } from "lucide-react"
import { PageContainer } from "@/components/layout/page-container"
import { GlassCard } from "@/components/ui/glass-card"
import { toast } from "sonner"

export default function ProfilePage() {
    const { data: session, update: updateSession } = useSession()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        avatarUrl: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })

    useEffect(() => {
        fetch("/napi/admin/profile")
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setFormData(prev => ({
                        ...prev,
                        fullName: data.data.fullName || "",
                        phone: data.data.phone || "",
                        avatarUrl: data.data.avatarUrl || "",
                    }))
                }
                setLoading(false)
            })
            .catch((err) => {
                console.error("Profile fetch error:", err)
                setLoading(false)
            })
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            toast.error("Yeni şifreler eşleşmiyor")
            return
        }

        setSaving(true)
        try {
            const res = await fetch("/napi/admin/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    phone: formData.phone,
                    avatarUrl: formData.avatarUrl,
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword,
                }),
            })

            const data = await res.json()
            if (data.success) {
                toast.success("Profil başarıyla güncellendi")
                await updateSession({ name: formData.fullName })
                setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }))
            } else {
                toast.error(data.error || "Güncelleme başarısız")
            }
        } catch (err) {
            toast.error("Bir hata oluştu")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <PageContainer title="Profil Ayarları" description="Bilgilerinizi güncelleyin">
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </PageContainer>
        )
    }

    return (
        <PageContainer title="Profil Ayarları" description="Hesap bilgilerinizi ve şifrenizi yönetin">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-6">
                    <GlassCard className="text-center p-6">
                        <div className="relative mx-auto w-24 h-24 mb-4">
                            <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-primary/20">
                                {formData.avatarUrl ? (
                                    <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="h-10 w-10 text-primary" />
                                )}
                            </div>
                            <div className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-sm border border-stone-200">
                                <Camera className="h-3.5 w-3.5 text-stone-500" />
                            </div>
                        </div>
                        <h3 className="font-bold text-lg">{formData.fullName || "Admin"}</h3>
                        <p className="text-sm text-muted-foreground uppercase tracking-wider">{session?.user?.id?.split('-')[0]}</p>
                    </GlassCard>

                    <GlassCard className="p-4 space-y-4">
                        <div className="flex items-center gap-3 text-sm">
                            <Mail className="h-4 w-4 text-stone-400" />
                            <span className="text-stone-600 truncate">{session?.user?.email}</span>
                        </div>
                        {formData.phone && (
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="h-4 w-4 text-stone-400" />
                                <span className="text-stone-600">{formData.phone}</span>
                            </div>
                        )}
                    </GlassCard>
                </div>

                <div className="md:col-span-2">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <GlassCard className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-stone-100">
                                    <User className="h-4 w-4 text-primary" />
                                    <h4 className="font-semibold">Kişisel Bilgiler</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Ad Soyad</Label>
                                        <Input
                                            id="fullName"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Telefon</Label>
                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                            className="rounded-xl"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="avatarUrl">Avatar URL</Label>
                                    <Input
                                        id="avatarUrl"
                                        value={formData.avatarUrl}
                                        onChange={(e) => setFormData(prev => ({ ...prev, avatarUrl: e.target.value }))}
                                        className="rounded-xl"
                                        placeholder="https://example.com/photo.jpg"
                                    />
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-stone-100">
                                    <Lock className="h-4 w-4 text-primary" />
                                    <h4 className="font-semibold">Şifre Değiştir</h4>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                        value={formData.currentPassword}
                                        onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">Yeni Şifre</Label>
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            value={formData.newPassword}
                                            onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Şifre Onayı</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                            className="rounded-xl"
                                        />
                                    </div>
                                </div>
                            </div>
                        </GlassCard>

                        <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={saving} className="rounded-xl shadow-lg shadow-primary/20 min-w-[150px]">
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Kaydediliyor
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Profili Kaydet
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </PageContainer>
    )
}
