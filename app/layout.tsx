import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import type React from "react"

const inter = Inter({ subsets: ["latin"] })

import { SecurityShield } from "@/components/security-shield"

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
          <Toaster position="top-right" theme="dark" closeButton richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
