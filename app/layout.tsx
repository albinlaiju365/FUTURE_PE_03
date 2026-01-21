import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import type React from "react"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import type { Metadata, Viewport } from "next"

const inter = Inter({ subsets: ["latin"] })

import { SecurityShield } from "@/components/security-shield"

export const metadata: Metadata = {
  title: "AI Chatbot",
  description: "Advanced AI Chatbot with Cyberpunk Aesthetic",
  manifest: "/manifest.json",
}

export const viewport: Viewport = {
  themeColor: "#0f172a",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <SecurityShield>
            {children}
          </SecurityShield>
          <PWAInstallPrompt />
          <Toaster position="top-right" theme="dark" closeButton richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
