
"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShieldAlert, Terminal, Lock } from "lucide-react"

export function SecurityShield({ children }: { children: React.ReactNode }) {
    const [isViolation, setIsViolation] = useState(false)
    const [violationType, setViolationType] = useState("")

    useEffect(() => {
        // 1. Disable Right Click
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault()
            triggerSecurityAlert("UNAUTHORIZED_CONTEXT_REQUEST")
        }

        // 2. Disable Key Shortcuts (F12, Ctrl+Shift+I, Ctrl+U)
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.key === "f12" ||
                (e.ctrlKey && e.shiftKey && e.key === "I") ||
                (e.ctrlKey && e.shiftKey && e.key === "C") ||
                (e.ctrlKey && e.shiftKey && e.key === "J") ||
                (e.ctrlKey && e.key === "u")
            ) {
                e.preventDefault()
                triggerSecurityAlert("DEBUGGER_DETECTION_PROTOCOL")
            }
        }

        // 3. DevTools Detection (Heuristic)
        const detectDevTools = () => {
            const widthThreshold = window.outerWidth - window.innerWidth > 160
            const heightThreshold = window.outerHeight - window.innerHeight > 160

            if (widthThreshold || heightThreshold) {
                // Not triggering for now as it can be false positive on zoom/resizing
                // but we could log it.
            }
        }

        window.addEventListener("contextmenu", handleContextMenu)
        window.addEventListener("keydown", handleKeyDown)
        window.addEventListener("resize", detectDevTools)

        return () => {
            window.removeEventListener("contextmenu", handleContextMenu)
            window.removeEventListener("keydown", handleKeyDown)
            window.removeEventListener("resize", detectDevTools)
        }
    }, [])

    const triggerSecurityAlert = (type: string) => {
        // Silently handle violation - measures are still blocked but no UI alert shown
        console.warn(`Security violation: ${type}`)
    }

    return (
        <>
            {children}
        </>
    )
}
