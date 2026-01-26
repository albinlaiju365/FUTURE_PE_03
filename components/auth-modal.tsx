
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
                <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 overflow-y-auto pt-20 md:items-center md:pt-4">
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
                        className="relative w-full max-w-md z-10"
                    >
                        {/* Custom Container - Clean & Floating (No Box) */}
                        {/* Custom Container - Clean & Floating (No Box) */}
                        <div className="relative backdrop-blur-3xl bg-black/60 border border-white/10 overflow-hidden rounded-xl shadow-2xl">
                            {/* Top Bar with Tabs and Close */}
                            <div className="flex items-center border-b border-white/5 bg-white/[0.02]">
                                <div className="flex flex-1">
                                    <button
                                        onClick={() => setMode("login")}
                                        className={`flex-1 py-4 font-mono text-[9px] uppercase tracking-[0.3em] transition-all ${mode === 'login' ? 'text-accent bg-accent/5 font-bold' : 'text-muted-foreground hover:text-white hover:bg-white/5'}`}
                                    >
                                        [ ACCESS_LOGIN ]
                                    </button>
                                    <button
                                        onClick={() => setMode("signup")}
                                        className={`flex-1 py-4 font-mono text-[9px] uppercase tracking-[0.3em] transition-all ${mode === 'signup' ? 'text-accent bg-accent/5 font-bold' : 'text-muted-foreground hover:text-white hover:bg-white/5'}`}
                                    >
                                        [ INITIALIZE_SIG ]
                                    </button>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-4 text-muted-foreground hover:text-white transition-all border-l border-white/5 hover:bg-red-500/10 group"
                                    title="TERMINATE_SESSION"
                                >
                                    <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                                </button>
                            </div>

                            {/* Render the Login/Signup pages but nested */}
                            <div className="py-2">
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
