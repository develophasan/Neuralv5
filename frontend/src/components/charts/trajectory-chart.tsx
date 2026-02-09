"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, Area, ComposedChart
} from "recharts"
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Info } from "lucide-react"

interface TrajectoryData {
  date: string
  actual: number
  predicted?: number
  benchmark?: number
}

interface TrajectoryChartProps {
  data: TrajectoryData[]
  title?: string
  description?: string
  showPrediction?: boolean
  showBenchmark?: boolean
  domainName?: string
  domainColor?: string
}

// Traffic light color coding
const getTrafficLight = (score: number, benchmark: number = 3) => {
  const diff = score - benchmark
  if (diff >= 0.5) return { color: "text-emerald-600", bg: "bg-emerald-100", icon: CheckCircle, label: "Iyi" }
  if (diff >= -0.5) return { color: "text-amber-600", bg: "bg-amber-100", icon: Minus, label: "Ortalama" }
  return { color: "text-red-600", bg: "bg-red-100", icon: AlertTriangle, label: "Dikkat" }
}

// Calculate trend
const calculateTrend = (data: TrajectoryData[]) => {
  if (data.length < 2) return { direction: "stable", percentage: 0 }
  
  const recent = data.slice(-3)
  const older = data.slice(-6, -3)
  
  if (recent.length === 0 || older.length === 0) return { direction: "stable", percentage: 0 }
  
  const recentAvg = recent.reduce((sum, d) => sum + d.actual, 0) / recent.length
  const olderAvg = older.reduce((sum, d) => sum + d.actual, 0) / older.length
  
  const percentage = ((recentAvg - olderAvg) / olderAvg) * 100
  
  if (percentage > 5) return { direction: "up", percentage }
  if (percentage < -5) return { direction: "down", percentage }
  return { direction: "stable", percentage }
}

export function TrajectoryChart({
  data,
  title = "Gelisim Trendi",
  description = "Zaman icindeki performans degisimi",
  showPrediction = true,
  showBenchmark = true,
  domainName,
  domainColor = "#0F766E",
}: TrajectoryChartProps) {
  const trend = useMemo(() => calculateTrend(data), [data])
  const latestScore = data[data.length - 1]?.actual || 0
  const trafficLight = getTrafficLight(latestScore)
  
  // Format data for chart
  const chartData = useMemo(() => {
    return data.map(d => ({
      ...d,
      displayDate: new Date(d.date).toLocaleDateString('tr', { month: 'short', day: 'numeric' }),
    }))
  }, [data])

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null
    
    return (
      <div className="bg-white p-3 rounded-xl shadow-lg border border-stone-200">
        <p className="text-sm font-medium text-stone-800 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-stone-500">{entry.name}:</span>
            <span className="font-medium text-stone-800">{entry.value?.toFixed(1)}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-heading">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          
          {/* Traffic Light Indicator */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${trafficLight.bg}`}>
            <trafficLight.icon className={`h-4 w-4 ${trafficLight.color}`} />
            <span className={`text-sm font-medium ${trafficLight.color}`}>
              {trafficLight.label}
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-stone-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-stone-800">{latestScore.toFixed(1)}</p>
            <p className="text-xs text-stone-500">Son Puan</p>
          </div>
          
          <div className="bg-stone-50 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1">
              {trend.direction === "up" && <TrendingUp className="h-5 w-5 text-emerald-500" />}
              {trend.direction === "down" && <TrendingDown className="h-5 w-5 text-red-500" />}
              {trend.direction === "stable" && <Minus className="h-5 w-5 text-stone-400" />}
              <span className={`text-lg font-bold ${
                trend.direction === "up" ? "text-emerald-600" :
                trend.direction === "down" ? "text-red-600" : "text-stone-600"
              }`}>
                {Math.abs(trend.percentage).toFixed(0)}%
              </span>
            </div>
            <p className="text-xs text-stone-500">Degisim</p>
          </div>
          
          <div className="bg-stone-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-stone-800">{data.length}</p>
            <p className="text-xs text-stone-500">Olcum</p>
          </div>
        </div>
        
        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={domainColor} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={domainColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" vertical={false} />
              <XAxis 
                dataKey="displayDate" 
                tick={{ fontSize: 11, fill: '#78716C' }}
                axisLine={{ stroke: '#E7E5E4' }}
                tickLine={false}
              />
              <YAxis 
                domain={[0, 5]} 
                tick={{ fontSize: 11, fill: '#78716C' }}
                axisLine={false}
                tickLine={false}
                ticks={[0, 1, 2, 3, 4, 5]}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Benchmark line */}
              {showBenchmark && (
                <ReferenceLine 
                  y={3} 
                  stroke="#9CA3AF" 
                  strokeDasharray="5 5" 
                  label={{ value: "Beklenen", position: "right", fontSize: 10, fill: "#9CA3AF" }}
                />
              )}
              
              {/* Actual area */}
              <Area
                type="monotone"
                dataKey="actual"
                stroke={domainColor}
                fill="url(#actualGradient)"
                strokeWidth={0}
              />
              
              {/* Actual line */}
              <Line
                type="monotone"
                dataKey="actual"
                name="Gercek"
                stroke={domainColor}
                strokeWidth={3}
                dot={{ fill: domainColor, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: domainColor, strokeWidth: 2, fill: "white" }}
              />
              
              {/* Prediction line */}
              {showPrediction && (
                <Line
                  type="monotone"
                  dataKey="predicted"
                  name="Tahmin"
                  stroke="#9CA3AF"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "#9CA3AF", strokeWidth: 2, r: 3 }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: domainColor }} />
            <span className="text-stone-600">Gercek Deger</span>
          </div>
          {showPrediction && (
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-6 bg-stone-400" style={{ borderStyle: 'dashed' }} />
              <span className="text-stone-600">AI Tahmini</span>
            </div>
          )}
          {showBenchmark && (
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-6 bg-stone-300" />
              <span className="text-stone-600">Beklenen</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Activity Recommendations with Traffic Light
interface Recommendation {
  id: string
  title: string
  description: string
  domain: string
  domainName: string
  priority: "high" | "medium" | "low"
  estimatedImpact: number
}

interface ActivityRecommendationsProps {
  recommendations: Recommendation[]
  onSelect?: (recommendation: Recommendation) => void
}

export function ActivityRecommendations({ recommendations, onSelect }: ActivityRecommendationsProps) {
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "high": return { bg: "bg-red-50 border-red-200", dot: "bg-red-500", text: "text-red-700" }
      case "medium": return { bg: "bg-amber-50 border-amber-200", dot: "bg-amber-500", text: "text-amber-700" }
      case "low": return { bg: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-500", text: "text-emerald-700" }
      default: return { bg: "bg-stone-50 border-stone-200", dot: "bg-stone-500", text: "text-stone-700" }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-heading flex items-center gap-2">
          <Info className="h-5 w-5 text-brand-500" />
          AI Aktivite Onerileri
        </CardTitle>
        <CardDescription>
          Cocugunuzun gelisimi icin onerilen aktiviteler
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.length === 0 ? (
          <div className="text-center py-6 text-stone-500">
            <CheckCircle className="h-10 w-10 mx-auto mb-2 text-emerald-500" />
            <p>Harika! Tum alanlarda iyi performans.</p>
          </div>
        ) : (
          recommendations.map((rec) => {
            const style = getPriorityStyle(rec.priority)
            return (
              <div
                key={rec.id}
                className={`p-4 rounded-xl border-2 ${style.bg} cursor-pointer hover:shadow-md transition-all`}
                onClick={() => onSelect?.(rec)}
              >
                <div className="flex items-start gap-3">
                  <div className={`h-3 w-3 rounded-full mt-1.5 ${style.dot}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-stone-800">{rec.title}</h4>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${style.text} ${style.bg}`}>
                        {rec.priority === "high" ? "Oncelikli" : rec.priority === "medium" ? "Onerilen" : "Opsiyonel"}
                      </span>
                    </div>
                    <p className="text-sm text-stone-600 mt-1">{rec.description}</p>
                    <p className="text-xs text-stone-500 mt-2">{rec.domainName}</p>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
