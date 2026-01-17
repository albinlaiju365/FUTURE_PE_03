"use client"

import { useState, useRef, useEffect, useMemo, Suspense } from "react"
import { useChat } from "@ai-sdk/react"
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
    Folder
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"

import { ProfileMenu } from "@/components/profile-menu"

function ChatContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const initialQuery = searchParams.get("q")

    useEffect(() => {
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
        if (!isLoggedIn) {
            router.push("/")
        }
    }, [router])

    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [sidebarView, setSidebarView] = useState<"explorer" | "search" | "git" | "settings" | "database" | "layers">("explorer")
    const [activeTab, setActiveTab] = useState("chat.tsx")
    const [isEnhancing, setIsEnhancing] = useState(false)
    const [projectMode, setProjectMode] = useState<"research" | "web" | null>(null)

    const chatConfig = useMemo(() => ({
        body: { projectMode }
    }), [projectMode])

    const { messages, input, handleInputChange, handleSubmit, isLoading, append, setInput, setMessages } = useChat(chatConfig) as any
    const scrollRef = useRef<HTMLDivElement>(null)
    const hasTriggeredInit = useRef(false)

    // Dynamic History State
    const [chats, setChats] = useState<{ id: string; title: string; messages: any[]; type: "standard" | "project"; mode?: "research" | "web" }[]>([])
    const [currentChatId, setCurrentChatId] = useState(Date.now().toString())

    // Auto-generate title and sync history ONLY when message is finished
    useEffect(() => {
        if (messages.length > 0 && !isLoading) {
            setChats(prev => {
                const existingIndex = prev.findIndex(c => c.id === currentChatId);

                // If this is a new thread, generate the title
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
                    // Update messages in existing chat ONLY if they actually changed
                    // This prevents re-renders when navigating history
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
        const isProject = type === "project" || (type === "standard" && projectMode);
        const greeting = isProject
            ? "EUREKA! 🛠️ The laboratory is ready. What revolutionary project shall we architect today? ⚙️"
            : "Yo! NEXIS is online. 🚀 Ready to crush some code? What's on your mind today? ✨";

        setMessages([
            { id: Date.now().toString(), role: "assistant", content: greeting }
        ]);
        setInput("");
        const newId = Date.now().toString();
        setCurrentChatId(newId);
        setActiveTab("chat.tsx");

        if (type === "standard") {
            setProjectMode(null);
        } else if (!projectMode) {
            setProjectMode("research");
        }
    };

    // Initial greeting on load
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

    const handleEnhance = async () => {
        if (!input.trim() || isEnhancing) return
        setIsEnhancing(true)
        try {
            const res = await fetch("/api/enhance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: input }),
            })
            const data = await res.json()
            if (data.enhanced) {
                setInput(data.enhanced)
            }
        } catch (err) {
            console.error("Enhance failed:", err)
        } finally {
            setIsEnhancing(false)
        }
    }


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

    // If we have an initial query from the URL, trigger the first chat automatically?
    // Actually initialMessages handles it if we pass it, but useChat might not trigger the API call immediately.
    // For now let's just let it show the initial message.

    return (
        <div className="flex h-screen bg-[#050505] text-foreground font-mono selection:bg-accent selection:text-background overflow-hidden">
            {/* Activity Bar (Slim Left) */}
            <div className="w-12 border-r border-border/40 flex flex-col items-center py-4 gap-6 bg-[#080808] z-20">
                <Link href="/">
                    <Cpu className="w-6 h-6 text-accent animate-pulse" />
                </Link>
                <div className="flex flex-col gap-5 mt-4">
                    <div onClick={() => { setSidebarView("explorer"); setSidebarOpen(true) }} className={cn("cursor-pointer transition-colors", sidebarView === "explorer" ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>
                        <MessageSquare className="w-5 h-5" />
                    </div>
                    <div onClick={() => { setSidebarView("search"); setSidebarOpen(true) }} className={cn("cursor-pointer transition-colors", sidebarView === "search" ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>
                        <Search className="w-5 h-5" />
                    </div>
                    <div onClick={() => { setSidebarView("git"); setSidebarOpen(true) }} className={cn("cursor-pointer transition-colors", sidebarView === "git" ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>
                        <Github className="w-5 h-5" />
                    </div>
                    <div onClick={() => { setSidebarView("database"); setSidebarOpen(true) }} className={cn("cursor-pointer transition-colors", sidebarView === "database" ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>
                        <Database className="w-5 h-5" />
                    </div>
                    <div onClick={() => { setSidebarView("layers"); setSidebarOpen(true) }} className={cn("cursor-pointer transition-colors", sidebarView === "layers" ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>
                        <Layers className="w-5 h-5" />
                    </div>
                </div>
                <div className="mt-auto flex flex-col items-center gap-4 pb-2">
                    <ProfileMenu />
                    <button className="p-2 text-muted-foreground/30 hover:text-accent transition-colors">
                        <span className="font-[var(--font-bebas)] text-lg">N</span>
                    </button>
                </div>
            </div>

            {/* Sidebar (Explorer) */}
            {sidebarOpen && (
                <div className="w-64 border-r border-border/40 bg-[#0a0a0a] flex flex-col animate-in slide-in-from-left duration-300">
                    <div className="px-4 py-3 border-b border-border/40 flex justify-between items-center bg-[#0d0d0d]">
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                            {sidebarView === "explorer" && "EXPLORER: NEXIS_OS"}
                            {sidebarView === "search" && "SEARCH: GLOBAL"}
                            {sidebarView === "git" && "SOURCE_CONTROL"}
                            {sidebarView === "settings" && "SYSTEM_CONFIG"}
                            {sidebarView === "database" && "DATA_GRIDS"}
                            {sidebarView === "layers" && "ARCH_LAYERS"}
                        </span>
                        <div onClick={() => setSidebarOpen(false)} className="cursor-pointer hover:text-accent transition-colors">
                            <X className="w-3 h-3 text-muted-foreground" />
                        </div>
                    </div>

                    {sidebarView === "explorer" && (
                        <div className="flex-1 flex flex-col min-h-0 bg-[#0a0a0a]">
                            {/* Top Actions */}
                            <div className="p-3 space-y-1">
                                <button
                                    onClick={() => handleNewChat("standard")}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-white/5 rounded-lg transition-all group border border-border/20 hover:border-accent/40 bg-accent/5"
                                >
                                    <SquarePen className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
                                    <span className="font-medium">New chat</span>
                                </button>
                                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground/70 hover:text-foreground hover:bg-white/5 rounded-lg transition-colors group">
                                    <Search className="w-4 h-4 text-muted-foreground group-hover:text-accent" />
                                    <span>Search chats</span>
                                </button>

                                {/* Project History List */}
                                <div className="mt-6 space-y-0.5">
                                    <div className="flex items-center justify-between px-3 mb-2">
                                        <div className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">Project Threads</div>
                                        <button
                                            onClick={() => handleNewChat("project")}
                                            className="p-1 hover:bg-accent/10 text-accent/60 hover:text-accent rounded transition-colors group"
                                            title="New project thread"
                                        >
                                            <Plus className="w-3 h-3 group-hover:scale-110 transition-transform" />
                                        </button>
                                    </div>
                                    {chats.filter(c => c.type === "project").length === 0 ? (
                                        <div className="px-3 py-2 text-[9px] text-muted-foreground/30 italic uppercase">No project activity</div>
                                    ) : (
                                        chats.filter(c => c.type === "project").map((chat) => (
                                            <div
                                                key={chat.id}
                                                onClick={() => {
                                                    setCurrentChatId(chat.id);
                                                    setMessages(chat.messages);
                                                    setProjectMode(chat.mode || "research");
                                                    setActiveTab("chat.tsx");
                                                }}
                                                className={cn(
                                                    "px-3 py-2 text-[11px] rounded-lg cursor-pointer transition-all truncate border",
                                                    currentChatId === chat.id
                                                        ? "bg-accent/5 border-accent/30 text-accent"
                                                        : "text-muted-foreground/70 hover:text-foreground hover:bg-white/5 border-transparent hover:border-border/40"
                                                )}
                                            >
                                                {chat.title}
                                            </div>
                                        ))
                                    )}
                                    <button
                                        onClick={() => handleNewChat("project")}
                                        className="w-full flex items-center gap-2 mt-2 px-3 py-2 text-[10px] text-accent/80 hover:text-accent bg-accent/5 hover:bg-accent/10 border border-accent/20 rounded-lg transition-all"
                                    >
                                        <Plus className="w-3 h-3" />
                                        <span>NEW PROJECT THREAD</span>
                                    </button>
                                </div>
                            </div>

                            {/* History Section */}
                            <div className="flex-1 overflow-y-auto mt-4 px-3 scrollbar-hide">
                                <div className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em] px-3 mb-2">Your chats</div>
                                <div className="space-y-0.5 pb-20">
                                    {chats.filter(c => c.type === "standard").length === 0 ? (
                                        <div className="px-3 py-4 text-[10px] text-muted-foreground/40 italic uppercase">No recent activity</div>
                                    ) : (
                                        chats.filter(c => c.type === "standard").map((chat) => (
                                            <div
                                                key={chat.id}
                                                onClick={() => {
                                                    setCurrentChatId(chat.id);
                                                    setMessages(chat.messages);
                                                    setProjectMode(null);
                                                    setActiveTab("chat.tsx");
                                                }}
                                                className={cn(
                                                    "px-3 py-2.5 text-xs rounded-lg cursor-pointer transition-all truncate border",
                                                    currentChatId === chat.id
                                                        ? "bg-accent/10 border-accent/20 text-foreground"
                                                        : "text-muted-foreground hover:text-foreground hover:bg-white/5 border-transparent hover:border-border/40"
                                                )}
                                            >
                                                {chat.title}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {sidebarView === "search" && (
                        <div className="p-4 space-y-4">
                            <div className="bg-[#050505] border border-border/40 flex items-center px-3 py-2 gap-2">
                                <Search className="w-4 h-4 text-muted-foreground" />
                                <input className="bg-transparent border-none outline-none text-xs w-full font-mono placeholder:text-muted-foreground/50" placeholder="Search knowledge base..." />
                            </div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider text-center pt-10">
                                Indexing Complete. 0 Results.
                            </div>
                        </div>
                    )}

                    {sidebarView === "git" && (
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] uppercase">Changes</span>
                                <span className="text-[10px] bg-accent/20 text-accent px-1.5 rounded-full">2</span>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-xs text-yellow-500/80 px-2 py-1 hover:bg-foreground/5 cursor-pointer">
                                    <span className="w-2 h-2 rounded-full bg-yellow-500" />
                                    app/chat/page.tsx
                                    <span className="ml-auto text-[10px] text-muted-foreground">M</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-green-500/80 px-2 py-1 hover:bg-foreground/5 cursor-pointer">
                                    <span className="w-2 h-2 rounded-full bg-green-500" />
                                    hooks/use-ai.ts
                                    <span className="ml-auto text-[10px] text-muted-foreground">U</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {sidebarView === "settings" && (
                        <div className="p-4 space-y-2">
                            {["Appearance", "Model Configuration", "Voice Settings", "API Keys"].map(setting => (
                                <div key={setting} className="px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-foreground/5 cursor-pointer transition-colors">
                                    {setting}
                                </div>
                            ))}
                        </div>
                    )}

                    {sidebarView === "database" && (
                        <div className="p-4 space-y-4">
                            <div className="text-[10px] uppercase text-muted-foreground mb-2">Connected: postgres_prod</div>
                            <div className="space-y-1">
                                {["users", "chats", "memories", "embeddings"].map(table => (
                                    <div key={table} className="flex items-center gap-2 text-xs text-foreground/80 cursor-pointer hover:text-accent">
                                        <Database className="w-3 h-3 text-muted-foreground" />
                                        {table}
                                        <span className="ml-auto text-[9px] text-muted-foreground">14.2MB</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {sidebarView === "layers" && (
                        <div className="p-4">
                            <div className="flex flex-col gap-2">
                                {["Presentation Layer", "Logic Grid", "Data Storage", "AI Inference"].map((layer, i) => (
                                    <div key={layer} className="p-2 border border-border/40 rounded bg-muted/5 text-xs text-center hover:border-accent cursor-pointer transition-colors">
                                        {layer}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#050505] relative">
                {/* Header Tabs */}
                <div className="h-10 border-b border-border/40 bg-[#0d0d0d] flex items-center px-2 z-10">
                    <div className="flex items-center gap-px h-full">
                        <div className="flex items-center gap-px h-full overflow-x-auto scrollbar-hide">
                            {["chat.tsx"].map((tab) => (
                                <div
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={cn(
                                        "h-full px-4 flex items-center gap-2 text-[10px] uppercase tracking-wider cursor-pointer border-t-2 transition-all flex-shrink-0",
                                        activeTab === tab
                                            ? "bg-[#050505] border-accent text-accent"
                                            : "bg-transparent border-transparent text-muted-foreground hover:bg-foreground/5"
                                    )}
                                >
                                    <span className="opacity-50">
                                        <Code2 className="w-3 h-3" />
                                    </span>
                                    {tab}
                                    {activeTab === tab && <X className="w-3 h-3 ml-2 hover:bg-foreground/10" />}
                                </div>
                            ))}
                        </div>
                        <div className="ml-auto flex items-center gap-4 px-4 h-full border-l border-border/40">
                            <span className="text-[10px] text-muted-foreground/60">NODE: 0xFF92</span>
                            <Maximize2 className="w-3 h-3 text-muted-foreground cursor-pointer" />
                        </div>
                    </div>
                </div>

                {/* Chat Display & Input Area Container */}
                <div className="flex-1 flex flex-col min-h-0 relative">
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 scrollbar-hide"
                    >
                        {activeTab === "chat.tsx" && (
                            <>
                                {messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center opacity-20">
                                        <Cpu className="w-16 h-16 mb-6" />
                                        <p className="text-xl uppercase tracking-[0.3em]">System Standby</p>
                                        <p className="mt-2 text-xs uppercase tracking-[0.2em]">Awaiting Instruction Input...</p>
                                    </div>
                                ) : (
                                    <div className="max-w-4xl mx-auto space-y-12 pb-4">
                                        {messages.map((m: any) => (
                                            <div key={m.id} className="group relative animate-in fade-in slide-in-from-bottom-2 duration-500">
                                                <div className="flex items-start gap-6">
                                                    <div className={cn(
                                                        "w-8 h-8 flex-shrink-0 flex items-center justify-center border",
                                                        m.role === "user" ? "border-muted-foreground/30 bg-muted/5" : "border-accent/40 bg-accent/5 text-accent"
                                                    )}>
                                                        {m.role === "user" ? <Command className="w-4 h-4" /> : <Cpu className="w-4 h-4" />}
                                                    </div>
                                                    <div className="flex-1 space-y-2">
                                                        <div className="flex items-center gap-3">
                                                            <span className={cn(
                                                                "text-[10px] uppercase tracking-widest font-bold",
                                                                m.role === "user" ? "text-muted-foreground" : "text-accent"
                                                            )}>
                                                                {m.role === "user" ? "USER_PROMPT" : (projectMode ? "INVENTOR_RESPONSE" : "NEXIS_RESPONSE")}
                                                            </span>
                                                            <span className="text-[9px] text-muted-foreground/40">{new Date().toLocaleTimeString()}</span>
                                                        </div>
                                                        <div className={cn(
                                                            "text-sm leading-relaxed whitespace-pre-wrap font-sans",
                                                            m.role === "user" ? "text-foreground/80" : "text-foreground"
                                                        )}>
                                                            {m.content}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="absolute -left-12 top-0 bottom-0 w-[1px] bg-border/20 group-hover:bg-accent/40 transition-colors" />
                                            </div>
                                        ))}
                                        {isLoading && (
                                            <div className="flex items-start gap-6 animate-pulse">
                                                <div className="w-8 h-8 border border-accent/40 bg-accent/5 flex items-center justify-center text-accent">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                </div>
                                                <div className="flex-1 space-y-3">
                                                    <div className="h-2 w-24 bg-accent/20 rounded-full" />
                                                    <div className="space-y-2">
                                                        <div className="h-2 w-full bg-foreground/10 rounded-full" />
                                                        <div className="h-2 w-[80%] bg-foreground/10 rounded-full" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Input Bar - Standard Flow */}
                    {activeTab === "chat.tsx" && (
                        <div className="p-6 bg-[#050505] border-t border-border/20 z-20 shrink-0">
                            <form
                                onSubmit={handleSubmit}
                                className="max-w-4xl mx-auto flex items-end gap-2 bg-[#0d0d0d] border border-border/60 focus-within:border-accent p-2 transition-all shadow-2xl"
                            >
                                <div className="flex-1 min-h-[44px] flex flex-col justify-center px-4">
                                    <textarea
                                        value={input}
                                        onChange={handleInputChange}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault()
                                                handleSubmit(e as any)
                                            }
                                        }}
                                        placeholder="EXECUTE INSTRUCTION..."
                                        className="w-full bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground/40 resize-none max-h-48 py-2 scrollbar-hide"
                                        rows={1}
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={handleEnhance}
                                        disabled={isEnhancing || !input.trim() || isLoading}
                                        className={cn(
                                            "p-3 text-muted-foreground hover:text-accent transition-colors relative",
                                            isEnhancing && "text-accent animate-pulse"
                                        )}
                                        title="Enhance Prompt"
                                    >
                                        {isEnhancing ? <Loader2 className="w-4 h-4 animate-spin text-accent" /> : <Wand2 className="w-4 h-4" />}
                                        {isEnhancing && <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-accent animate-ping" />}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={isListening ? stopListening : startListening}
                                        className={cn(
                                            "p-3 transition-colors relative",
                                            isListening ? "text-destructive hover:text-destructive/80" : "text-muted-foreground hover:text-accent"
                                        )}
                                        title={isListening ? "Stop Listening" : "Voice Input"}
                                    >
                                        <Mic className={cn("w-4 h-4", isListening && "animate-pulse")} />
                                        {isListening && <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-destructive animate-ping" />}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!input.trim() || isLoading}
                                        className="p-3 bg-accent text-background hover:bg-white transition-all disabled:opacity-30 flex items-center justify-center"
                                    >
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    </button>
                                </div>
                            </form>
                            <div className="max-w-4xl mx-auto mt-2 flex justify-between items-center px-2">
                                <span className="text-[8px] uppercase tracking-widest text-muted-foreground/50">
                                    Neural Link: Active // Empathy Engine: Online // Model: {projectMode === "research" ? "NEXIS RESEARCH O1" : projectMode === "web" ? "NEXIS WEB INTEL" : "NEXIS Prime"}
                                </span>
                                <span className="text-[8px] uppercase tracking-widest text-muted-foreground/50">
                                    © NEXIS INTELLIGENCE 2025
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
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
