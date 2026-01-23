import "@/app/globals.css"
import { Quicksand } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import type React from "react"

import type { Metadata, Viewport } from "next"

const quicksand = Quicksand({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-quicksand" })

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
      <body className={`${quicksand.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <SecurityShield>
            {children}
          </SecurityShield>

          <Toaster position="top-right" theme="dark" closeButton richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
