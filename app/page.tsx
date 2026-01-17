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
    // Sync login state
    const checkAuth = () => {
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true")
    }

    checkAuth()
    // Listen for storage changes (for across tabs/components)
    window.addEventListener('storage', checkAuth)
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
