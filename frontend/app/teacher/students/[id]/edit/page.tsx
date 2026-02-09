"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label } from "@/components/ui"
import { ArrowLeft, User, Phone, MapPin, Heart, AlertTriangle, Save, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

export default function EditStudentPage() {
  const params = useParams()
  const router = useRouter()
  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [formData, setFormData] = useState({
    // Temel Bilgiler
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    
    // Kimlik
    tcNo: "",
    birthPlace: "",
    nationality: "TC",
    
    // Adres
    address: "",
    city: "",
    district: "",
    postalCode: "",
    
    // Anne
    motherName: "",
    motherPhone: "",
    motherEmail: "",
    motherJob: "",
    motherTcNo: "",
    
    // Baba
    fatherName: "",
    fatherPhone: "",
    fatherEmail: "",
    fatherJob: "",
    fatherTcNo: "",
    
    // Acil Durum
    emergencyContact: "",
    emergencyPhone: "",
    emergencyRelation: "",
    
    // Sağlık
    bloodType: "",
    allergies: "",
    chronicDiseases: "",
    medications: "",
    doctorName: "",
    doctorPhone: "",
    
    // Notlar
    registrationNotes: "",
  })

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await fetch(`/napi/admin/students/${params.id}`)
        const data = await res.json()
        const studentData = data.data || data
        setStudent(studentData)
        
        setFormData({
          firstName: studentData.firstName || "",
          lastName: studentData.lastName || "",
          dateOfBirth: studentData.dateOfBirth ? new Date(studentData.dateOfBirth).toISOString().split('T')[0] : "",
          gender: studentData.gender || "",
          tcNo: studentData.tcNo || "",
          birthPlace: studentData.birthPlace || "",
          nationality: studentData.nationality || "TC",
          address: studentData.address || "",
          city: studentData.city || "",
          district: studentData.district || "",
          postalCode: studentData.postalCode || "",
          motherName: studentData.motherName || "",
          motherPhone: studentData.motherPhone || "",
          motherEmail: studentData.motherEmail || "",
          motherJob: studentData.motherJob || "",
          motherTcNo: studentData.motherTcNo || "",
          fatherName: studentData.fatherName || "",
          fatherPhone: studentData.fatherPhone || "",
          fatherEmail: studentData.fatherEmail || "",
          fatherJob: studentData.fatherJob || "",
          fatherTcNo: studentData.fatherTcNo || "",
          emergencyContact: studentData.emergencyContact || "",
          emergencyPhone: studentData.emergencyPhone || "",
          emergencyRelation: studentData.emergencyRelation || "",
          bloodType: studentData.bloodType || "",
          allergies: studentData.allergies || "",
          chronicDiseases: studentData.chronicDiseases || "",
          medications: studentData.medications || "",
          doctorName: studentData.doctorName || "",
          doctorPhone: studentData.doctorPhone || "",
          registrationNotes: studentData.registrationNotes || "",
        })
      } catch (error) {
        console.error('Error fetching student:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchStudent()
    }
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)

    try {
      const res = await fetch(`/napi/admin/students/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          isFullRegistration: true,
        }),
      })

      if (!res.ok) throw new Error('Failed to update student')

      setSaved(true)
      setTimeout(() => {
        router.back()
      }, 1500)
    } catch (error) {
      console.error('Error updating student:', error)
      alert('Kayit sirasinda hata olustu')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yukleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Ogrenci Kayit Bilgileri</h1>
            <p className="text-muted-foreground">
              {student?.firstName} {student?.lastName} - Detayli bilgileri doldurun
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Temel Bilgiler */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" />
                Temel Bilgiler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Ad *</Label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Soyad *</Label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Dogum Tarihi *</Label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Cinsiyet</Label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Seciniz</option>
                    <option value="male">Erkek</option>
                    <option value="female">Kiz</option>
                  </select>
                </div>
                <div>
                  <Label>TC Kimlik No</Label>
                  <Input
                    value={formData.tcNo}
                    onChange={(e) => setFormData({ ...formData, tcNo: e.target.value })}
                    maxLength={11}
                    placeholder="11 haneli TC No"
                  />
                </div>
                <div>
                  <Label>Dogum Yeri</Label>
                  <Input
                    value={formData.birthPlace}
                    onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Adres Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-500" />
                Adres Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Adres</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Sokak, Mahalle, Bina No, Daire No"
                  />
                </div>
                <div>
                  <Label>Il</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Ilce</Label>
                  <Input
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Anne Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-500" />
                Anne Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Anne Adi Soyadi</Label>
                  <Input
                    value={formData.motherName}
                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Anne TC No</Label>
                  <Input
                    value={formData.motherTcNo}
                    onChange={(e) => setFormData({ ...formData, motherTcNo: e.target.value })}
                    maxLength={11}
                  />
                </div>
                <div>
                  <Label>Anne Telefon</Label>
                  <Input
                    value={formData.motherPhone}
                    onChange={(e) => setFormData({ ...formData, motherPhone: e.target.value })}
                    placeholder="05XX XXX XX XX"
                  />
                </div>
                <div>
                  <Label>Anne Email</Label>
                  <Input
                    type="email"
                    value={formData.motherEmail}
                    onChange={(e) => setFormData({ ...formData, motherEmail: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Anne Meslek</Label>
                  <Input
                    value={formData.motherJob}
                    onChange={(e) => setFormData({ ...formData, motherJob: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Baba Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" />
                Baba Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Baba Adi Soyadi</Label>
                  <Input
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Baba TC No</Label>
                  <Input
                    value={formData.fatherTcNo}
                    onChange={(e) => setFormData({ ...formData, fatherTcNo: e.target.value })}
                    maxLength={11}
                  />
                </div>
                <div>
                  <Label>Baba Telefon</Label>
                  <Input
                    value={formData.fatherPhone}
                    onChange={(e) => setFormData({ ...formData, fatherPhone: e.target.value })}
                    placeholder="05XX XXX XX XX"
                  />
                </div>
                <div>
                  <Label>Baba Email</Label>
                  <Input
                    type="email"
                    value={formData.fatherEmail}
                    onChange={(e) => setFormData({ ...formData, fatherEmail: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Baba Meslek</Label>
                  <Input
                    value={formData.fatherJob}
                    onChange={(e) => setFormData({ ...formData, fatherJob: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acil Durum */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Acil Durum Iletisim
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Iletisim Kisisi</Label>
                  <Input
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Iletisim Telefonu</Label>
                  <Input
                    value={formData.emergencyPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Yakinlik Derecesi</Label>
                  <Input
                    value={formData.emergencyRelation}
                    onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
                    placeholder="Teyze, Amca, Dede vb."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sağlık Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Saglik Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Kan Grubu</Label>
                  <select
                    value={formData.bloodType}
                    onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Seciniz</option>
                    <option value="A+">A Rh+</option>
                    <option value="A-">A Rh-</option>
                    <option value="B+">B Rh+</option>
                    <option value="B-">B Rh-</option>
                    <option value="AB+">AB Rh+</option>
                    <option value="AB-">AB Rh-</option>
                    <option value="0+">0 Rh+</option>
                    <option value="0-">0 Rh-</option>
                  </select>
                </div>
                <div>
                  <Label>Doktor Adi</Label>
                  <Input
                    value={formData.doctorName}
                    onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Doktor Telefonu</Label>
                  <Input
                    value={formData.doctorPhone}
                    onChange={(e) => setFormData({ ...formData, doctorPhone: e.target.value })}
                  />
                </div>
                <div className="md:col-span-3">
                  <Label>Alerjiler</Label>
                  <Input
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    placeholder="Varsa belirtiniz (Findik, Sut, Polen vb.)"
                  />
                </div>
                <div className="md:col-span-3">
                  <Label>Kronik Hastaliklar</Label>
                  <Input
                    value={formData.chronicDiseases}
                    onChange={(e) => setFormData({ ...formData, chronicDiseases: e.target.value })}
                    placeholder="Varsa belirtiniz"
                  />
                </div>
                <div className="md:col-span-3">
                  <Label>Kullandigi Ilaclar</Label>
                  <Input
                    value={formData.medications}
                    onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                    placeholder="Varsa belirtiniz"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notlar */}
          <Card>
            <CardHeader>
              <CardTitle>Ek Notlar</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={formData.registrationNotes}
                onChange={(e) => setFormData({ ...formData, registrationNotes: e.target.value })}
                placeholder="Ogrenci hakkinda ek notlar..."
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex items-center justify-end gap-4">
            {saved && (
              <span className="text-green-600 flex items-center gap-1">
                <CheckCircle2 className="h-5 w-5" />
                Kaydedildi!
              </span>
            )}
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Iptal
            </Button>
            <Button type="submit" disabled={saving} size="lg">
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Kaydet
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
