"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label, Textarea } from "@/components/ui"
import { Send, Users, GraduationCap } from "lucide-react"
import { useAdminStudents } from "@/hooks/api/use-admin"

export default function AdminSendNotificationPage() {
  const [formData, setFormData] = useState({
    recipientType: "all", // "all" | "parent" | "student"
    studentId: "",
    type: "info",
    title: "",
    message: "",
    actionUrl: "",
  })
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)

  const { data: studentsData } = useAdminStudents({ page: 1, limit: 1000 })
  const students = studentsData?.data || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setSuccess(false)

    try {
      if (formData.recipientType === "all") {
        // Get all parents
        const parentsRes = await fetch("/napi/admin/users?role=parent&limit=1000")
        const parentsData = await parentsRes.json()
        const parents = parentsData?.data?.users || parentsData?.data || []

        await Promise.all(
          parents.map((parent: any) =>
            fetch("/napi/notifications", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                recipientId: parent.id,
                senderType: "admin",
                type: formData.type,
                title: formData.title,
                message: formData.message,
                actionUrl: formData.actionUrl || null,
              }),
            })
          )
        )
      } else if (formData.recipientType === "parent" && formData.studentId) {
        // Get parents of specific student
        const student = students.find((s: any) => s.id === formData.studentId)
        if (student?.parentStudents && student.parentStudents.length > 0) {
          await Promise.all(
            student.parentStudents.map((ps: any) =>
              fetch("/napi/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  recipientId: ps.parent?.id || ps.parentId,
                  studentId: formData.studentId,
                  senderType: "admin",
                  type: formData.type,
                  title: formData.title,
                  message: formData.message,
                  actionUrl: formData.actionUrl || null,
                }),
              })
            )
          )
        } else {
          alert("Bu öğrencinin velisi bulunamadı")
        }
      }

      setSuccess(true)
      setFormData({
        recipientType: "all",
        studentId: "",
        type: "info",
        title: "",
        message: "",
        actionUrl: "",
      })
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error("Error sending notification:", error)
      alert("Bildirim gönderilirken hata oluştu")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold mb-2 bg-gradient-to-r from-harmony-brain to-harmony-heart bg-clip-text text-transparent flex items-center gap-3">
            <Send className="h-8 w-8 text-harmony-brain" />
            Bildirim Gönder
          </h1>
          <p className="text-muted-foreground">Velilere bildirim mesajı gönderin</p>
        </div>

        <Card className="rounded-2xl shadow-harmony border-0 bg-gradient-to-br from-white to-harmony-soft/30">
          <CardHeader>
            <CardTitle>Yeni Bildirim</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label>Alıcı</Label>
                <select
                  value={formData.recipientType}
                  onChange={(e) =>
                    setFormData({ ...formData, recipientType: e.target.value, studentId: "" })
                  }
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">Tüm Veliler</option>
                  <option value="parent">Belirli Öğrencinin Velileri</option>
                </select>
              </div>

              {formData.recipientType === "parent" && (
                <div>
                  <Label>Öğrenci</Label>
                  <select
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Seçiniz...</option>
                    {students.map((student: any) => (
                      <option key={student.id} value={student.id}>
                        {student.firstName} {student.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <Label>Bildirim Tipi</Label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="info">Bilgi</option>
                  <option value="success">Başarı</option>
                  <option value="warning">Uyarı</option>
                  <option value="alert">Acil</option>
                </select>
              </div>

              <div>
                <Label>Başlık</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Bildirim başlığı"
                  required
                />
              </div>

              <div>
                <Label>Mesaj</Label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Bildirim mesajı"
                  rows={6}
                  required
                />
              </div>

              <div>
                <Label>Link (Opsiyonel)</Label>
                <Input
                  value={formData.actionUrl}
                  onChange={(e) => setFormData({ ...formData, actionUrl: e.target.value })}
                  placeholder="/parent/children/..."
                />
              </div>

              {success && (
                <div className="p-4 bg-neuro-green/10 text-neuro-green rounded-xl">
                  Bildirim başarıyla gönderildi!
                </div>
              )}

              <Button
                type="submit"
                disabled={sending}
                className="w-full rounded-xl bg-harmony-brain hover:bg-harmony-brain/90"
              >
                {sending ? "Gönderiliyor..." : "Bildirim Gönder"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

