/**
 * AI-related hooks
 */

import { useQuery } from "@tanstack/react-query"

export interface AISummary {
  id: string
  studentId: string
  date: string
  summary: string
  riskExplanation: string | null
  homeActivity: string | null
  positiveNote: string | null
  generatedAt: string
  createdAt: string
}

/**
 * Get AI summary for a student
 */
export function useAISummary(studentId: string | null, date?: Date) {
  return useQuery({
    queryKey: ["ai", "summary", studentId, date?.toISOString().split('T')[0]],
    queryFn: async () => {
      if (!studentId) return null

      const params = new URLSearchParams()
      if (date) {
        params.append("date", date.toISOString().split('T')[0])
      }

      const url = `/api/ai/summary/${studentId}${params.toString() ? `?${params}` : ''}`
      const res = await fetch(url)
      
      if (!res.ok) {
        if (res.status === 404) return null
        throw new Error("Failed to fetch AI summary")
      }

      const data = await res.json()
      
      // Handle null response
      if (!data || data === null) return null
      
      return data as AISummary
    },
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  })
}

/**
 * Generate new AI summary for a student (mutation)
 */
export function useGenerateAISummary(studentId: string | null, date?: Date) {
  return useQuery({
    queryKey: ["ai", "generate", studentId, date?.toISOString().split('T')[0]],
    queryFn: async () => {
      if (!studentId) return null
      
      const body: any = {}
      if (date) {
        body.date = date.toISOString().split('T')[0]
      }

      const res = await fetch(`/napi/ai/summary/${studentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        throw new Error("Failed to generate AI summary")
      }

      const data = await res.json()
      return data as AISummary
    },
    enabled: false, // Manual trigger only
  })
}

