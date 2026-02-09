"use client"

import { QueryProvider } from "@/lib/providers/query-provider"
import { SessionProvider } from "next-auth/react"
import { Toaster } from "@/components/ui/sonner"
import { SchoolSettingsProvider } from "@/lib/providers/school-settings-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider basePath="/api/auth">
      <SchoolSettingsProvider>
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </SchoolSettingsProvider>
    </SessionProvider>
  )
}

