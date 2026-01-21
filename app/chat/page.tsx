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
    Folder,
    Trash2
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { HackerText } from "@/components/hacker-text"

import { ProfileMenu } from "@/components/profile-menu"

function ChatContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const initialQuery = searchParams.get("q")

    // Auth redirect managed by middleware.ts now
    // useEffect(() => {
    //     const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    //     if (!isLoggedIn) {
    //         router.push("/")
    //     }
    // }, [router])

    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [sidebarView, setSidebarView] = useState<"explorer" | "search" | "git" | "settings" | "database" | "layers">("explorer")
    const [activeTab, setActiveTab] = useState("chat.tsx")
    const [isEnhancing, setIsEnhancing] = useState(false)
    const [projectMode, setProjectMode] = useState<"research" | "web" | null>(null)
    const [persona, setPersona] = useState("nexis")

    // Load memories for context
    const [memories, setMemories] = useState<string[]>([])
    useEffect(() => {
        const saved = localStorage.getItem("ai_memories")
        if (saved) setMemories(JSON.parse(saved))

        const savedPersona = localStorage.getItem("nexis_persona")
        if (savedPersona) setPersona(savedPersona)

        // Listen for storage events (Settings changes)
        const handleStorage = () => {
            const newPersona = localStorage.getItem("nexis_persona")
            if (newPersona) setPersona(newPersona)
        }
        window.addEventListener("storage", handleStorage)
        return () => window.removeEventListener("storage", handleStorage)
    }, [])

    const chatConfig = useMemo(() => ({
        body: { projectMode, memories, persona },
        onFinish: (message: any) => {
            // Parse [MEMORY: ...] tags
            const content = message.content;
            const memoryMatch = content.match(/\[MEMORY: (.*?)\]/);

            if (memoryMatch && memoryMatch[1]) {
                const fact = memoryMatch[1];
                const currentMemories = JSON.parse(localStorage.getItem("ai_memories") || "[]");

                if (!currentMemories.includes(fact)) {
                    const updated = [...currentMemories, fact];
                    localStorage.setItem("ai_memories", JSON.stringify(updated));
                    setMemories(updated);
                    // toast.custom((t) => (
                    //     <div className="bg-accent/10 border border-accent/20 text-accent px-4 py-2 rounded-full text-xs font-mono flex items-center gap-2">
                    //         <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    //         Memory Core Updated: "{fact}"
                    //     </div>
                    // ), { duration: 3000 });
                }
            }
        }
    }), [projectMode, memories])

    const { messages, input, handleInputChange, handleSubmit, isLoading, append, setInput, setMessages } = useChat(chatConfig) as any
    const scrollRef = useRef<HTMLDivElement>(null)
    const hasTriggeredInit = useRef(false)

    // Dynamic History State
    const [chats, setChats] = useState<{ id: string; title: string; messages: any[]; type: "standard" | "project"; mode?: "research" | "web" }[]>([])
    const [currentChatId, setCurrentChatId] = useState(Date.now().toString())
    const [isHistoryLoaded, setIsHistoryLoaded] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    // Load history on mount (Local + Cloud)
    useEffect(() => {
        const loadHistory = async () => {
            let localChats: any[] = []
            try {
                const saved = localStorage.getItem("nexis_chat_history")
                if (saved) {
                    localChats = JSON.parse(saved)
                }
            } catch (e) {
                console.error("Failed to parse local chat history")
            }

            try {
                // Fetch Cloud Chats
                const res = await fetch("/api/chat/sync")
                if (res.ok) {
                    const data = await res.json()
                    if (data.chats && Array.isArray(data.chats)) {
                        // Merge Strategy: specialized simple merge based on ID
                        // Prioritize Cloud for conflict, but keep local-only chats
                        const cloudMap = new Map(data.chats.map((c: any) => [c.id, c]))
                        const localMap = new Map(localChats.map((c: any) => [c.id, c]))

                        // Combine IDs
                        const allIds = new Set([...cloudMap.keys(), ...localMap.keys()])
                        const mergedChats: any[] = []

                        allIds.forEach(id => {
                            const cloud = cloudMap.get(id)
                            const local = localMap.get(id)

                            // If exists in both, use the one with later update (or cloud if timestamps missing)
                            // For simplicity, we just take cloud if available as "truth"
                            if (cloud) {
                                mergedChats.push(cloud)
                            } else if (local) {
                                mergedChats.push(local)
                                // It's in local but not cloud => push to cloud background
                                fetch("/api/chat/sync", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(local)
                                })
                            }
                        })

                        // Sort by updated_at or default to created order (reverse of push usually)
                        // But since we don't have explicit dates on all old local chats, we can rely on order
                        // data.chats comes ordered from DB.
                        setChats(data.chats.length > 0 ? data.chats : localChats)
                    } else {
                        // No cloud chats, but we have local? Sync up.
                        if (localChats.length > 0) {
                            setChats(localChats)
                            fetch("/api/chat/sync", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(localChats)
                            })
                        }
                    }
                } else {
                    // Fallback to local
                    setChats(localChats)
                }
            } catch (error) {
                console.error("Cloud sync failed, using local", error)
                setChats(localChats)
            } finally {
                setIsHistoryLoaded(true)
            }
        }

        loadHistory()
    }, [])

    // Save history whenever it changes
    useEffect(() => {
        if (isHistoryLoaded) {
            // Local Save
            localStorage.setItem("nexis_chat_history", JSON.stringify(chats))

            // Cloud Save (Debounced ideally, but here we just fire for simplicity of the prototype)
            // We only save the *current* chat if it changed, or we can just push the whole state?
            // Pushing whole state array is heavy. 
            // Better: find the active chat and save it.
            // But 'chats' array updates are what triggers this.

            // Optimization: Only sync if we have a valid chat ID and content
            // We can just sync the *entire* list for now as per the bulk endpoint we made
            // OR finding the modified chat is better but let's be robust first.
            if (chats.length > 0) {
                // To avoid spamming, we could use a ref to track last save time, but for now:
                // We will sync the recently modified chat.
                const chatToSync = chats.find(c => c.id === currentChatId)
                if (chatToSync) {
                    fetch("/api/chat/sync", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(chatToSync)
                    }).catch(err => console.error("Background sync error", err))
                }
            }
        }
    }, [chats, isHistoryLoaded, currentChatId])

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

    const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
        e.stopPropagation();
        setChats(prev => prev.filter(c => c.id !== chatId));

        if (currentChatId === chatId) {
            handleNewChat("standard");
        }

        toast.promise(Promise.resolve(), {
            loading: 'Deleting...',
            success: 'Chat deleted',
            error: 'Failed to delete'
        });
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
            {/* Unified Sidebar (ChatGPT Style) */}
            {sidebarOpen && (
                <div className="fixed inset-y-0 left-0 z-30 w-[260px] border-r border-border/40 bg-[#080808] flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out slide-in-from-left duration-300 shadow-2xl md:relative md:shadow-none">
                    {/* Mobile Header */}
                    <div className="md:hidden px-4 py-3 border-b border-border/40 flex justify-between items-center bg-[#0d0d0d]">
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Menu</span>
                        <div onClick={() => setSidebarOpen(false)} className="cursor-pointer hover:text-accent transition-colors">
                            <X className="w-4 h-4 text-muted-foreground" />
                        </div>
                    </div>

                    {/* New Chat & Actions */}
                    <div className="p-3">
                        <button
                            onClick={() => handleNewChat("standard")}
                            className="w-full flex items-center gap-3 px-3 py-3 text-sm text-foreground hover:bg-white/5 rounded-lg transition-all border border-border/20 hover:border-accent/40 bg-[#0a0a0a] group"
                        >
                            <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                                <Plus className="w-4 h-4 text-accent" />
                            </div>
                            <span className="font-medium">New chat</span>
                            <SquarePen className="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    </div>

                    {/* Scrollable Chat History */}
                    <div className="flex-1 overflow-y-auto px-3 py-2 scrollbar-hide space-y-4">

                        {/* Project Threads Group */}
                        <div>
                            <div className="px-3 mb-2 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest flex items-center justify-between group cursor-pointer hover:text-foreground transition-colors">
                                <span>Project Threads</span>
                            </div>
                            <div className="space-y-0.5">
                                {chats.filter(c => c.type === "project").length === 0 ? (
                                    <div className="px-3 py-1 text-[10px] text-muted-foreground/30 italic">No active projects</div>
                                ) : (
                                    chats.filter(c => c.type === "project").map((chat) => (
                                        <div
                                            key={chat.id}
                                            onClick={() => {
                                                setCurrentChatId(chat.id);
                                                setMessages(chat.messages);
                                                setProjectMode(chat.mode || "research");
                                                setActiveTab("chat.tsx");
                                                if (window.innerWidth < 768) setSidebarOpen(false);
                                            }}
                                            className={cn(
                                                "group relative px-3 py-2 text-xs rounded-md cursor-pointer transition-all truncate flex items-center gap-2",
                                                currentChatId === chat.id
                                                    ? "bg-accent/10 text-accent"
                                                    : "text-muted-foreground/80 hover:bg-white/5 hover:text-foreground"
                                            )}
                                        >
                                            <Layers className="w-3.5 h-3.5 opacity-70" />
                                            <div className="truncate flex-1">{chat.title}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Recent Chats Group */}
                        <div>
                            <div className="px-3 mb-2 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Recents</div>
                            <div className="space-y-0.5">
                                {chats.filter(c => c.type === "standard").map((chat) => (
                                    <div
                                        key={chat.id}
                                        onClick={() => {
                                            setCurrentChatId(chat.id);
                                            setMessages(chat.messages);
                                            setProjectMode(null);
                                            setActiveTab("chat.tsx");
                                            if (window.innerWidth < 768) setSidebarOpen(false);
                                        }}
                                        className={cn(
                                            "group relative px-3 py-2 text-xs rounded-md cursor-pointer transition-all truncate",
                                            currentChatId === chat.id
                                                ? "bg-accent/10 text-accent"
                                                : "text-muted-foreground/80 hover:bg-white/5 hover:text-foreground"
                                        )}
                                    >
                                        <div className="truncate pr-6">{chat.title}</div>
                                        <button
                                            onClick={(e) => handleDeleteChat(e, chat.id)}
                                            className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 hover:text-red-500 p-1.5 rounded transition-all"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                                {chats.filter(c => c.type === "standard").length === 0 && (
                                    <div className="px-3 py-1 text-[10px] text-muted-foreground/30 italic">No recent chats</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer / User Profile */}
                    <div className="p-3 border-t border-border/40 mt-auto bg-[#0a0a0a]">
                        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group">
                            <div className="w-8 h-8 rounded bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 flex items-center justify-center">
                                <span className="font-[var(--font-bebas)] text-lg text-accent">V</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium truncate group-hover:text-accent transition-colors">VULCARIS User</div>
                                <div className="text-[10px] text-muted-foreground truncate">Pro Plan Active</div>
                            </div>
                            <Settings className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </div>
                        <div className="mt-2 flex justify-between items-center px-1">
                            <ProfileMenu />
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#050505] relative">
                {/* Header Tabs */}
                <div className="h-10 border-b border-border/40 bg-[#0d0d0d] flex items-center px-2 z-10 gap-2">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="md:hidden p-1 text-muted-foreground hover:text-foreground"
                    >
                        <Menu className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-px h-full overflow-hidden">
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
                        className="flex-1 overflow-y-auto p-4 md:p-12 space-y-8 scrollbar-hide"
                    >
                        {activeTab === "chat.tsx" && (
                            <>
                                {messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center p-4">
                                        <div className="w-full max-w-2xl flex flex-col items-center gap-8 animate-in fade-in zoom-in-95 duration-500">
                                            {/* Hero Logo */}
                                            <div className="text-center space-y-2">
                                                <h1 className="font-[var(--font-bebas)] text-6xl md:text-8xl tracking-wider text-foreground">
                                                    VULCARIS
                                                </h1>
                                                <p className="font-mono text-xs md:text-sm text-muted-foreground/60 tracking-[0.2em] uppercase">
                                                    Enterprise Conversational Intelligence
                                                </p>
                                            </div>

                                            {/* Centered Input Form */}
                                            <div className="w-full">
                                                <form
                                                    onSubmit={handleSubmit}
                                                    className="w-full flex items-end gap-2 bg-[#0d0d0d] border border-border/60 focus-within:border-accent p-3 transition-all shadow-2xl rounded-xl"
                                                >
                                                    <div className="flex-1 min-h-[44px] flex flex-col justify-center px-2">
                                                        <textarea
                                                            value={input}
                                                            onChange={handleInputChange}
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter" && !e.shiftKey) {
                                                                    e.preventDefault()
                                                                    handleSubmit(e as any)
                                                                }
                                                            }}
                                                            placeholder="How can I help you regarding your project?"
                                                            className="w-full bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground/40 resize-none max-h-32 py-2 scrollbar-hide text-center md:text-left"
                                                            rows={1}
                                                            disabled={isLoading}
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            className="p-2 text-muted-foreground hover:text-accent transition-colors"
                                                            title="Add File"
                                                        >
                                                            <Folder className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={isListening ? stopListening : startListening}
                                                            className={cn(
                                                                "p-2 transition-colors relative",
                                                                isListening ? "text-destructive hover:text-destructive/80" : "text-muted-foreground hover:text-accent"
                                                            )}
                                                            title={isListening ? "Stop Listening" : "Voice Input"}
                                                        >
                                                            <Mic className={cn("w-4 h-4", isListening && "animate-pulse")} />
                                                            {isListening && <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-destructive animate-ping" />}
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            disabled={!input.trim() || isLoading}
                                                            className="p-2 bg-accent text-background rounded-lg hover:bg-white transition-all disabled:opacity-30 disabled:hover:bg-accent"
                                                        >
                                                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </form>

                                                {/* Suggestions */}
                                                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-2 w-full">
                                                    {[
                                                        { icon: Terminal, label: "Generate Code" },
                                                        { icon: Search, label: "Research Topic" },
                                                        { icon: Image, label: "Analyze Image" },
                                                        { icon: FileCode, label: "Refactor API" },
                                                    ].map((item, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => setInput((prev: string) => prev + (prev ? " " : "") + item.label)}
                                                            className="flex flex-col items-center gap-2 p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 hover:border-accent/20 transition-all group"
                                                        >
                                                            <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-accent mb-1" />
                                                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground group-hover:text-foreground">{item.label}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="max-w-4xl mx-auto space-y-12 pb-4">
                                        {messages.map((m: any, index: number) => {
                                            const isLastMessage = index === messages.length - 1
                                            const isAi = m.role !== "user"

                                            return (
                                                <div key={m.id} className="group relative animate-in fade-in slide-in-from-bottom-2 duration-500">
                                                    {/* Data Plate Container */}
                                                    <div className={cn(
                                                        "relative overflow-hidden p-6 rounded-lg transition-all duration-500",
                                                        "border border-white/5",
                                                        isAi ? "bg-[#0a0a0a]/80" : "bg-accent/5",
                                                        isAi && isLastMessage && isLoading ? "shadow-[0_0_30px_-5px_var(--color-accent)]/20 border-accent/30" : "hover:border-white/10"
                                                    )}>
                                                        {/* Scanline / Grid effect overlay */}
                                                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_50%,rgba(0,0,0,0.2)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 opacity-20 pointer-events-none bg-[length:100%_4px,3px_100%]" />

                                                        {/* Decorative corner markers */}
                                                        {isAi && (
                                                            <>
                                                                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-accent/50" />
                                                                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-accent/50" />
                                                                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-accent/50" />
                                                                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-accent/50" />
                                                            </>
                                                        )}

                                                        <div className="relative z-10 flex items-start gap-6">
                                                            <div className={cn(
                                                                "w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-sm border",
                                                                m.role === "user" ? "border-muted-foreground/30 bg-muted/5" : "border-accent/40 bg-accent/5 text-accent shadow-[0_0_10px_-2px_var(--color-accent)]/30"
                                                            )}>
                                                                {m.role === "user" ? <Command className="w-5 h-5" /> : <Cpu className="w-5 h-5" />}
                                                            </div>
                                                            <div className="flex-1 space-y-2">
                                                                <div className="flex items-center gap-3">
                                                                    <span className={cn(
                                                                        "text-[10px] uppercase tracking-widest font-bold font-mono",
                                                                        m.role === "user" ? "text-muted-foreground" : "text-accent"
                                                                    )}>
                                                                        {m.role === "user" ? "USER_PROMPT" : (projectMode ? "INVENTOR_RESPONSE" : "NEXIS_RESPONSE")}
                                                                    </span>
                                                                    <span className="text-[9px] text-muted-foreground/40 font-mono">{new Date().toLocaleTimeString()}</span>
                                                                    {isAi && isLastMessage && isLoading && (
                                                                        <span className="text-[8px] text-accent animate-pulse uppercase tracking-wider">[PROCESSING_STREAM]</span>
                                                                    )}
                                                                </div>

                                                                <div className={cn(
                                                                    "text-sm leading-relaxed whitespace-pre-wrap font-sans mix-blend-screen",
                                                                    m.role === "user" ? "text-foreground/80" : "text-foreground"
                                                                )}>
                                                                    {isAi && isLastMessage && isLoading ? (
                                                                        <span className="font-mono text-accent/90 filters drop-shadow-[0_0_5px_rgba(var(--color-accent),0.5)]">
                                                                            {m.content.replace(/\[MEMORY: .*?\]/g, "")}
                                                                            <span className="animate-pulse inline-block w-2 h-4 bg-accent align-middle ml-1" />
                                                                        </span>
                                                                    ) : (
                                                                        // Render standard text for history or user to preserve Markdown/Readability
                                                                        m.content.replace(/\[MEMORY: .*?\]/g, "")
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
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

                    {/* Input Bar - Standard Flow (Only visible when messages > 0) */}
                    {activeTab === "chat.tsx" && messages.length > 0 && (
                        <div className="p-3 md:p-6 bg-[#050505] border-t border-border/20 z-20 shrink-0 mb-safe">
                            <form
                                onSubmit={handleSubmit}
                                className="max-w-4xl mx-auto flex items-end gap-2 bg-[#0d0d0d] border border-border/60 focus-within:border-accent p-2 transition-all shadow-2xl rounded-lg md:rounded-none"
                            >
                                <div className="flex-1 min-h-[44px] flex flex-col justify-center px-2 md:px-4">
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
                                        className="p-3 text-muted-foreground hover:text-accent transition-colors"
                                        title="Add File"
                                    >
                                        <Folder className="w-4 h-4" />
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
                                    Neural Link: Active // Empathy Engine: Online // Persona: {persona.toUpperCase()} // Model: {projectMode === "research" ? "NEXIS RESEARCH O1" : projectMode === "web" ? "NEXIS WEB INTEL" : "NEXIS Prime"}
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
