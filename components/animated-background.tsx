"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
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

    if (!mounted) return null

    const isDark = resolvedTheme === "dark"

    const colors = isDark
        ? ["#00f2ea", "#ff0055", "#7000ff", "#0055ff"]
        : ["#00f2ea", "#ff0055", "#7000ff", "#0055ff"] // User requested same RGB colors

    return (
        <div className={cn("fixed inset-0 -z-50 overflow-hidden bg-background", className)}>
            <div className="absolute inset-0 bg-background/20 backdrop-blur-xl" />

            {colors.map((color, i) => (
                <motion.div
                    key={i}
                    className={cn(
                        "absolute rounded-full opacity-80 blur-[80px]",
                        isDark ? "mix-blend-screen" : "mix-blend-multiply"
                    )}
                    style={{
                        backgroundColor: color,
                        width: "45vw",
                        height: "45vw",
                        // Constrain start position to the right side
                        top: `${Math.random() * 100 - 20}%`, // Allow some vertical overflow
                        left: `${40 + Math.random() * 60}%`, // Start from 40% to 100% left
                    }}
                    animate={{
                        // Limit horizontal movement to keep it mostly on the right
                        x: [0, Math.random() * 200 - 100, Math.random() * 200 - 100, 0],
                        y: [0, Math.random() * 400 - 200, Math.random() * 400 - 200, 0],
                        scale: [1, 1.3, 0.7, 1],
                        rotate: [0, 90, 180],
                    }}
                    transition={{
                        duration: 10 + Math.random() * 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    )
}
