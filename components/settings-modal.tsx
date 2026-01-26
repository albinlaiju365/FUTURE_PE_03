"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Monitor, Bell, Settings, Save, Trash2, Volume2, VolumeX, RefreshCcw, BrainCircuit, X } from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

type SettingsTab = "profile" | "bot" | "notifications" | "system" | "memory"

interface SettingsModalProps {
    isOpen: boolean
    onClose: () => void
    defaultTab?: SettingsTab
}

export function SettingsModal({ isOpen, onClose, defaultTab = "profile" }: SettingsModalProps) {
    const [activeTab, setActiveTab] = useState<SettingsTab>(defaultTab)
    const [userName, setUserName] = useState("")
    const [userEmail, setUserEmail] = useState("")

    // Bot Settings
    const [temperature, setTemperature] = useState(0.7)
    const [persona, setPersona] = useState("nexis")

    // System Settings
    const [soundEnabled, setSoundEnabled] = useState(true)

    // Memory Settings
    const [memories, setMemories] = useState<string[]>([])

    useEffect(() => {
        if (isOpen) {
            setActiveTab(defaultTab)
            const storedName = localStorage.getItem("userName")
            const storedEmail = localStorage.getItem("userEmail")
            const storedPersona = localStorage.getItem("nexis_persona")
            const storedTemp = localStorage.getItem("nexis_temperature")

            if (storedName) setUserName(storedName)
            if (storedEmail) setUserEmail(storedEmail)
            if (storedPersona) setPersona(storedPersona)
            if (storedTemp) setTemperature(parseFloat(storedTemp))

            // Fetch memories from DB using ML-linked API
            const fetchMemories = async () => {
                try {
                    const res = await fetch("/api/memories")
                    const data = await res.json()
                    if (data.memories) {
                        const memoryStrings = data.memories.map((m: any) => m.content)
                        setMemories(memoryStrings)
                        localStorage.setItem("ai_memories", JSON.stringify(memoryStrings))
                    }
                } catch (e) {
                    console.error("Failed to fetch memories")
                }
            }
            fetchMemories()
        }
    }, [isOpen, defaultTab])

    const handlePersonaChange = (newPersona: string) => {
        setPersona(newPersona)
        localStorage.setItem("nexis_persona", newPersona)
        window.dispatchEvent(new Event("storage"))
    }

    const handleSaveProfile = async () => {
        if (!userName) return

        try {
            const res = await fetch("/api/auth/me", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: userName })
            })

            if (res.ok) {
                const data = await res.json()
                localStorage.setItem("userName", data.user.name)
                // Dispatch storage event to update other components (ProfileMenu, Chat, etc.)
                window.dispatchEvent(new Event("storage"))
                toast.success("Profile Updated", { description: "Identity protocols re-calibrated." })
            } else {
                throw new Error("Update failed")
            }
        } catch (e) {
            toast.error("Update Denied", { description: "Uplink to neural core failed." })
        }
    }

    const handleClearData = () => {
        localStorage.clear()
        toast.error("System Reset", { description: "All local nodes wiped. Refreshing..." })
        setTimeout(() => window.location.reload(), 1000)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent showClose={false} className="sm:max-w-[650px] bg-background border border-border/20 text-foreground overflow-hidden rounded-[20px] shadow-2xl p-0">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/10">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold tracking-tight text-foreground/90">
                            Settings
                        </DialogTitle>
                    </DialogHeader>
                    <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded-full transition-colors">
                        <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                </div>

                <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as SettingsTab)} className="w-full flex">
                    <TabsList className="flex flex-col h-auto bg-sidebar p-3 items-start gap-1 min-w-[200px] border-r border-border/10">
                        <TabsTrigger value="profile" className="w-full justify-start gap-3 text-sm font-medium rounded-lg px-3 py-2 data-[state=active]:bg-secondary data-[state=active]:text-primary transition-all">
                            <User className="w-4 h-4" /> Profile
                        </TabsTrigger>
                        <TabsTrigger value="bot" className="w-full justify-start gap-3 text-sm font-medium rounded-lg px-3 py-2 data-[state=active]:bg-secondary data-[state=active]:text-primary transition-all">
                            <BrainCircuit className="w-4 h-4" /> AI Models
                        </TabsTrigger>
                        <TabsTrigger value="memory" className="w-full justify-start gap-3 text-sm font-medium rounded-lg px-3 py-2 data-[state=active]:bg-secondary data-[state=active]:text-primary transition-all">
                            <Monitor className="w-4 h-4" /> Memory Bank
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="w-full justify-start gap-3 text-sm font-medium rounded-lg px-3 py-2 data-[state=active]:bg-secondary data-[state=active]:text-primary transition-all">
                            <Bell className="w-4 h-4" /> Updates
                        </TabsTrigger>
                        <TabsTrigger value="system" className="w-full justify-start gap-3 text-sm font-medium rounded-lg px-3 py-2 data-[state=active]:bg-secondary data-[state=active]:text-primary transition-all">
                            <Settings className="w-4 h-4" /> General
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex-1 min-h-[400px] p-8">
                        {/* PROFILE TAB */}
                        <TabsContent value="profile" className="space-y-8 mt-0 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center gap-6">
                                <Avatar className="h-20 w-20 border border-border/10">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${userName}`} />
                                    <AvatarFallback>OP</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-semibold text-xl">{userName || "User"}</h3>
                                    <span className="text-sm text-muted-foreground">{userEmail || "Personal Profile"}</span>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-foreground/70 tracking-tight">Name</label>
                                    <input
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                        className="w-full bg-secondary/50 border border-border/10 px-4 py-2.5 text-[15px] focus:ring-2 focus:ring-primary/20 outline-none rounded-xl transition-all"
                                        placeholder="Your Name"
                                    />
                                </div>
                                <button onClick={handleSaveProfile} className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 text-sm font-medium rounded-full shadow-lg shadow-primary/20 hover:opacity-90 transition-all">
                                    <Save className="w-4 h-4" /> Save
                                </button>
                            </div>
                        </TabsContent>

                        {/* BOT TAB */}
                        <TabsContent value="bot" className="space-y-8 mt-0 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="flex justify-between text-sm font-semibold text-foreground/70">
                                        <span>Creativity (Temperature)</span>
                                        <span className="text-primary">{temperature}</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={temperature}
                                        onChange={(e) => {
                                            const val = parseFloat(e.target.value);
                                            setTemperature(val);
                                            localStorage.setItem("nexis_temperature", val.toString());
                                            window.dispatchEvent(new Event("storage"));
                                        }}
                                        className="w-full accent-primary h-1.5 bg-secondary rounded-full appearance-none cursor-pointer"
                                    />
                                    <p className="text-[13px] text-muted-foreground leading-snug">The temperature setting controls the randomness of the model's output.</p>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-foreground/70">Interface Persona</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { id: 'inventor', name: 'The Inventor', desc: 'Eccentric & Chaotic' },
                                            { id: 'nexis', name: 'Nexis Core', desc: 'Helpful & Balanced' }
                                        ].map((p) => (
                                            <button
                                                key={p.id}
                                                onClick={() => handlePersonaChange(p.id)}
                                                className={cn(
                                                    "p-3.5 border rounded-2xl text-left transition-all",
                                                    persona === p.id
                                                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                                                        : "border-border/10 hover:bg-secondary/50 grayscale hover:grayscale-0"
                                                )}
                                            >
                                                <div className="font-semibold text-sm mb-1">{p.name}</div>
                                                <div className="text-[12px] text-muted-foreground">{p.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* MEMORY TAB */}
                        <TabsContent value="memory" className="space-y-6 mt-0">
                            <div className="space-y-4">
                                <div className="p-4 border border-accent/20 bg-accent/5 rounded-sm">
                                    <div className="flex items-center gap-3 mb-2">
                                        <BrainCircuit className="w-5 h-5 text-accent" />
                                        <h3 className="font-bold text-sm text-accent">Neural Memory Bank</h3>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                                        The AI automatically extracts and saves key facts from your conversations to personalize future interactions.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="font-mono text-[10px] uppercase text-muted-foreground flex justify-between">
                                        <span>Stored Memories</span>
                                        <span className="text-accent">{memories.length} Nodes</span>
                                    </label>
                                    <div className="h-[200px] overflow-y-auto border border-white/10 rounded-sm bg-black/20 p-2 space-y-2">
                                        {memories.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground/30 italic text-xs">
                                                No memories formed yet.
                                            </div>
                                        ) : (
                                            memories.map((mem, i) => (
                                                <div key={i} className="group flex items-start justify-between p-3 bg-white/5 border border-white/5 hover:border-accent/30 transition-colors text-xs">
                                                    <span className="text-white/80">{mem}</span>
                                                    <button
                                                        onClick={() => {
                                                            const updated = memories.filter((_, idx) => idx !== i)
                                                            setMemories(updated)
                                                            localStorage.setItem("ai_memories", JSON.stringify(updated))
                                                            window.dispatchEvent(new Event("storage")) // Force update
                                                            toast.success("Memory Node Deleted")
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:bg-red-500/10 p-1 rounded-sm transition-all"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={async () => {
                                        try {
                                            await fetch("/api/memories", { method: "DELETE" })
                                            localStorage.removeItem("ai_memories")
                                            setMemories([])
                                            toast.success("Memory Bank Wiped")
                                        } catch (e) {
                                            toast.error("Wipe Failed")
                                        }
                                    }}
                                    className="w-full flex items-center justify-center gap-2 p-3 border border-white/10 hover:bg-white/5 text-xs font-mono uppercase tracking-widest transition-colors text-muted-foreground hover:text-white"
                                >
                                    <RefreshCcw className="w-3 h-3" /> Clear All Memories
                                </button>
                            </div>
                        </TabsContent>

                        {/* NOTIFICATIONS TAB */}
                        <TabsContent value="notifications" className="mt-0">
                            <div className="space-y-2">
                                {[
                                    { title: "System Update v2.4", time: "2m ago", type: "system" },
                                    { title: "Security Protocol Active", time: "1h ago", type: "security" },
                                    { title: "New Model: Llama-3-70b", time: "1d ago", type: "update" },
                                    { title: "Welcome to NEXIS", time: "2d ago", type: "info" }
                                ].map((notif, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-accent animate-pulse' : 'bg-muted-foreground'}`} />
                                            <span className="text-sm">{notif.title}</span>
                                        </div>
                                        <span className="font-mono text-[10px] text-muted-foreground">{notif.time}</span>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        {/* SYSTEM TAB */}
                        <TabsContent value="system" className="space-y-6 mt-0">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border border-white/10 bg-white/5">
                                    <div className="flex items-center gap-3">
                                        {soundEnabled ? <Volume2 className="w-4 h-4 text-accent" /> : <VolumeX className="w-4 h-4 text-muted-foreground" />}
                                        <div className="text-sm">Interface Sounds</div>
                                    </div>
                                    <button
                                        onClick={() => setSoundEnabled(!soundEnabled)}
                                        className="h-6 w-10 bg-white/10 rounded-full relative transition-colors data-[on=true]:bg-accent/20"
                                        data-on={soundEnabled}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${soundEnabled ? 'left-5 bg-accent' : 'left-1 bg-muted-foreground'}`} />
                                    </button>
                                </div>

                                <button
                                    onClick={handleClearData}
                                    className="w-full flex items-center justify-center gap-2 p-4 border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors font-mono text-xs uppercase tracking-widest"
                                >
                                    <Trash2 className="w-4 h-4" /> Factory Reset
                                </button>

                                <div className="text-center font-mono text-[9px] text-muted-foreground/40 pt-4">
                                    SYSTEM_VERSION: 2.5.0-ALPHA <br />
                                    BUILD: 2024.10.24
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
