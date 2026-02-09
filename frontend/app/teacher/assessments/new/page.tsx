"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { AssessmentForm } from "@/components/teacher/assessment-form"
import { useRouter } from "next/navigation"
import { useTeacherId, useTeacherClasses } from "@/hooks/api/use-teacher"

export default function NewAssessmentPage() {
  const router = useRouter()
  const { data: teacherId, isLoading: teacherIdLoading } = useTeacherId()
  const { data: classes = [], isLoading: classesLoading } = useTeacherClasses(teacherId || null)
  const [students, setStudents] = useState<any[]>([])
  const [domains, setDomains] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!teacherId) return
      
      try {
        // Fetch students ONLY from teacher's classes
        const studentsRes = await fetch(`/napi/teacher/students?teacherId=${teacherId}`)
        const studentsData = await studentsRes.json()
        setStudents(studentsData.data || studentsData || [])

        // Fetch domains
        const domainsRes = await fetch('/napi/domains')
        const domainsData = await domainsRes.json()
        setDomains(domainsData.data || domainsData || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (teacherId) {
      fetchData()
    }
  }, [teacherId])

  if (teacherIdLoading || loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-harmony-soft via-white to-harmony-soft/50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/teacher/assessments">
            <Button variant="outline" size="sm" className="rounded-xl">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Geri
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Yeni Değerlendirme</h1>
            <p className="text-muted-foreground">
              10 gelişim alanında öğrenci değerlendirmesi yapın
            </p>
          </div>
        </div>

        {/* Assessment Form */}
        <AssessmentForm
          students={students}
          domains={domains}
          onSuccess={() => router.push('/teacher/assessments')}
        />
      </div>
    </div>
  )
}
