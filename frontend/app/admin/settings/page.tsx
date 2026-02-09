"use client"

import { useState, useEffect } from "react"
import { PageContainer } from "@/components/layout/page-container"
import { GlassCard } from "@/components/ui/glass-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label } from "@/components/ui"
import { School, Image as ImageIcon, Palette, Mail, Phone, MapPin, Save, Loader2, RefreshCcw } from "lucide-react"
import { toast } from "sonner"
import { THEME_PALETTES } from "@/lib/theme/palettes"

export default function SchoolSettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        logoUrl: "",
        primaryColor: "#3b82f6",
        secondaryColor: "#64748b",
        sidebarBg: "#0c1221",
        sidebarBorder: "#1e293b",
        pageBg: "#f8fafc",
        textPrimary: "#1e293b",
        textSidebar: "#94a3b8",
        themePalette: "default",
        address: "",
        phone: "",
        email: "",
    })

    useEffect(() => {
        fetch("/napi/admin/school-settings")
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setFormData({
                        name: data.data.name || "Harmoni OS",
                        logoUrl: data.data.logoUrl || "",
                        primaryColor: data.data.primaryColor || "#3b82f6",
                        secondaryColor: data.data.secondaryColor || "#64748b",
                        sidebarBg: data.data.sidebarBg || "#0c1221",
                        sidebarBorder: data.data.sidebarBorder || "#1e293b",
                        pageBg: data.data.pageBg || "#f8fafc",
                        textPrimary: data.data.textPrimary || "#1e293b",
                        textSidebar: data.data.textSidebar || "#94a3b8",
                        themePalette: data.data.themePalette || "default",
                        address: data.data.address || "",
                        phone: data.data.phone || "",
                        email: data.data.email || "",
                    })
                }
                setLoading(false)
            })
            .catch((err) => {
                console.error("Settings fetch error:", err)
                setLoading(false)
            })
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const res = await fetch("/napi/admin/school-settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            const data = await res.json()
            if (data.success) {
                toast.success("Ayarlar başarıyla kaydedildi")
                // Yenilemek gerekebilir çünkü layout'taki logo/isim değişecek
                window.location.reload()
            } else {
                toast.error(data.error || "Hata oluştu")
            }
        } catch (err) {
            toast.error("İşlem başarısız oldu")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <PageContainer title="Okul Ayarları" description="Yükleniyor...">
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </PageContainer>
        )
    }

    return (
        <PageContainer title="Okul Ayarları" description="Kurum kimliği ve genel ayarları yönetin">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-4" autoComplete="off">
                {/* Branding Section */}
                <GlassCard className="p-5">
                    <div className="flex items-center gap-2 mb-3 text-primary">
                        <School className="h-5 w-5" />
                        <h3 className="font-bold text-lg">Kurumsal Kimlik</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Okul Adı</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Okulun resmi adını girin"
                                    className="rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="logoUrl">Logo URL</Label>
                                <Input
                                    id="logoUrl"
                                    value={formData.logoUrl}
                                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                                    placeholder="https://example.com/logo.png"
                                    className="rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-stone-100 rounded-2xl bg-stone-50/50">
                            {formData.logoUrl ? (
                                <img src={formData.logoUrl} alt="Preview" className="max-h-24 object-contain mb-2" />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center mb-2">
                                    <ImageIcon className="h-8 w-8 text-stone-300" />
                                </div>
                            )}
                            <p className="text-xs text-muted-foreground">Logo Önizleme</p>
                        </div>
                    </div>
                </GlassCard>

                {/* Theme Section */}
                <GlassCard className="p-5">
                    <div className="flex items-center gap-2 mb-3 text-primary">
                        <Palette className="h-5 w-5" />
                        <h3 className="font-bold text-lg">Tema ve Renkler</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <Label className="text-xs uppercase font-bold text-stone-400">Hazır Renk Paletleri</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {Object.values(THEME_PALETTES).map((palette) => (
                                        <button
                                            key={palette.name}
                                            type="button"
                                            onClick={() => setFormData({
                                                ...formData,
                                                themePalette: palette.name,
                                                primaryColor: palette.primary,
                                                secondaryColor: palette.secondary,
                                                sidebarBg: palette.sidebarBg,
                                                sidebarBorder: palette.sidebarBorder,
                                                pageBg: palette.pageBg,
                                                textPrimary: palette.textPrimary,
                                                textSidebar: palette.textSidebar,
                                            })}
                                            className={`p-3 rounded-2xl border-2 transition-all flex flex-col gap-2 items-center hover:scale-[1.02] ${formData.themePalette === palette.name ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' : 'border-stone-100 bg-white hover:border-stone-200'
                                                }`}
                                        >
                                            <div className="flex -space-x-1">
                                                <div className="h-4 w-4 rounded-full ring-2 ring-white z-20" style={{ backgroundColor: palette.primary }} />
                                                <div className="h-4 w-4 rounded-full ring-2 ring-white z-10" style={{ backgroundColor: palette.sidebarBg }} />
                                                <div className="h-4 w-4 rounded-full ring-2 ring-white z-0" style={{ backgroundColor: palette.pageBg }} />
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-tighter whitespace-nowrap">{palette.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-stone-100">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold text-stone-400">Ana Renk</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="color"
                                            value={formData.primaryColor}
                                            onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value, themePalette: 'custom' })}
                                            className="w-10 h-10 p-1 rounded-lg cursor-pointer shrink-0"
                                        />
                                        <Input
                                            value={formData.primaryColor}
                                            onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value, themePalette: 'custom' })}
                                            className="flex-1 rounded-xl text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold text-stone-400">İkincil Renk</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="color"
                                            value={formData.secondaryColor}
                                            onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value, themePalette: 'custom' })}
                                            className="w-10 h-10 p-1 rounded-lg cursor-pointer shrink-0"
                                        />
                                        <Input
                                            value={formData.secondaryColor}
                                            onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value, themePalette: 'custom' })}
                                            className="flex-1 rounded-xl text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold text-stone-400">Sidebar Arkaplan</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="color"
                                            value={formData.sidebarBg}
                                            onChange={(e) => setFormData({ ...formData, sidebarBg: e.target.value, themePalette: 'custom' })}
                                            className="w-10 h-10 p-1 rounded-lg cursor-pointer shrink-0"
                                        />
                                        <Input
                                            value={formData.sidebarBg}
                                            onChange={(e) => setFormData({ ...formData, sidebarBg: e.target.value, themePalette: 'custom' })}
                                            className="flex-1 rounded-xl text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold text-stone-400">Sidebar Metin</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="color"
                                            value={formData.textSidebar}
                                            onChange={(e) => setFormData({ ...formData, textSidebar: e.target.value, themePalette: 'custom' })}
                                            className="w-10 h-10 p-1 rounded-lg cursor-pointer shrink-0"
                                        />
                                        <Input
                                            value={formData.textSidebar}
                                            onChange={(e) => setFormData({ ...formData, textSidebar: e.target.value, themePalette: 'custom' })}
                                            className="flex-1 rounded-xl text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold text-stone-400">Sayfa Arkaplan</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="color"
                                            value={formData.pageBg}
                                            onChange={(e) => setFormData({ ...formData, pageBg: e.target.value, themePalette: 'custom' })}
                                            className="w-10 h-10 p-1 rounded-lg cursor-pointer shrink-0"
                                        />
                                        <Input
                                            value={formData.pageBg}
                                            onChange={(e) => setFormData({ ...formData, pageBg: e.target.value, themePalette: 'custom' })}
                                            className="flex-1 rounded-xl text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold text-stone-400">Genel Metin</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="color"
                                            value={formData.textPrimary}
                                            onChange={(e) => setFormData({ ...formData, textPrimary: e.target.value, themePalette: 'custom' })}
                                            className="w-10 h-10 p-1 rounded-lg cursor-pointer shrink-0"
                                        />
                                        <Input
                                            value={formData.textPrimary}
                                            onChange={(e) => setFormData({ ...formData, textPrimary: e.target.value, themePalette: 'custom' })}
                                            className="flex-1 rounded-xl text-xs"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-xs font-bold text-stone-400 uppercase">Tema Önizleme</Label>
                            <div
                                className="border border-stone-200 rounded-3xl overflow-hidden shadow-2xl scale-95 origin-top transition-all duration-500"
                                style={{ backgroundColor: formData.pageBg }}
                            >
                                {/* Mini Sidebar & Content Preview */}
                                <div className="flex h-64">
                                    <div className="w-16 flex flex-col p-2 gap-2" style={{ backgroundColor: formData.sidebarBg, borderRight: `1px solid ${formData.sidebarBorder || '#eeeeee'}` }}>
                                        <div className="w-8 h-8 rounded-lg bg-white/20" />
                                        <div className="w-full h-2 rounded bg-white/10" />
                                        <div className="w-full h-2 rounded bg-white/10" />
                                        <div className="w-full h-2 rounded bg-white/10" />
                                        <div className="mt-auto w-full h-2 rounded bg-white/20" />
                                    </div>
                                    <div className="flex-1 p-4 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="h-4 w-24 rounded bg-stone-200" />
                                            <div className="h-6 w-6 rounded-full bg-stone-200" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-8 w-48 rounded bg-stone-800" style={{ backgroundColor: formData.textPrimary }} />
                                            <div className="h-3 w-full rounded bg-stone-100" />
                                            <div className="h-3 w-4/5 rounded bg-stone-100" />
                                        </div>

                                        <div className="pt-4 flex gap-2">
                                            <Button size="sm" style={{ backgroundColor: formData.primaryColor }} className="text-[10px] h-8 px-4 rounded-full border-none">
                                                Ana Buton
                                            </Button>
                                            <Button size="sm" variant="outline" style={{ borderColor: formData.secondaryColor, color: formData.secondaryColor }} className="text-[10px] h-8 px-4 rounded-full bg-transparent">
                                                İkincil
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mt-4">
                                            <div className="h-16 rounded-2xl bg-white border border-stone-100 shadow-sm" />
                                            <div className="h-16 rounded-2xl bg-white border border-stone-100 shadow-sm" />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 bg-white/50 backdrop-blur-sm text-[8px] text-center border-t border-stone-100" style={{ color: formData.textPrimary }}>
                                    * Ayarları kaydettiğinizde tüm paneller bu renklerle güncellenecektir.
                                </div>
                            </div>
                        </div>
                    </div>
                </GlassCard>

                {/* Contact info */}
                <GlassCard className="p-5">
                    <div className="flex items-center gap-2 mb-3 text-primary">
                        <MapPin className="h-5 w-5" />
                        <h3 className="font-bold text-lg">İletişim Bilgileri</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="email">E-posta</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="info@okulunuz.com"
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Telefon</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+90 212 ..."
                                className="rounded-xl"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="address">Adres</Label>
                            <Input
                                id="address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Tam adres..."
                                className="rounded-xl"
                            />
                        </div>
                    </div>
                </GlassCard>

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" className="rounded-xl" onClick={() => window.location.reload()}>
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        İptal
                    </Button>
                    <Button type="submit" disabled={saving} className="rounded-xl px-8 shadow-lg shadow-primary/20">
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Kaydediliyor
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Ayarları Kaydet
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </PageContainer>
    )
}
