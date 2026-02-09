"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface SchoolSettings {
    name: string
    logoUrl: string | null
    primaryColor: string
    secondaryColor: string
    sidebarBg: string
    sidebarBorder: string
    pageBg: string
    textPrimary: string
    textSidebar: string
    themePalette: string
}

interface SchoolSettingsContextType {
    settings: SchoolSettings | null
    loading: boolean
    refreshSettings: () => Promise<void>
}

const SchoolSettingsContext = createContext<SchoolSettingsContextType | undefined>(undefined)

export function SchoolSettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<SchoolSettings | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchSettings = async () => {
        try {
            const response = await fetch("/napi/admin/school-settings")
            const data = await response.json()
            if (data.success) {
                setSettings(data.data)
            }
        } catch (error) {
            console.error("Failed to fetch school settings:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSettings()
    }, [])

    return (
        <SchoolSettingsContext.Provider
            value={{
                settings,
                loading,
                refreshSettings: fetchSettings
            }}
        >
            {children}
        </SchoolSettingsContext.Provider>
    )
}

export function useSchoolSettings() {
    const context = useContext(SchoolSettingsContext)
    if (context === undefined) {
        throw new Error("useSchoolSettings must be used within a SchoolSettingsProvider")
    }
    return context
}
