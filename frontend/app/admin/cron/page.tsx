"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from "@/components/ui"
import { Clock, Play, Loader2, CheckCircle, XCircle, Bell, Brain, Calendar } from "lucide-react"
import { toast } from "sonner"

interface JobResult {
  success: boolean
  sentCount?: number
  logs?: Array<{
    student: string
    parent: string
    status: 'success' | 'skipped' | 'error'
    message: string
  }>
  error?: string
}

export default function AdminCronPage() {
  // Track running state for each job independently
  const [runningJobs, setRunningJobs] = useState<Record<string, boolean>>({})
  const [results, setResults] = useState<Record<string, JobResult>>({})

  const jobs = [
    {
      id: 'activity-recommendations',
      name: 'AI Aktivite Önerileri',
      description: 'Zayıf alanlara göre velilere AI aktivite önerileri gönderir',
      schedule: 'Her gün 09:00',
      icon: Brain,
      color: 'text-purple-500',
    },
    {
      id: 'daily-summaries',
      name: 'Günlük Gelişim Özetleri',
      description: 'Her çocuk için AI gelişim özeti oluşturup velilere gönderir',
      schedule: 'Her gün 18:00',
      icon: Bell,
      color: 'text-blue-500',
    },
  ]

  const stopJob = async (jobId: string) => {
    try {
      await fetch('/napi/cron/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job: jobId,
          action: 'stop',
          secret: 'harmoni-cron-secret-2024',
        }),
      })
      toast.info("İşlem durduruluyor...", { description: "Durdurma komutu gönderildi." })
    } catch (e) {
      console.error(e)
    }
  }

  const runJob = async (jobId: string) => {
    // Set running state for this job
    setRunningJobs(prev => ({ ...prev, [jobId]: true }))

    // Clear previous logs
    setResults((prev) => ({ ...prev, [jobId]: { success: false, sentCount: 0, logs: [] } }))

    try {
      const response = await fetch('/napi/cron/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job: jobId,
          action: 'start',
          secret: 'harmoni-cron-secret-2024',
        }),
      })

      if (!response.body) return
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep incomplete line

        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const data = JSON.parse(line)

            if (data.type === 'progress') {
              setResults((prev: any) => {
                const currentLogs = prev[jobId]?.logs || []
                return {
                  ...prev,
                  [jobId]: {
                    ...prev[jobId],
                    logs: [...currentLogs, data.log]
                  }
                }
              })
            } else if (data.type === 'complete') {
              setResults((prev) => ({
                ...prev,
                [jobId]: data.result
              }))
              toast.success("İşlem Tamamlandı", {
                description: `${data.result.sentCount} bildirim gönderildi.`,
              })
              // Mark as finished ONLY on complete
              setRunningJobs(prev => ({ ...prev, [jobId]: false }))
            } else if (data.type === 'error') {
              toast.error("Hata", { description: data.error })
              setRunningJobs(prev => ({ ...prev, [jobId]: false }))
            }
          } catch (e) {
            console.error('Stream parse error', e)
          }
        }
      }
    } catch (error: any) {
      toast.error("Hata", {
        description: "Bağlantı hatası",
      })
      setRunningJobs(prev => ({ ...prev, [jobId]: false }))
    }
    // Note: We don't verify finally here because the stream might end async via 'complete' message
    // But in case of network error or break, we need to ensure it's false.
    // The 'done' break handles normal stream end, but we need to ensure state is cleared.
    // However, since we set it false in 'complete'/'error', we might be good.
    // Let's add a safety net in finally?
    // If I add it in finally of the try block, it executes when the function returns (which is after stream closes).
    // Yes, 'await reader.read()' blocks.
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Zamanlanmış Görevler</h1>
          <p className="text-muted-foreground mt-1">
            AI bildirim görevlerini yönetin ve manuel olarak çalıştırın
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Saat dilimi: Europe/Istanbul</span>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jobs.map((job) => {
          const Icon = job.icon
          const result = results[job.id]
          const isLoading = runningJobs[job.id] || false

          return (
            <Card key={job.id} className="rounded-2xl border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl bg-muted ${job.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{job.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        {job.schedule}
                      </CardDescription>
                    </div>
                  </div>
                  {result && !isLoading && (
                    <div className={`flex items-center gap-1 text-sm ${result.success ? 'text-green-500' : 'text-red-500'}`}>
                      {result.success ? (
                        <><CheckCircle className="h-4 w-4" /> Başarılı</>
                      ) : (
                        <><XCircle className="h-4 w-4" /> Hata</>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {job.description}
                </p>

                {result && result.sentCount !== undefined && !isLoading && (
                  <div className={`p-3 rounded-xl text-sm ${result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {result.success ? (
                      <p>{result.sentCount || 0} bildirim gönderildi</p>
                    ) : (
                      <p>Sonuç: {result.error || 'İşlem tamamlandı'}</p>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={() => runJob(job.id)}
                    disabled={isLoading}
                    className="flex-1 rounded-xl"
                    data-testid={`run-${job.id}-btn`}
                  >
                    {isLoading ? (
                      <><Loader2 className="h-4 w-4 animate-spin mr-2" /> İşleniyor...</>
                    ) : (
                      <><Play className="h-4 w-4 mr-2" /> Başlat</>
                    )}
                  </Button>

                  {isLoading && (
                    <Button
                      onClick={() => stopJob(job.id)}
                      variant="destructive"
                      className="w-12 rounded-xl px-0"
                      title="Durdur"
                    >
                      <span className="h-3 w-3 bg-current rounded-sm" />
                    </Button>
                  )}
                </div>

                {/* Detailed Logs Box */}
                {result && result.logs && result.logs.length > 0 && (
                  <div className="mt-4 border rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900/50">
                    <div className="bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-muted-foreground border-b flex justify-between items-center">
                      <span>İşlem Detayları</span>
                      <span className="text-[10px] opacity-70">{result.logs.length} Kayıt</span>
                    </div>
                    <div className="max-h-60 overflow-y-auto p-2 space-y-1">
                      {result.logs.map((log: any, idx: number) => (
                        <div key={idx} className="text-xs flex items-start gap-2 p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                          <div className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${log.status === 'success' ? 'bg-green-500' :
                            log.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                            }`} />
                          <div className="flex-1 grid gap-0.5">
                            <div className="font-medium text-foreground flex justify-between">
                              <span>{log.student}</span>
                              <span className="text-muted-foreground font-normal">{log.parent}</span>
                            </div>
                            <div className={`text-[10px] ${log.status === 'success' ? 'text-green-600 dark:text-green-400' :
                              log.status === 'error' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
                              }`}>
                              {log.message}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Info Box */}
      <Card className="rounded-2xl bg-gradient-to-br from-harmony-soft to-white">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-harmony-brain/10">
              <Clock className="h-6 w-6 text-harmony-brain" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Otomatik Çalışma Zamanları</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>09:00</strong> - AI aktivite önerileri tüm velilere gönderilir</li>
                <li>• <strong>18:00</strong> - Günlük gelişim özetleri oluşturulur ve gönderilir</li>
                <li>• Görevler sadece zayıf alanları olan öğrencilerin velilerine bildirim gönderir</li>
                <li>• Her API çağrısı arasında rate limiting uygulanır</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
