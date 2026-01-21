import { useEffect, useState } from "react"
import { Download, Share, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [isIOS, setIsIOS] = useState(false)
    const [isStandalone, setIsStandalone] = useState(false)
    const [showIOSPrompt, setShowIOSPrompt] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        setIsIOS(
            /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
        )
        setIsStandalone(window.matchMedia("(display-mode: standalone)").matches)

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)
        }

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
        }
    }, [])

    if (!mounted) return null
    if (isStandalone) return null

    // Don't show anything if prompt was dismissed recently (optional logic, skipping for simplicity/always visible if installable)

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt()
            const { outcome } = await deferredPrompt.userChoice
            if (outcome === "accepted") {
                setDeferredPrompt(null)
                toast.success("App installing...")
            }
        } else if (isIOS) {
            setShowIOSPrompt(true)
        }
    }

    // Only show button if we have a prompt (Android/Desktop) or it's iOS
    if (!deferredPrompt && !isIOS) return null

    return (
        <>
            <AnimatePresence>
                {!showIOSPrompt && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-4 right-4 z-50"
                    >
                        <button
                            onClick={handleInstallClick}
                            className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.5)] backdrop-blur-md transition-all duration-300 rounded-full px-4 py-2 flex items-center gap-2 group"
                        >
                            <Download className="w-4 h-4 group-hover:animate-bounce" />
                            <span className="font-medium text-sm">Install App</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showIOSPrompt && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => setShowIOSPrompt(false)}
                    >
                        <motion.div
                            initial={{ y: 100 }}
                            animate={{ y: 0 }}
                            exit={{ y: 100 }}
                            className="bg-[#0f172a] border border-blue-500/30 rounded-xl p-6 w-full max-w-sm shadow-2xl relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShowIOSPrompt(false)}
                                className="absolute top-2 right-2 text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex flex-col gap-4 text-center items-center">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                                    <Download className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-white">Install Chatbot</h3>
                                <p className="text-slate-300 text-sm">
                                    To install this app on your iPhone:
                                </p>
                                <div className="flex flex-col gap-3 text-sm text-slate-300 w-full bg-slate-900/50 p-4 rounded-lg text-left">
                                    <div className="flex items-center gap-3">
                                        <Share className="w-5 h-5 text-blue-400" />
                                        <span>Tap the <strong>Share</strong> button</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 flex items-center justify-center border border-white/20 rounded text-[10px]">+</div>
                                        <span>Scroll down and tap <strong>Add to Home Screen</strong></span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
