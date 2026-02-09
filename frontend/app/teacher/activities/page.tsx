"use client"
export const dynamic = "force-dynamic"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from "@/components/ui"
import { Activity, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useTeacherId, useTeacherActivities } from "@/hooks/api/use-teacher"
import { Suspense } from "react"

function ActivitiesContent() {
  const { data: teacherId, isLoading: teacherIdLoading } = useTeacherId()
  const searchParams = useSearchParams()
  const studentId = searchParams.get('studentId')
  const { data: activities = [], isLoading: activitiesLoading } = useTeacherActivities(teacherId || null, studentId || null)

  const loading = teacherIdLoading || activitiesLoading

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
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight">AI Aktivite Onerileri</h1>
            <p className="text-muted-foreground">Ogrenciler icin onerilen aktiviteler</p>
          </div>
        </div>

        {activities.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Henuz aktivite onerisi yok</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {activities.map((activity: any) => (
              <Card key={activity.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{activity.activity?.title || activity.title}</CardTitle>
                  <CardDescription>
                    {activity.student?.firstName} {activity.student?.lastName} - {activity.domain?.nameTr}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activity.reason && (
                    <p className="text-sm mb-3 text-muted-foreground">
                      <strong>Oneri Nedeni:</strong> {activity.reason}
                    </p>
                  )}
                  {activity.description && (
                    <p className="text-sm mb-4">{activity.description}</p>
                  )}
                  <Link href={`/teacher/students/${activity.student?.id}`}>
                    <Button variant="outline" size="sm">
                      Ogrenci Detayi
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function TeacherActivitiesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Yukleniyor...</div>}>
      <ActivitiesContent />
    </Suspense>
  )
}
