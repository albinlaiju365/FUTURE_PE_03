"use client"

import { useConversation } from "@elevenlabs/react"
import { useCallback, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, MicOff, PhoneOff, Radio, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConversationProps {
    agentId?: string // Optional, can pull from env if not passed
    onClose?: () => void
}

export function Conversation({ agentId, onClose }: ConversationProps) {
    const [isStarted, setIsStarted] = useState(false)
    const conversation = useConversation({
        onConnect: () => setIsStarted(true),
        onDisconnect: () => setIsStarted(false),
        onError: (error) => console.error(error),
        onModeChange: (mode) => console.log(mode)
    })

    const { status, isSpeaking } = conversation

    // Use the hook's start/end methods
    const startConversation = useCallback(async () => {
        try {
            // Request microphone permission first
            await navigator.mediaDevices.getUserMedia({ audio: true })

            // @ts-expect-error - connectionType might be missing in types but optional in runtime
            await conversation.startSession({
                agentId: agentId || process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || "",
            })
        } catch (err) {
            console.error("Failed to start conversation:", err)
        }
    }, [conversation, agentId])

    const stopConversation = useCallback(async () => {
        await conversation.endSession()
    }, [conversation])

    return (
        <div className="flex flex-col items-center justify-center gap-12 py-10 w-full max-w-md mx-auto relative z-10 font-sans">
            {/* Exit Button */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute -top-10 right-0 p-3 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-all backdrop-blur-xl border border-white/10 z-50"
                >
                    <X className="w-6 h-6" />
                </button>
            )}

            {/* Apple Intelligence Style Fluid Orb */}
            <div className="relative flex items-center justify-center h-80 w-80">
                <AnimatePresence mode="wait">
                    {status === "connected" ? (
                        <motion.div
                            key="connected-orb"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.8, ease: "circOut" }}
                            className="relative w-full h-full flex items-center justify-center"
                        >
                            {/* Inner Breathing Core */}
                            <motion.div
                                animate={{
                                    scale: isSpeaking ? [1, 1.15, 0.95, 1.05, 1] : [1, 1.02, 1],
                                }}
                                transition={{
                                    duration: isSpeaking ? 0.8 : 3,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#3b82f6] via-[#8b5cf6] to-[#ec4899] blur-[60px] opacity-60 mix-blend-screen"
                            />

                            {/* Outer Reactive Ring */}
                            <motion.div
                                animate={{
                                    scale: isSpeaking ? [1.1, 1.3, 1.1] : [1.1, 1.15, 1.1],
                                    rotate: [0, 90, 180, 270, 360],
                                }}
                                transition={{
                                    rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                                    scale: { duration: isSpeaking ? 0.4 : 4, repeat: Infinity, ease: "easeInOut" }
                                }}
                                className="absolute inset-0 rounded-full bg-gradient-to-bl from-[#06b6d4] via-[#3b82f6] to-[#8b5cf6] blur-[80px] opacity-40 mix-blend-screen"
                            />

                            {/* Sharp White Core Accent */}
                            <motion.div
                                animate={{
                                    opacity: isSpeaking ? 0.8 : 0.4,
                                    scale: isSpeaking ? 1.2 : 1,
                                }}
                                className="w-32 h-32 bg-white/10 backdrop-blur-3xl rounded-full border border-white/20 shadow-[0_0_80px_rgba(255,255,255,0.3)] z-10"
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="idle-orb"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="relative w-48 h-48 rounded-full bg-gradient-to-b from-white/5 to-white/10 backdrop-blur-2xl border border-white/10 shadow-2xl flex items-center justify-center group cursor-pointer hover:scale-105 transition-all duration-500"
                            onClick={startConversation}
                        >
                            <div className="absolute inset-0 rounded-full bg-white/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <Mic className="w-12 h-12 text-white/50 group-hover:text-white transition-colors duration-300" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Status & Controls Island */}
            <div className="flex flex-col items-center gap-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={status}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-center space-y-2"
                    >
                        <h3 className="text-3xl font-light text-white tracking-wide">
                            {status === "connected"
                                ? (isSpeaking ? "Speaking" : "Listening")
                                : "Voice Mode"}
                        </h3>
                        {status === "connected" && (
                            <p className="text-sm font-medium text-white/40 tracking-widest uppercase">
                                High Fidelity · 48khz
                            </p>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Control Bar */}
                {status === "connected" ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-6 px-8 py-4 bg-black/20 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl"
                    >
                        <button
                            className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all backdrop-blur-md border border-white/5 group"
                        >
                            <MicOff className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        </button>
                        <button
                            onClick={stopConversation}
                            className="p-4 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-100 hover:text-white transition-all backdrop-blur-md border border-red-500/30 group"
                        >
                            <PhoneOff className="w-8 h-8 group-hover:scale-110 transition-transform" />
                        </button>
                    </motion.div>
                ) : (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={startConversation}
                        className="px-10 py-5 bg-white text-black rounded-full font-semibold text-lg hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all duration-300 tracking-tight"
                    >
                        Start Conversation
                    </motion.button>
                )}
            </div>
        </div>
    )
}
