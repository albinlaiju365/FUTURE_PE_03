"use client"

import { motion } from "framer-motion"
import { useEffect, useState, useMemo } from "react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

interface AnimatedBackgroundProps {
    className?: string
}

export function AnimatedBackground({ className }: AnimatedBackgroundProps) {
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const isDark = resolvedTheme === "dark"

    const colors = isDark
        ? ["#00f2ea", "#ff0055", "#7000ff", "#0055ff"]
        : ["#00f2ea", "#ff0055", "#7000ff", "#0055ff"]

    const blobData = useMemo(() => {
        return colors.map((color) => ({
            color,
            top: `${Math.random() * 100 - 20}%`,
            left: `${40 + Math.random() * 60}%`,
            x: [0, Math.random() * 200 - 100, Math.random() * 200 - 100, 0],
            y: [0, Math.random() * 400 - 200, Math.random() * 400 - 200, 0],
            scale: [1, 1.3, 0.7, 1],
            rotate: [0, 90, 180, 0],
            duration: 15 + Math.random() * 10,
        }))
    }, [isDark]) // Only re-generate if theme changes (though colors are same currently)

    if (!mounted) return null

    return (
        <div className={cn("fixed inset-0 -z-50 overflow-hidden bg-background", className)}>
            <div className="absolute inset-0 bg-background/20 backdrop-blur-xl" />

            {blobData.map((blob, i) => (
                <motion.div
                    key={i}
                    className={cn(
                        "absolute rounded-full opacity-80 blur-[80px]",
                        isDark ? "mix-blend-screen" : "mix-blend-multiply"
                    )}
                    style={{
                        backgroundColor: blob.color,
                        width: "45vw",
                        height: "45vw",
                        top: blob.top,
                        left: blob.left,
                        willChange: "transform",
                    }}
                    animate={{
                        x: blob.x,
                        y: blob.y,
                        scale: blob.scale,
                        rotate: blob.rotate,
                    }}
                    transition={{
                        duration: blob.duration,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />
            ))}
        </div>
    )
}
