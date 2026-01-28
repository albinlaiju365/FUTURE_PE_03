import { useConversation } from "@elevenlabs/react"
import { useCallback, useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, MicOff, PhoneOff, Radio, X, Volume2, VolumeX, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"

interface ConversationProps {
    agentId?: string
    onClose?: () => void
    messages?: any[]
    append?: (message: any) => Promise<string | null | undefined>
    isLoading?: boolean
}

export function Conversation({ agentId, onClose, messages = [], append, isLoading }: ConversationProps) {
    // Mode State: 'elevenlabs' | 'local'
    const [mode, setMode] = useState<'elevenlabs' | 'local'>('elevenlabs')
    const [isStarted, setIsStarted] = useState(false)
    const [isSpeakingLocal, setIsSpeakingLocal] = useState(false)
    const [localTranscriptSent, setLocalTranscriptSent] = useState(false)

    // 1. ElevenLabs Mode
    const conversation = useConversation({
        onConnect: () => {
            setIsStarted(true)
            toast.success("Remote Link Established", { description: "Connected to NVIDIA PersonaPlex Core." })
        },
        onDisconnect: () => setIsStarted(false),
        onError: (error) => {
            console.error("ElevenLabs Error:", error)
            setMode('local')
            toast.error("Remote Link Failure", { description: "Switching to Local Neural Voice..." })
        },
    })

    const { status, isSpeaking: isSpeakingEleven } = conversation

    // 2. Local Mode (Fallback)
    const {
        isListening: isListeningLocal,
        transcript: localTranscript,
        startListening: startLocalListening,
        stopListening: stopLocalListening,
        setTranscript: setLocalTranscript
    } = useSpeechRecognition()

    // Handle Local Mode Logic
    useEffect(() => {
        if (mode === 'local' && localTranscript && !localTranscriptSent) {
            // Wait for silence (basic heuristic) or just send when transcript stabilizes
            const timeout = setTimeout(() => {
                if (append && localTranscript.trim().length > 2) {
                    append({ role: "user", content: localTranscript.trim() })
                    setLocalTranscript("")
                    setLocalTranscriptSent(true)
                }
            }, 1500)
            return () => clearTimeout(timeout)
        }
    }, [localTranscript, mode, append, localTranscriptSent, setLocalTranscript])

    // Reset transcript sent flag when AI starts loading
    useEffect(() => {
        if (isLoading) setLocalTranscriptSent(false)
    }, [isLoading])

    // Local TTS (Text-to-Speech) - Web Speech API
    const speakLocal = useCallback((text: string) => {
        if (typeof window === "undefined" || !window.speechSynthesis) return

        // Stop any pending speech
        window.speechSynthesis.cancel()

        const cleanText = text.replace(/\[MEMORY: .*?\]/g, "").replace(/```[\s\S]*?```/g, "Code block omitted.")
        const utterance = new SpeechSynthesisUtterance(cleanText)
        utterance.rate = 1.0
        utterance.pitch = 1.0
        utterance.onstart = () => setIsSpeakingLocal(true)
        utterance.onend = () => setIsSpeakingLocal(false)
        utterance.onerror = () => setIsSpeakingLocal(false)

        // Try to find a good quality voice (prefer 'Google' or 'Premium' ones)
        const voices = window.speechSynthesis.getVoices()
        const preferredVoice = voices.find(v => v.name.includes("Google") || v.name.includes("Natural")) || voices[0]
        if (preferredVoice) utterance.voice = preferredVoice

        window.speechSynthesis.speak(utterance)
    }, [])

    // React to new AI messages in Local Mode
    useEffect(() => {
        if (mode === 'local' && messages.length > 0 && !isLoading) {
            const lastMessage = messages[messages.length - 1]
            if (lastMessage.role === "assistant") {
                speakLocal(lastMessage.content)
            }
        }
    }, [messages, mode, isLoading, speakLocal])

    const startConversation = useCallback(async () => {
        if (mode === 'elevenlabs') {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
                stream.getTracks().forEach(t => t.stop()) // Verification only

                const effectiveAgentId = agentId || process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID

                if (!effectiveAgentId) {
                    console.warn("No ElevenLabs Agent ID found. Falling back to local mode.")
                    setMode('local')
                    setIsStarted(true)
                    startLocalListening()
                    return
                }

                await conversation.startSession({
                    agentId: effectiveAgentId,
                    // @ts-expect-error - connectionType is needed by runtime but sometimes issues in types
                    connectionType: "ws"
                })
            } catch (err) {
                console.error("Failed to start remote session:", err)
                setMode('local')
                setIsStarted(true)
                startLocalListening()
            }
        } else {
            setIsStarted(true)
            startLocalListening()
        }
    }, [conversation, agentId, mode, startLocalListening])

    const stopConversation = useCallback(async () => {
        if (mode === 'elevenlabs') {
            await conversation.endSession()
        } else {
            stopLocalListening()
            window.speechSynthesis?.cancel()
            setIsStarted(false)
        }
    }, [conversation, mode, stopLocalListening])

    const isSpeaking = mode === 'elevenlabs' ? isSpeakingEleven : (isSpeakingLocal || isLoading)
    const currentStatus = mode === 'elevenlabs' ? status : (isStarted ? "connected" : "disconnected")

    return (
        <div className="flex flex-col items-center justify-center gap-12 py-10 w-full max-w-md mx-auto relative z-10 font-sans">
            {/* Exit Button */}
            {onClose && (
                <button
                    onClick={() => {
                        stopConversation()
                        onClose()
                    }}
                    className="absolute -top-10 right-0 p-3 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-all backdrop-blur-xl border border-white/10 z-50"
                >
                    <X className="w-6 h-6" />
                </button>
            )}

            {/* AI Personality Badge */}
            <div className="absolute -top-10 left-0 flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-md rounded-full border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span className="text-[10px] font-mono tracking-widest text-white/60 uppercase">
                    {mode === 'elevenlabs' ? 'Engine: PersonaPlex-7B (NVIDIA)' : 'Engine: Nexis-Local'}
                </span>
            </div>

            {/* Apple Intelligence Style Fluid Orb */}
            <div className="relative flex items-center justify-center h-80 w-80">
                <AnimatePresence mode="wait">
                    {currentStatus === "connected" ? (
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
                                    scale: isSpeaking ? [1, 1.25, 0.9, 1.1, 1] : [1, 1.05, 1],
                                    rotate: isSpeaking ? [0, 45, -45, 0] : 0
                                }}
                                transition={{
                                    duration: isSpeaking ? 0.6 : 4,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className={cn(
                                    "absolute inset-0 rounded-full blur-[60px] opacity-60 mix-blend-screen transition-all duration-1000",
                                    mode === 'elevenlabs'
                                        ? "bg-gradient-to-tr from-[#3b82f6] via-[#8b5cf6] to-[#ec4899]"
                                        : "bg-gradient-to-tr from-[#10b981] via-[#3b82f6] to-[#8b5cf6]"
                                )}
                            />

                            {/* Outer Reactive Ring */}
                            <motion.div
                                animate={{
                                    scale: isSpeaking ? [1.1, 1.4, 1.1] : [1.1, 1.2, 1.1],
                                    rotate: [0, 90, 180, 270, 360],
                                }}
                                transition={{
                                    rotate: { duration: 15, repeat: Infinity, ease: "linear" },
                                    scale: { duration: isSpeaking ? 0.4 : 6, repeat: Infinity, ease: "easeInOut" }
                                }}
                                className="absolute inset-0 rounded-full bg-gradient-to-bl from-white/5 via-primary/20 to-accent/20 blur-[80px] opacity-40 mix-blend-screen"
                            />

                            {/* Sharp White Core Accent */}
                            <motion.div
                                animate={{
                                    opacity: isSpeaking ? 0.8 : 0.4,
                                    scale: isSpeaking ? 1.25 : 1,
                                }}
                                className="w-32 h-32 bg-white/5 backdrop-blur-3xl rounded-full border border-white/20 shadow-[0_0_80px_rgba(255,255,255,0.2)] z-10 flex items-center justify-center"
                            >
                                {mode === 'local' && isLoading && (
                                    <Sparkles className="w-8 h-8 text-accent animate-pulse" />
                                )}
                            </motion.div>
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
                            <Mic className="w-12 h-12 text-white/40 group-hover:text-white transition-colors duration-300" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Status & Controls Island */}
            <div className="flex flex-col items-center gap-8 w-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={isSpeaking ? "speaking" : "idle"}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-center space-y-4 px-6"
                    >
                        <h3 className="text-3xl font-light text-white tracking-wide">
                            {currentStatus === "connected"
                                ? (isSpeaking ? (isLoading ? "Thinking..." : "Nexis Speaking") : "Listening")
                                : "Neural Link Offline"}
                        </h3>

                        {/* Local Transcript View */}
                        {mode === 'local' && isStarted && localTranscript && !isLoading && (
                            <p className="text-sm font-mono text-white/50 bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                                "{localTranscript}"
                            </p>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Control Bar */}
                {currentStatus === "connected" ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-6 px-8 py-4 bg-black/20 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl"
                    >
                        <button
                            onClick={() => {
                                if (mode === 'local') {
                                    isListeningLocal ? stopLocalListening() : startLocalListening()
                                }
                            }}
                            className={cn(
                                "p-4 rounded-full transition-all backdrop-blur-md border group",
                                (mode === 'elevenlabs' || isListeningLocal)
                                    ? "bg-white/10 text-white/70 hover:text-white border-white/5"
                                    : "bg-red-500/20 text-red-500 border-red-500/20"
                            )}
                        >
                            {mode === 'elevenlabs' || isListeningLocal ? (
                                <Mic className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            ) : (
                                <MicOff className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            )}
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
