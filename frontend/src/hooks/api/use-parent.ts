import { useQuery } from "@tanstack/react-query"

// Parent ID hook
export function useParentId() {
  return useQuery({
    queryKey: ["parent", "id"],
    queryFn: async () => {
      try {
        const res = await fetch("/napi/test/parent-id")
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          throw new Error(errorData.error || "Failed to fetch parent ID")
        }
        const data = await res.json()
        if (!data.success || !data.parent?.id) {
          throw new Error("Parent ID not found")
        }
        return data.parent.id as string
      } catch (error) {
        console.error("Error fetching parent ID:", error)
        throw error
      }
    },
    staleTime: 10 * 60 * 1000, // 10 dakika
    retry: 2, // 2 kez daha dene
  })
}

// Parent Children
export function useParentChildren(parentId: string | null) {
  return useQuery({
    queryKey: ["parent", "children", parentId],
    queryFn: async () => {
      if (!parentId) return []
      try {
        const res = await fetch(`/napi/parent/children?parentId=${parentId}`)
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          throw new Error(errorData.error || "Failed to fetch children")
        }
        const data = await res.json()
        return data.success ? (data.data || []) : []
      } catch (error) {
        console.error("Error fetching children:", error)
        throw error
      }
    },
    enabled: !!parentId,
    retry: 1,
  })
}

// Parent Child Detail
export function useParentChild(parentId: string | null, childId: string | null) {
  return useQuery({
    queryKey: ["parent", "child", parentId, childId],
    queryFn: async () => {
      if (!parentId || !childId) return null
      const res = await fetch(`/napi/parent/child/${childId}?parentId=${parentId}`)
      if (!res.ok) throw new Error("Failed to fetch child")
      const data = await res.json()
      return data.success ? data.data : null
    },
    enabled: !!parentId && !!childId,
  })
}

// Parent Reports
export function useParentReports(parentId: string | null, studentId: string | null) {
  return useQuery({
    queryKey: ["parent", "reports", parentId, studentId],
    queryFn: async () => {
      if (!parentId || !studentId) return null
      const res = await fetch(`/napi/parent/reports/${studentId}?parentId=${parentId}`)
      if (!res.ok) throw new Error("Failed to fetch reports")
      const data = await res.json()
      return data.success ? data.data : null
    },
    enabled: !!parentId && !!studentId,
  })
}

