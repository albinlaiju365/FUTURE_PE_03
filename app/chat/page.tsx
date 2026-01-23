"use client"

import { useState, useRef, useEffect, useMemo, Suspense } from "react"
import { useChat } from "@ai-sdk/react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Terminal,
    FileCode,
    Command,
    Search,
    Settings,
    Menu,
    X,
    Plus,
    Github,
    Cpu,
    Database,
    Layers,
    Code2,
    ChevronRight,
    Maximize2,
    Mic,
    Send,
    Loader2,
    MessageSquare,
    Wand2,
    SquarePen,
    Image,
    Grid2X2,
    Folder,
    Trash2,
    PanelLeftClose,
    PanelLeftOpen,
    Headphones
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { AnimatedBackground } from "@/components/animated-background"
import { SettingsModal } from "@/components/settings-modal"
import { HackerText } from "@/components/hacker-text"
import { ProfileMenu } from "@/components/profile-menu"
import { Conversation } from "@/components/conversation"

function ChatContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const initialQuery = searchParams.get("q")

    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [sidebarView, setSidebarView] = useState<"explorer" | "search" | "git" | "settings" | "database" | "layers">("explorer")
    const [activeTab, setActiveTab] = useState("chat.tsx")
    const [isEnhancing, setIsEnhancing] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const searchInputRef = useRef<HTMLInputElement>(null)
    const [projectMode, setProjectMode] = useState<"research" | "web" | null>(null)
    const [persona, setPersona] = useState("nexis")
    const [userName, setUserName] = useState("User")
    const [voiceMode, setVoiceMode] = useState(false)

    // Load memories for context
    const [memories, setMemories] = useState<string[]>([])
    useEffect(() => {
        const saved = localStorage.getItem("ai_memories")
        if (saved) setMemories(JSON.parse(saved))
        const savedPersona = localStorage.getItem("nexis_persona")
        if (savedPersona) setPersona(savedPersona)
        const savedName = localStorage.getItem("userName")
        if (savedName) setUserName(savedName)
        const handleStorage = () => {
            const newPersona = localStorage.getItem("nexis_persona")
            if (newPersona) setPersona(newPersona)
            const newName = localStorage.getItem("userName")
            if (newName) setUserName(newName)
        }
        window.addEventListener("storage", handleStorage)
        return () => window.removeEventListener("storage", handleStorage)
    }, [])

    const chatConfig = useMemo(() => ({
        body: { projectMode, memories, persona },
        onFinish: (message: any) => {
            const content = message.content;
            const memoryMatch = content.match(/\[MEMORY: (.*?)\]/);
            if (memoryMatch && memoryMatch[1]) {
                const fact = memoryMatch[1];
                const currentMemories = JSON.parse(localStorage.getItem("ai_memories") || "[]");
                if (!currentMemories.includes(fact)) {
                    const updated = [...currentMemories, fact];
                    localStorage.setItem("ai_memories", JSON.stringify(updated));
                    setMemories(updated);
                }
            }
        }
    }), [projectMode, memories, persona])

    const { messages, input, handleInputChange, handleSubmit, isLoading, append, setInput, setMessages } = useChat(chatConfig) as any
    const scrollRef = useRef<HTMLDivElement>(null)
    const hasTriggeredInit = useRef(false)

    const [chats, setChats] = useState<{ id: string; title: string; messages: any[]; type: "standard" | "project"; mode?: "research" | "web" }[]>([])
    const [currentChatId, setCurrentChatId] = useState(Date.now().toString())
    const [isHistoryLoaded, setIsHistoryLoaded] = useState(false)

    useEffect(() => {
        const loadHistory = async () => {
            let localChats: any[] = []
            try {
                const saved = localStorage.getItem("nexis_chat_history")
                if (saved) localChats = JSON.parse(saved)
            } catch (e) { console.error("History parse failure") }

            try {
                const res = await fetch("/api/chat/sync")
                if (res.ok) {
                    const data = await res.json()
                    if (data.chats && Array.isArray(data.chats)) {
                        setChats(data.chats.length > 0 ? data.chats : localChats)
                    } else {
                        setChats(localChats)
                    }
                } else {
                    setChats(localChats)
                }
            } catch (error) {
                setChats(localChats)
            } finally {
                setIsHistoryLoaded(true)
            }
        }
        loadHistory()
    }, [])

    useEffect(() => {
        if (isHistoryLoaded && chats.length > 0) {
            localStorage.setItem("nexis_chat_history", JSON.stringify(chats))
            const chatToSync = chats.find(c => c.id === currentChatId)
            if (chatToSync) {
                fetch("/api/chat/sync", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(chatToSync)
                }).catch(err => console.error("Sync error", err))
            }
        }
    }, [chats, isHistoryLoaded, currentChatId])

    useEffect(() => {
        if (messages.length > 0 && !isLoading) {
            setChats(prev => {
                const existingIndex = prev.findIndex(c => c.id === currentChatId);
                if (existingIndex === -1) {
                    const firstUserMessage = messages.find((m: any) => m.role === 'user');
                    if (firstUserMessage) {
                        const title = firstUserMessage.content.slice(0, 40) + (firstUserMessage.content.length > 40 ? "..." : "");
                        return [{
                            id: currentChatId,
                            title,
                            messages: [...messages],
                            type: projectMode ? "project" : "standard",
                            mode: projectMode || undefined
                        }, ...prev];
                    }
                    return prev;
                } else {
                    const currentChat = prev[existingIndex];
                    if (currentChat.messages.length !== messages.length ||
                        currentChat.messages[currentChat.messages.length - 1]?.content !== messages[messages.length - 1]?.content) {
                        const updatedValue = [...prev];
                        updatedValue[existingIndex] = { ...currentChat, messages: [...messages] };
                        return updatedValue;
                    }
                    return prev;
                }
            });
        }
    }, [messages, currentChatId, projectMode, isLoading]);

    const handleNewChat = (type: "standard" | "project" = "standard") => {
        setMessages([]);
        setInput("");
        const newId = Date.now().toString();
        setCurrentChatId(newId);
        if (type === "standard") setProjectMode(null);
        else if (!projectMode) setProjectMode("research");
    };

    const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
        e.stopPropagation();
        setChats(prev => prev.filter(c => c.id !== chatId));
        if (currentChatId === chatId) handleNewChat("standard");
        toast.success("Chat deleted");
    };

    useEffect(() => {
        if (messages.length === 0 && !hasTriggeredInit.current && !initialQuery) {
            handleNewChat("standard");
        }
    }, []);

    const { isListening, transcript, startListening, stopListening, setTranscript: setSpeechTranscript } = useSpeechRecognition()

    useEffect(() => {
        if (transcript) {
            setInput((prev: string) => prev + (prev.length > 0 && !prev.endsWith(" ") ? " " : "") + transcript)
            setSpeechTranscript("")
        }
    }, [transcript, setInput, setSpeechTranscript])

    useEffect(() => {
        if (initialQuery && !hasTriggeredInit.current) {
            append({ role: "user", content: initialQuery })
            hasTriggeredInit.current = true
        }
    }, [initialQuery, append])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    return (
        <div className="flex h-screen bg-transparent text-foreground font-sans selection:bg-primary/30 selection:text-foreground overflow-hidden relative">
            <AnimatedBackground className="pointer-events-none" />

            <AnimatePresence mode="wait">
                {voiceMode ? (
                    <motion.div
                        key="voice-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
                    >
                        <AnimatedBackground className="opacity-100" />
                        <div className="absolute inset-0 bg-background/40 backdrop-blur-3xl" />
                        <div className="relative z-10 w-full">
                            <Conversation onClose={() => setVoiceMode(false)} />
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="chat-layout"
                        initial={{ opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.3 }}
                        className="flex w-full h-full"
                    >
                        {/* Sidebar */}
                        <div className={cn(
                            "fixed inset-y-0 left-0 z-30 flex flex-col border-r border-border/40 bg-sidebar/70 backdrop-blur-xl transition-all duration-300 shadow-sm md:relative md:shadow-none",
                            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
                            sidebarOpen ? "w-[260px]" : "w-[0px] opacity-0 overflow-hidden"
                        )}>
                            {sidebarOpen && (
                                <>
                                    <div className="px-5 pt-6 pb-2 flex items-center justify-between">
                                        <h1 className="text-lg font-bold tracking-tight text-foreground/90">VULCARIS</h1>
                                        <button onClick={() => setSidebarOpen(false)} className="text-muted-foreground hover:text-foreground p-1.5 hover:bg-secondary rounded-full">
                                            <PanelLeftClose className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="px-3 py-2">
                                        <button onClick={() => handleNewChat("standard")} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-sidebar-accent border border-border/20 rounded-xl transition-all group">
                                            <Plus className="w-4 h-4 text-primary" />
                                            <span>New Chat</span>
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
                                        <div>
                                            <div className="px-4 mb-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Projects</div>
                                            <div className="space-y-0.5">
                                                {chats.filter(c => c.type === "project").map(chat => (
                                                    <div key={chat.id} onClick={() => { setCurrentChatId(chat.id); setMessages(chat.messages); }} className={cn("px-4 py-2 text-sm rounded-xl cursor-pointer transition-all truncate flex items-center gap-3", currentChatId === chat.id ? "bg-secondary text-primary font-medium" : "text-foreground/70 hover:bg-secondary/50")}>
                                                        <Layers className="w-4 h-4 opacity-70" />
                                                        <span className="truncate">{chat.title}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="px-4 mb-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Recent</div>
                                            <div className="space-y-0.5">
                                                {chats.filter(c => c.type === "standard").map(chat => (
                                                    <div key={chat.id} onClick={() => { setCurrentChatId(chat.id); setMessages(chat.messages); }} className={cn("group relative px-4 py-2 text-sm rounded-xl cursor-pointer transition-all truncate", currentChatId === chat.id ? "bg-secondary text-primary font-medium" : "text-foreground/70 hover:bg-secondary/50")}>
                                                        <div className="truncate pr-6">{chat.title}</div>
                                                        <button onClick={(e) => handleDeleteChat(e, chat.id)} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 hover:text-destructive p-1 rounded-md transition-all">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-3 border-t border-border/20">
                                        <ProfileMenu />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Main Content Area */}
                        <div className="flex-1 flex flex-col min-w-0 bg-transparent relative overflow-hidden">
                            {!sidebarOpen && (
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="fixed top-4 left-4 z-40 p-2.5 bg-secondary/80 backdrop-blur-xl border border-border/20 rounded-full text-muted-foreground hover:text-foreground shadow-xl transition-all hover:scale-105 active:scale-95"
                                >
                                    <PanelLeftOpen className="w-5 h-5" />
                                </button>
                            )}

                            <div className="flex-1 flex flex-col relative overflow-hidden">
                                <div ref={scrollRef} className={cn("flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-hide", messages.length === 0 ? "opacity-0" : "opacity-100")}>
                                    <div className="pb-40 max-w-3xl mx-auto space-y-6">
                                        {messages.map((m: any) => (
                                            <div key={m.id} className={cn("flex w-full animate-in fade-in slide-in-from-bottom-2", m.role === "assistant" ? "justify-start" : "justify-end")}>
                                                <div className={cn("max-w-[75%] rounded-[20px] px-4 py-2.5 text-[15px] leading-snug shadow-sm", m.role === "assistant" ? "bg-[#2C2C2E] text-white rounded-tl-md" : "bg-[#007AFF] text-white rounded-br-md")}>
                                                    {m.content.replace(/\[MEMORY: .*?\]/g, "")}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className={cn("absolute transition-all duration-700 w-full flex flex-col items-center justify-center p-4", messages.length === 0 ? "top-[40%] left-0" : "bottom-0 pb-6")}>
                                    <div className="w-full max-w-3xl flex flex-col gap-8">
                                        <div className={cn("text-center space-y-3 transition-opacity duration-700", messages.length > 0 ? "opacity-0 pointer-events-none" : "opacity-100")}>
                                            <h1 className="text-4xl md:text-5xl font-[800] tracking-tight">How are you doing, <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">{userName}</span>?</h1>
                                        </div>

                                        <form onSubmit={handleSubmit} className="w-full flex items-center gap-3 bg-secondary/80 backdrop-blur-xl border border-border/20 px-4 py-2.5 shadow-2xl rounded-[32px]">
                                            <button type="button" className="p-1.5 text-muted-foreground hover:text-foreground rounded-full"><Plus className="w-5 h-5" /></button>
                                            <div className="flex-1 flex flex-col justify-center">
                                                <textarea value={input} onChange={handleInputChange} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e as any); } }} placeholder="Message AI..." className="w-full bg-transparent border-none outline-none text-[15px] resize-none py-1.5" rows={1} disabled={isLoading} />
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <button type="button" onClick={() => setVoiceMode(true)} className="p-2.5 text-muted-foreground hover:text-primary rounded-full"><Headphones className="w-5 h-5" /></button>
                                                <button type="button" onClick={isListening ? stopListening : startListening} className={cn("p-2.5 rounded-full", isListening && "text-destructive text-red-500")}><Mic className={cn("w-5 h-5", isListening && "animate-pulse")} /></button>
                                                <button type="submit" disabled={!input.trim() || isLoading} className={cn("p-2.5 rounded-full", input.trim() ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}><Send className="w-4 h-4" /></button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </div>
    )
}

export default function ChatPage() {
    return (
        <Suspense fallback={
            <div className="h-screen w-screen bg-[#050505] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
        }>
            <ChatContent />
        </Suspense>
    )
}
