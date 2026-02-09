import type { Metadata, Viewport } from "next"
import "./globals.css"
import { Providers } from "@/components/providers"
import { prisma } from "@/lib/db/prisma"
import { THEME_PALETTES } from "@/lib/theme/palettes"

export const metadata: Metadata = {
  title: "Harmoniq - Norobilim Tabanli Anaokulu Yonetim Sistemi",
  description: "2-6 yas arasi cocuklarin bilissel ve duygusal gelisimini takip eden platform",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Harmoniq",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Harmoni OS",
    title: "Harmoni OS - Anaokulu Yonetim Sistemi",
    description: "Norobilim tabanli anaokulu yonetim ve takip platformu",
  },
}

export const viewport: Viewport = {
  themeColor: "#0F766E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

function hexToHslComponents(hex: string): string {
  // Remove # if present
  const cleanHex = hex.replace('#', '')

  // Convert hex to RGB
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Fetch school settings to apply theme globally
  const schoolSettings = await (prisma as any).schoolSettings.findUnique({
    where: { id: "singleton" }
  })

  const paletteName = schoolSettings?.themePalette || "default"
  const palette = THEME_PALETTES[paletteName] || THEME_PALETTES.default

  const primaryHsl = hexToHslComponents(schoolSettings?.primaryColor || palette.primary)
  const secondaryHsl = hexToHslComponents(schoolSettings?.secondaryColor || palette.secondary)

  const sidebarBgHsl = hexToHslComponents(schoolSettings?.sidebarBg || palette.sidebarBg)
  const sidebarBorderHsl = hexToHslComponents(schoolSettings?.sidebarBorder || palette.sidebarBorder)
  const pageBgHsl = hexToHslComponents(schoolSettings?.pageBg || palette.pageBg)
  const textPrimaryHsl = hexToHslComponents(schoolSettings?.textPrimary || palette.textPrimary)
  const textSidebarHsl = hexToHslComponents(schoolSettings?.textSidebar || palette.textSidebar)

  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <style
          key="theme-vars"
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --primary: ${primaryHsl};
                --secondary: ${secondaryHsl};
                --sidebar-bg: ${sidebarBgHsl};
                --sidebar-border: ${sidebarBorderHsl};
                --page-bg: ${pageBgHsl};
                --text-primary: ${textPrimaryHsl};
                --text-sidebar: ${textSidebarHsl};
              }
            `
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('SW registered:', registration.scope);
                  }).catch(function(error) {
                    console.log('SW registration failed:', error);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
