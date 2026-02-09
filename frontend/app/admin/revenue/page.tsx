"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import {
  Users,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

export default function AdminRevenuePage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/napi/admin/revenue")
      .then((res) => res.json())
      .then((data) => {
        setData(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen p-8">
        <p className="text-red-500">Veri yüklenemedi.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold mb-2">Gelir Analitiği</h1>
          <p className="text-muted-foreground">Öğrenci metrikleri ve trendler</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="rounded-2xl shadow-harmony">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Öğrenci</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">{data.metrics.totalStudents}</div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-harmony">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Retention %</CardTitle>
              <TrendingUp className="h-4 w-4 text-neuro-green" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-neuro-green">
                {data.metrics.retentionRate.toFixed(1)}%
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-harmony">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Churn %</CardTitle>
              <TrendingDown className="h-4 w-4 text-risk-red" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-risk-red">
                {data.metrics.churnRate.toFixed(1)}%
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-harmony">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Büyüme %</CardTitle>
              <BarChart3 className="h-4 w-4 text-harmony-brain" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-harmony-brain">
                {data.metrics.growthRate.toFixed(1)}%
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-harmony">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ort. Kalış (gün)</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">
                {data.metrics.avgStayDuration}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trends Chart */}
        <Card className="rounded-2xl shadow-harmony">
          <CardHeader>
            <CardTitle>Aylık Büyüme Trendi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#0F766E"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

