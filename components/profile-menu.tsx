"use client"

import { useState, useEffect } from "react"
import { SettingsModal } from "@/components/settings-modal"

import {
    Cloud,
    CreditCard,
    Github,
    Keyboard,
    LifeBuoy,
    LogOut,
    Mail,
    MessageSquare,
    Plus,
    PlusCircle,
    Settings,
    User,
    UserPlus,
    Users,
    Bell,
    Monitor
} from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function ProfileMenu({ onAuthClick }: { onAuthClick?: (mode: "login" | "signup") => void }) {
    const router = useRouter()
    const [userName, setUserName] = useState("Operative")
    const [userEmail, setUserEmail] = useState("guest@nexis.ai")

    useEffect(() => {
        const name = localStorage.getItem("userName")
        const email = localStorage.getItem("userEmail")
        if (name) setUserName(name)
        if (email) setUserEmail(email)
    }, [])

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" })
        } catch (e) {
            console.error("Logout failed", e)
        }

        localStorage.removeItem("isLoggedIn")
        localStorage.removeItem("userName")
        localStorage.removeItem("userEmail")
        localStorage.removeItem("nexis_chat_history")
        localStorage.removeItem("ai_memories")
        localStorage.removeItem("nexis_persona")

        toast.info("Session terminated", {
            description: "You have been logged out of the terminal.",
        })
        setTimeout(() => {
            window.location.href = "/"
        }, 300)
    }

    const isLoggedIn = typeof window !== "undefined" && localStorage.getItem("isLoggedIn") === "true"

    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [settingsTab, setSettingsTab] = useState<"profile" | "bot" | "notifications" | "system">("profile")

    const openSettings = (tab: "profile" | "bot" | "notifications" | "system") => {
        setSettingsTab(tab)
        setIsSettingsOpen(true)
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-secondary cursor-pointer transition-all group outline-none"
                    >
                        <div className="w-8 h-8 rounded-full border border-border/20 overflow-hidden bg-primary/10">
                            <Avatar className="h-full w-full">
                                <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${userName}`} alt={userName} />
                                <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">{userName.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                            <div className="text-sm font-medium truncate group-hover:text-primary transition-colors text-foreground">{userName}</div>
                            <div className="text-[10px] text-muted-foreground truncate font-medium uppercase tracking-[0.05em] opacity-60">Settings & Mission</div>
                        </div>
                        <Settings className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 bg-popover/90 border-border/20 backdrop-blur-xl rounded-[18px] shadow-2xl p-1.5" align="start" side="top" forceMount>
                    <DropdownMenuLabel className="font-normal px-3 py-3">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-semibold leading-none text-foreground">{userName}</p>
                            <p className="text-[11px] leading-none text-muted-foreground truncate">
                                {userEmail}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border/10 my-1" />
                    <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => openSettings("profile")} className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-secondary cursor-pointer transition-all">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>Profile Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openSettings("bot")} className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-secondary cursor-pointer transition-all">
                            <Monitor className="h-4 w-4 text-muted-foreground" />
                            <span>Customize Assistant</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openSettings("notifications")} className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-secondary cursor-pointer transition-all">
                            <Bell className="h-4 w-4 text-muted-foreground" />
                            <span>Notifications</span>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="bg-border/10 my-1" />
                    <DropdownMenuItem
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/10 rounded-xl cursor-pointer transition-all"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                defaultTab={settingsTab}
            />
        </>
    )
}
