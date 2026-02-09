"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button, Input, Label } from "@/components/ui"
import { User, Mail, Phone, Lock, Save, Loader2, Camera } from "lucide-react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

interface ProfileModalProps {
    isOpen: boolean
    onClose: () => void
    teacherId: string
}

export function ProfileModal({ isOpen, onClose, teacherId }: ProfileModalProps) {
    const { update } = useSession()
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
    })

    useEffect(() => {
        if (isOpen && teacherId) {
            fetchProfile()
        }
    }, [isOpen, teacherId])

    const fetchProfile = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/napi/teacher/profile?teacherId=${teacherId}`)
            const data = await res.json()
            if (data.success) {
                setFormData({
                    fullName: data.data.fullName,
                    email: data.data.email,
                    phone: data.data.phone || "",
                    password: "",
                })
            }
        } catch (error) {
            toast.error("Profil bilgileri alınamadı")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            const res = await fetch("/napi/teacher/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    teacherId,
                    ...formData,
                    password: formData.password || undefined,
                }),
            })
            const data = await res.json()
            if (data.success) {
                toast.success("Profil başarıyla güncellendi")
                await update({
                    name: data.data.fullName,
                    email: data.data.email,
                })
                onClose()
            } else {
                toast.error(data.error || "Güncelleme başarısız")
            }
        } catch (error) {
            toast.error("Bir hata oluştu")
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-0 shadow-2xl overflow-hidden p-0">
                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 text-white relative">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                            <User className="h-6 w-6" />
                            Profil Düzenle
                        </DialogTitle>
                        <p className="text-indigo-100/80 text-sm mt-1">Kişisel bilgilerinizi buradan güncelleyebilirsiniz.</p>
                    </DialogHeader>
                    <div className="absolute -right-6 -bottom-6 opacity-10">
                        <User className="h-32 w-32" />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                            <p className="text-slate-500 font-medium">Bilgileriniz getiriliyor...</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName" className="text-slate-700 font-bold ml-1">Ad Soyad</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="fullName"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            placeholder="Ad Soyad"
                                            className="pl-10 h-12 bg-slate-50 border-slate-100 rounded-xl focus:ring-indigo-500/10 focus:border-indigo-500 font-medium"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-slate-700 font-bold ml-1">E-posta</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="E-posta"
                                            className="pl-10 h-12 bg-slate-50 border-slate-100 rounded-xl focus:ring-indigo-500/10 focus:border-indigo-500 font-medium"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-slate-700 font-bold ml-1">Telefon</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="Örn: 05xx xxx xx xx"
                                            className="pl-10 h-12 bg-slate-50 border-slate-100 rounded-xl focus:ring-indigo-500/10 focus:border-indigo-500 font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2 border-t border-slate-50">
                                    <Label htmlFor="password" title="Boş bırakırsanız şifreniz değişmez" className="text-slate-700 font-bold ml-1 flex items-center gap-2">
                                        Yeni Şifre
                                        <span className="text-[10px] font-medium text-slate-400 font-normal">(Opsiyonel)</span>
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="Değiştirmek istemiyorsanız boş bırakın"
                                            className="pl-10 h-12 bg-slate-50 border-slate-100 rounded-xl focus:ring-indigo-500/10 focus:border-indigo-500 font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="ghost" onClick={onClose} className="flex-1 h-12 rounded-xl font-bold">İptal</Button>
                                <Button type="submit" disabled={saving} className="flex-1 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-200">
                                    {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-5 w-5 mr-2" /> Kaydet</>}
                                </Button>
                            </div>
                        </>
                    )}
                </form>
            </DialogContent>
        </Dialog>
    )
}
