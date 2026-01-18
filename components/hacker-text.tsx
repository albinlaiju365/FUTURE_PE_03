"use client"

import { useEffect, useState, useRef } from "react"

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*"

interface HackerTextProps {
    text: string
    speed?: number
    className?: string
}

export function HackerText({ text, speed = 30, className }: HackerTextProps) {
    const [displayText, setDisplayText] = useState("")
    const [isComplete, setIsComplete] = useState(false)
    const iterationRef = useRef(0)

    // If text changes, reset
    useEffect(() => {
        setDisplayText("")
        setIsComplete(false)
        iterationRef.current = 0
    }, [text])

    useEffect(() => {
        if (isComplete) return

        let interval: NodeJS.Timeout

        const animate = () => {
            interval = setInterval(() => {
                setDisplayText(current => {
                    const result = text
                        .split("")
                        .map((char, index) => {
                            if (index < iterationRef.current) {
                                return text[index]
                            }
                            return CHARS[Math.floor(Math.random() * CHARS.length)]
                        })
                        .join("")

                    if (iterationRef.current >= text.length) {
                        setIsComplete(true)
                        clearInterval(interval)
                    }

                    iterationRef.current += 1 / 3 // Slower decay for more glitch effect
                    return result
                })
            }, speed)
        }

        animate()

        return () => clearInterval(interval)
    }, [text, speed, isComplete])

    return (
        <span className={className}>
            {displayText}
            {!isComplete && <span className="animate-pulse ml-0.5 inline-block w-2 h-4 bg-accent align-middle" />}
        </span>
    )
}
