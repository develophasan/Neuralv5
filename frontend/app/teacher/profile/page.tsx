"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label, Skeleton } from "@/components/ui"
import { User, Mail, Phone, Lock, Camera, Save, Loader2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { motion } from "framer-motion"

export default function TeacherProfilePage() {
    const { data: session, update: updateSession } = useSession()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
    })

    useEffect(() => {
        if (session?.user?.id) {
            fetchProfile(session.user.id)
        }
    }, [session?.user?.id])

    const fetchProfile = async (teacherId: string) => {
        setLoading(true)
        try {
            const res = await fetch(`/napi/teacher/profile?teacherId=${teacherId}`)
            const data = await res.json()
            if (data.success) {
                setFormData({
                    fullName: data.data.fullName || "",
                    email: data.data.email || "",
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
                    teacherId: session?.user?.id,
                    ...formData,
                    password: formData.password || undefined,
                }),
            })
            const data = await res.json()
            if (data.success) {
                toast.success("Profil başarıyla güncellendi")
                await updateSession({
                    name: formData.fullName,
                    email: formData.email,
                    image: data.data.avatarUrl,
                })
                setFormData(prev => ({ ...prev, password: "" }))
            } else {
                toast.error(data.error || "Güncelleme başarısız")
            }
        } catch (error) {
            toast.error("Bir hata oluştu")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-4">
            <div className="flex items-center gap-4 mb-2">
                <Link href="/teacher/dashboard">
                    <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm border border-slate-100">
                        <ArrowLeft className="h-5 w-5 text-slate-600" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-heading font-black text-slate-900">Profil Ayarları</h1>
                    <p className="text-slate-500 font-medium">Kişisel bilgilerinizi ve hesap ayarlarınızı buradan yönetin.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Side: Avatar/Summary */}
                <div className="md:col-span-1 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-8 text-center"
                    >
                        <div className="relative mx-auto w-32 h-32 mb-6">
                            <div className="w-full h-full rounded-3xl bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center overflow-hidden border-2 border-slate-50 shadow-inner">
                                {session?.user?.image ? (
                                    <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="h-14 w-14 text-indigo-300" />
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 p-2.5 bg-indigo-600 rounded-2xl shadow-lg border-2 border-white text-white">
                                <Camera className="h-4 w-4" />
                            </div>
                        </div>
                        <h3 className="font-black text-xl text-slate-900">{formData.fullName}</h3>
                        <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest mt-1">Öğretmen</p>

                        <div className="mt-8 pt-8 border-t border-slate-50 space-y-4">
                            <div className="flex items-center gap-3 text-slate-600 group">
                                <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                    <Mail className="h-4 w-4 text-slate-400 group-hover:text-indigo-500" />
                                </div>
                                <span className="text-sm font-medium truncate">{formData.email}</span>
                            </div>
                            {formData.phone && (
                                <div className="flex items-center gap-3 text-slate-600 group">
                                    <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                        <Phone className="h-4 w-4 text-slate-400 group-hover:text-indigo-500" />
                                    </div>
                                    <span className="text-sm font-medium">{formData.phone}</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Right Side: Form */}
                <div className="md:col-span-2 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden"
                    >
                        <form onSubmit={handleSubmit}>
                            <div className="p-8 space-y-8">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 pb-2 border-b border-slate-50">
                                        <User className="h-5 w-5 text-indigo-600" />
                                        <h4 className="font-black text-slate-800">Temel Bilgiler</h4>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="fullName" className="text-slate-700 font-bold ml-1">Ad Soyad</Label>
                                            <Input
                                                id="fullName"
                                                value={formData.fullName}
                                                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                                                className="h-12 bg-slate-50 border-slate-100 rounded-xl focus:ring-indigo-500/10 focus:border-indigo-500 font-medium"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="text-slate-700 font-bold ml-1">Telefon</Label>
                                            <Input
                                                id="phone"
                                                value={formData.phone}
                                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                                className="h-12 bg-slate-50 border-slate-100 rounded-xl focus:ring-indigo-500/10 focus:border-indigo-500 font-medium"
                                                placeholder="05xx xxx xx xx"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-slate-700 font-bold ml-1">E-posta Adresi</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                            className="h-12 bg-slate-50 border-slate-100 rounded-xl focus:ring-indigo-500/10 focus:border-indigo-500 font-medium"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6 pt-4">
                                    <div className="flex items-center gap-3 pb-2 border-b border-slate-50">
                                        <Lock className="h-5 w-5 text-amber-500" />
                                        <h4 className="font-black text-slate-800">Güvenlik Ayarları</h4>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password" title="Boş bırakırsanız şifreniz değişmez" className="text-slate-700 font-bold ml-1 flex items-center gap-2">
                                            Yeni Şifre
                                            <span className="text-[10px] font-medium text-slate-400 font-normal">(Opsiyonel - Değiştirmek istemiyorsanız boş bırakın)</span>
                                        </Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                            placeholder="••••••••"
                                            className="h-12 bg-slate-50 border-slate-100 rounded-xl focus:ring-indigo-500/10 focus:border-indigo-500 font-medium font-mono"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Kaydediliyor...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-5 w-5" />
                                            Değişiklikleri Kaydet
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
