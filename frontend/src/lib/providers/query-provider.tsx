"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useState } from "react"

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 dakika - veriler 5 dakika boyunca fresh kalır
            gcTime: 15 * 60 * 1000, // 15 dakika - cache'de tutulma süresi
            refetchOnWindowFocus: false, // Pencere focus olduğunda otomatik refetch yapma
            refetchOnReconnect: true, // İnternet bağlantısı geldiğinde refetch yap
            retry: 1, // Hata durumunda 1 kez daha dene
            refetchOnMount: false, // Component tekrar mount olduğunda eğer data fresh (stale değilse) çekme
          },
          mutations: {
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

