"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, Input } from "@/components/ui"
import { Shield, Search, Download } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { Button } from "@/components/ui"

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const handleExport = () => {
    window.open("/napi/admin/export/audit", "_blank")
  }

  useEffect(() => {
    fetch("/napi/audit?limit=200")
      .then((res) => res.json())
      .then((data) => {
        setLogs(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => {
        setLogs([])
        setLoading(false)
      })
  }, [])

  const filteredLogs = Array.isArray(logs) ? logs.filter((log) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      log.user?.fullName?.toLowerCase().includes(searchLower) ||
      log.entity?.toLowerCase().includes(searchLower) ||
      log.action?.toLowerCase().includes(searchLower)
    )
  }) : []

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-heading font-bold mb-2 flex items-center gap-2 bg-gradient-to-r from-harmony-brain to-harmony-heart bg-clip-text text-transparent">
              <Shield className="h-8 w-8 text-harmony-brain" />
              Audit Log
            </h1>
            <p className="text-muted-foreground">Sistem aktivite kayıtları</p>
          </div>
          <Button
            onClick={handleExport}
            className="rounded-xl flex items-center gap-2"
            variant="outline"
          >
            <Download className="h-4 w-4" />
            JSON Olarak Dışa Aktar
          </Button>
        </div>

        {/* Search */}
        <Card className="rounded-2xl shadow-harmony border-0 bg-gradient-to-br from-white to-harmony-soft/30">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Kullanıcı, entity veya action ara..."
                className="pl-10 rounded-xl"
              />
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card className="rounded-2xl shadow-harmony border-0 bg-gradient-to-br from-white to-harmony-soft/30">
          <CardHeader>
            <CardTitle>Kayıtlar ({filteredLogs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredLogs.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                Kayıt bulunamadı.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 text-sm font-semibold font-mono">Tarih</th>
                      <th className="text-left p-3 text-sm font-semibold">Kullanıcı</th>
                      <th className="text-left p-3 text-sm font-semibold">Action</th>
                      <th className="text-left p-3 text-sm font-semibold">Entity</th>
                      <th className="text-left p-3 text-sm font-semibold">Entity ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-harmony-soft/30">
                        <td className="p-3 text-xs font-mono text-muted-foreground">
                          {format(new Date(log.timestamp), "dd.MM.yyyy HH:mm", { locale: tr })}
                        </td>
                        <td className="p-3 text-sm">
                          {log.user?.fullName || "System"}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded-md text-xs font-medium ${log.action === "create"
                                ? "bg-neuro-green/10 text-neuro-green"
                                : log.action === "update"
                                  ? "bg-alert-amber/10 text-alert-amber"
                                  : log.action === "delete"
                                    ? "bg-risk-red/10 text-risk-red"
                                    : "bg-harmony-brain/10 text-harmony-brain"
                              }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3 text-sm font-mono">{log.entity}</td>
                        <td className="p-3 text-xs font-mono text-muted-foreground">
                          {log.entityId?.substring(0, 8)}...
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

