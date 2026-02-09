"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from "@/components/ui"
import { Calendar, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ParentCalendarPage() {
  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-8">
          <Link href="/parent/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">Takvim</h1>
          <p className="text-muted-foreground">
            Çocuğunuzun aktiviteleri ve etkinlikleri
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Takvim özellikleri yakında eklenecek.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

