
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ShieldCheck } from "lucide-react"
import LoginPage from "@/app/login/page"
import SignupPage from "@/app/signup/page"
import { useRouter } from "next/navigation"

interface AuthModalProps {
    isOpen: boolean
    onClose: () => void
    initialMode?: "login" | "signup"
    onSuccess?: () => void
}

export function AuthModal({ isOpen, onClose, initialMode = "login", onSuccess }: AuthModalProps) {
    const router = useRouter()
    const [mode, setMode] = useState<"login" | "signup">(initialMode)

    const onLoginSuccess = () => {
        if (onSuccess) onSuccess()
        const pendingPrompt = localStorage.getItem("pendingPrompt")
        if (pendingPrompt) {
            router.push(`/chat?q=${encodeURIComponent(pendingPrompt)}`)
            localStorage.removeItem("pendingPrompt")
        } else {
            router.push("/chat")
        }
        onClose()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop with heavy blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-lg z-10"
                    >
                        {/* Close Button - Responsive Position */}
                        <button
                            onClick={onClose}
                            className="absolute top-0 right-0 md:-top-12 md:-right-12 z-50 p-3 text-muted-foreground hover:text-white transition-all hover:scale-110 active:scale-90"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Custom Container - Clean & Floating (No Box) */}
                        <div className="relative backdrop-blur-2xl bg-black/5 overflow-hidden">
                            {/* Mode Toggle Bar - Flat and Seamless */}
                            <div className="flex">
                                <button
                                    onClick={() => setMode("login")}
                                    className={`flex-1 py-4 font-mono text-[10px] uppercase tracking-[0.3em] transition-all ${mode === 'login' ? 'text-accent border-b-2 border-accent' : 'text-muted-foreground hover:text-white'}`}
                                >
                                    Login_Access
                                </button>
                                <button
                                    onClick={() => setMode("signup")}
                                    className={`flex-1 py-4 font-mono text-[10px] uppercase tracking-[0.3em] transition-all ${mode === 'signup' ? 'text-accent border-b-2 border-accent' : 'text-muted-foreground hover:text-white'}`}
                                >
                                    Signup_Initialize
                                </button>
                            </div>

                            {/* Render the Login/Signup pages but nested */}
                            <div className="py-4">
                                {mode === "login" ? (
                                    <div className="origin-top mt-0">
                                        <LoginPage
                                            isModal
                                            onSuccess={onLoginSuccess}
                                            onToggleMode={() => setMode("signup")}
                                        />
                                    </div>
                                ) : (
                                    <div className="origin-top mt-0">
                                        <SignupPage
                                            isModal
                                            onSuccess={onLoginSuccess}
                                            onToggleMode={() => setMode("login")}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Background Scanlines for Modal */}
                            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-20 z-0" />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
