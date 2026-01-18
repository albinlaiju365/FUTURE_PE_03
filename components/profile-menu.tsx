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

    const handleLogout = () => {
        localStorage.removeItem("isLoggedIn")
        localStorage.removeItem("userName")
        localStorage.removeItem("userEmail")
        toast.info("Session terminated", {
            description: "You have been logged out of the terminal.",
        })
        setTimeout(() => {
            router.push("/")
        }, 800)
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
                        onClick={() => !isLoggedIn && onAuthClick?.("login")}
                        className="relative h-10 w-10 rounded-full border border-white/10 hover:border-accent/50 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 overflow-hidden"
                    >
                        <Avatar className="h-full w-full">
                            <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${userName}`} alt={userName} />
                            <AvatarFallback>{userName.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 bg-black/90 border-white/10 backdrop-blur-xl" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none text-white">{userName}</p>
                            <p className="text-[10px] font-mono leading-none text-muted-foreground uppercase tracking-widest truncate">
                                {userEmail}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/5" />
                    <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => openSettings("profile")} className="text-white/70 hover:text-white hover:bg-white/5 cursor-pointer py-2.5 transition-all">
                            <User className="mr-2 h-4 w-4" />
                            <span className="text-[10px] uppercase tracking-widest font-mono">Profile</span>
                            <DropdownMenuShortcut className="text-[10px] opacity-30">⇧⌘P</DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openSettings("bot")} className="text-white/70 hover:text-white hover:bg-white/5 cursor-pointer py-2.5 transition-all">
                            <Monitor className="mr-2 h-4 w-4" />
                            <span className="text-[10px] uppercase tracking-widest font-mono">Bot Customization</span>
                            <DropdownMenuShortcut className="text-[10px] opacity-30">⌘B</DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openSettings("notifications")} className="text-white/70 hover:text-white hover:bg-white/5 cursor-pointer py-2.5 transition-all">
                            <Bell className="mr-2 h-4 w-4" />
                            <span className="text-[10px] uppercase tracking-widest font-mono">Notifications</span>
                            <span className="ml-auto flex h-2 w-2 shrink-0 rounded-full bg-accent animate-pulse"></span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openSettings("system")} className="text-white/70 hover:text-white hover:bg-white/5 cursor-pointer py-2.5 transition-all">
                            <Settings className="mr-2 h-4 w-4" />
                            <span className="text-[10px] uppercase tracking-widest font-mono">System Settings</span>
                            <DropdownMenuShortcut className="text-[10px] opacity-30">⌘S</DropdownMenuShortcut>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="bg-white/5" />
                    <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-accent hover:text-accent hover:bg-accent/10 cursor-pointer py-3 transition-all"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span className="text-[10px] uppercase tracking-widest font-mono font-bold">Terminate Session</span>
                        <DropdownMenuShortcut className="text-[10px] opacity-30">⇧⌘Q</DropdownMenuShortcut>
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
