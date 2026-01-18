"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Monitor, Bell, Settings, Save, Trash2, Volume2, VolumeX, RefreshCcw, BrainCircuit, X } from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
    const [persona, setPersona] = useState("inventor")

    // System Settings
    const [soundEnabled, setSoundEnabled] = useState(true)

    useEffect(() => {
        if (isOpen) {
            setActiveTab(defaultTab)
            const storedName = localStorage.getItem("userName")
            const storedEmail = localStorage.getItem("userEmail")
            if (storedName) setUserName(storedName)
            if (storedEmail) setUserEmail(storedEmail)
        }
    }, [isOpen, defaultTab])

    const handleSaveProfile = () => {
        if (userName) localStorage.setItem("userName", userName)
        toast.success("Profile Updated", { description: "Identity protocols re-calibrated." })
    }

    const handleClearData = () => {
        localStorage.clear()
        toast.error("System Reset", { description: "All local nodes wiped. Refreshing..." })
        setTimeout(() => window.location.reload(), 1000)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] bg-[#0A0A0A] border border-white/10 text-foreground overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
                        Control Panel // {activeTab}
                    </DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as SettingsTab)} className="w-full flex flex-col md:flex-row gap-6 mt-4">
                    <TabsList className="flex flex-col h-auto bg-transparent items-start gap-2 min-w-[150px]">
                        <TabsTrigger value="profile" className="w-full justify-start gap-3 font-mono text-xs uppercase data-[state=active]:bg-white/5 data-[state=active]:text-accent">
                            <User className="w-4 h-4" /> Profile
                        </TabsTrigger>
                        <TabsTrigger value="bot" className="w-full justify-start gap-3 font-mono text-xs uppercase data-[state=active]:bg-white/5 data-[state=active]:text-accent">
                            <Monitor className="w-4 h-4" /> Bot Logic
                        </TabsTrigger>
                        <TabsTrigger value="memory" className="w-full justify-start gap-3 font-mono text-xs uppercase data-[state=active]:bg-white/5 data-[state=active]:text-accent">
                            <BrainCircuit className="w-4 h-4" /> Memory Bank
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="w-full justify-start gap-3 font-mono text-xs uppercase data-[state=active]:bg-white/5 data-[state=active]:text-accent">
                            <Bell className="w-4 h-4" /> Comm Logs
                        </TabsTrigger>
                        <TabsTrigger value="system" className="w-full justify-start gap-3 font-mono text-xs uppercase data-[state=active]:bg-white/5 data-[state=active]:text-accent">
                            <Settings className="w-4 h-4" /> System
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex-1 min-h-[300px]">
                        {/* PROFILE TAB */}
                        <TabsContent value="profile" className="space-y-6 mt-0">
                            <div className="flex items-center gap-6">
                                <Avatar className="h-20 w-20 border-2 border-white/10">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${userName}`} />
                                    <AvatarFallback>OP</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-bold text-lg">{userName || "Operative"}</h3>
                                    <span className="font-mono text-xs text-muted-foreground">{userEmail || "Connect Wallet ID"}</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="font-mono text-[10px] uppercase text-muted-foreground">Operative Name</label>
                                    <input
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-accent outline-none rounded-sm font-mono"
                                    />
                                </div>
                                <button onClick={handleSaveProfile} className="flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 text-xs font-mono uppercase tracking-widest hover:bg-accent/20 transition-colors border border-accent/20">
                                    <Save className="w-3 h-3" /> Save Changes
                                </button>
                            </div>
                        </TabsContent>

                        {/* BOT TAB */}
                        <TabsContent value="bot" className="space-y-6 mt-0">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="flex justify-between font-mono text-[10px] uppercase text-muted-foreground">
                                        <span>Creativity (Temperature)</span>
                                        <span className="text-accent">{temperature}</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={temperature}
                                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                        className="w-full accent-accent h-1 bg-white/10 appearance-none rounded-full cursor-pointer"
                                    />
                                    <p className="text-[10px] text-muted-foreground">Higher values make the AI more unpredictable and creative.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="font-mono text-[10px] uppercase text-muted-foreground">Base Persona</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setPersona("inventor")}
                                            className={`p-3 border text-left transition-all ${persona === 'inventor' ? 'border-accent bg-accent/5' : 'border-white/10 hover:border-white/20'}`}
                                        >
                                            <div className="font-bold text-xs uppercase mb-1">The Inventor</div>
                                            <div className="text-[10px] text-muted-foreground">Eccentric, brilliant, chaotic.</div>
                                        </button>
                                        <button
                                            onClick={() => setPersona("nexis")}
                                            className={`p-3 border text-left transition-all ${persona === 'nexis' ? 'border-accent bg-accent/5' : 'border-white/10 hover:border-white/20'}`}
                                        >
                                            <div className="font-bold text-xs uppercase mb-1">NEXIS Core</div>
                                            <div className="text-[10px] text-muted-foreground">Helpful, precise, friendly.</div>
                                        </button>
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
                                        <span className="text-accent">{(JSON.parse(localStorage.getItem("ai_memories") || "[]")).length} Nodes</span>
                                    </label>
                                    <div className="h-[200px] overflow-y-auto border border-white/10 rounded-sm bg-black/20 p-2 space-y-2">
                                        {(JSON.parse(localStorage.getItem("ai_memories") || "[]") as string[]).length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground/30 italic text-xs">
                                                No memories formed yet.
                                            </div>
                                        ) : (
                                            (JSON.parse(localStorage.getItem("ai_memories") || "[]") as string[]).map((mem, i) => (
                                                <div key={i} className="group flex items-start justify-between p-3 bg-white/5 border border-white/5 hover:border-accent/30 transition-colors text-xs">
                                                    <span className="text-white/80">{mem}</span>
                                                    <button
                                                        onClick={() => {
                                                            const current = JSON.parse(localStorage.getItem("ai_memories") || "[]") as string[]
                                                            const updated = current.filter((_, idx) => idx !== i)
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
                                    onClick={() => {
                                        localStorage.removeItem("ai_memories")
                                        toast.success("Memory Bank Wiped")
                                        // Force re-render trick would be better here but simple for now
                                        setTimeout(() => window.location.reload(), 500)
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
