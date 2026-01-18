"use client"

import { useState, useEffect } from "react"
import { HeroSection } from "@/components/hero-section"
import { SignalsSection } from "@/components/signals-section"
import { WorkSection } from "@/components/work-section"
import { PrinciplesSection } from "@/components/principles-section"
import { ColophonSection } from "@/components/colophon-section"
import { SideNav } from "@/components/side-nav"
import { ProfileMenu } from "@/components/profile-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { AnimatedBackground } from "@/components/animated-background"
import { AuthModal } from "@/components/auth-modal"

export default function Page() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Sync login state with server session
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me")
        const data = await res.json()
        if (data.user) {
          setIsLoggedIn(true)
          // Sync local for other components if needed
          localStorage.setItem("isLoggedIn", "true")
          localStorage.setItem("userName", data.user.name)
          localStorage.setItem("userEmail", data.user.email)
        } else {
          setIsLoggedIn(false)
          localStorage.removeItem("isLoggedIn")
        }
      } catch (e) {
        setIsLoggedIn(false)
      }
    }

    checkAuth()
    // Listen for storage changes (for across tabs updates still useful)
    window.addEventListener('storage', checkAuth)

    // Legacy Data Purge (One-time cleanup)
    if (localStorage.getItem("registeredUsers")) {
      console.log("System Reset: Purging legacy data protocols...")
      localStorage.removeItem("registeredUsers") // Old mock DB
      localStorage.removeItem("isLoggedIn")      // Old session flag
      localStorage.removeItem("userName")
      localStorage.removeItem("userEmail")
      // localStorage.removeItem("nexis_chat_history") // Uncomment if we want to wipe chats too. Currently keeping history as user might value it.
      // If user wants full nuke, they can clear browser data.
    }

    return () => window.removeEventListener('storage', checkAuth)
  }, [])

  const openAuth = (mode: "login" | "signup" = "login") => {
    setAuthMode(mode)
    setIsAuthModalOpen(true)
  }

  const handleAuthSuccess = () => {
    setIsLoggedIn(true)
    setIsAuthModalOpen(false)
  }

  return (
    <main className="relative min-h-screen">
      <SideNav />
      {/* Replaced static grid with animated background */}
      <AnimatedBackground />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
        onSuccess={handleAuthSuccess}
      />

      {/* Top right component container */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-4">
        <ThemeToggle />
        {isLoggedIn && <ProfileMenu onAuthClick={openAuth} />}
      </div>

      <div className="relative z-10">
        <HeroSection onAuthClick={openAuth} />
        <SignalsSection />
        <WorkSection />
        <PrinciplesSection />
        <ColophonSection />
      </div>
    </main>
  )
}
