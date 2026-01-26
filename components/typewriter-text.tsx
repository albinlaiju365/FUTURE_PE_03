"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface TypewriterTextProps {
    text: string
    isStreaming?: boolean
    speed?: number
    className?: string
}

export function TypewriterText({ text, isStreaming = false, speed = 15, className }: TypewriterTextProps) {
    const [displayedText, setDisplayedText] = useState("")
    const [hasStarted, setHasStarted] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        // Clear cleanup the text tags for display
        const cleanText = text.replace(/\[MEMORY: .*?\]/g, "")

        if (!isStreaming) {
            setDisplayedText(cleanText)
            return
        }

        // If it's the first time we see the text, or if we're behind the cleanText
        if (!hasStarted) {
            setHasStarted(true)
        }

        const typeNextChar = () => {
            if (displayedText.length < cleanText.length) {
                setDisplayedText(cleanText.slice(0, displayedText.length + 1))
            }
        }

        // Use a faster catch-up if we are far behind the stream
        const effectiveSpeed = cleanText.length - displayedText.length > 50 ? 5 : speed

        timeoutRef.current = setTimeout(typeNextChar, effectiveSpeed)

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [text, displayedText, isStreaming, speed, hasStarted])

    return (
        <div className={cn("relative inline-block min-h-[1.5em]", className)}>
            {displayedText}
            {isStreaming && (
                <span className="inline-block w-1.5 h-4 ml-1 bg-current animate-pulse align-middle opacity-70" />
            )}
        </div>
    )
}
