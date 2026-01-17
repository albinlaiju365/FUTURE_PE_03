
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { ArrowRight, Lock, Mail, Loader2, ShieldCheck, Eye, EyeOff, Github, Chrome } from "lucide-react"
import Link from "next/link"
import { ScrambleTextOnHover } from "@/components/scramble-text"
import { cn } from "@/lib/utils"

const loginSchema = z.object({
    email: z.string().email("Please enter a valid terminal ID"),
    password: z.string().min(1, "Access key required"),
})

type LoginValues = z.infer<typeof loginSchema>

export default function LoginPage({
    isModal = false,
    onSuccess,
    onToggleMode
}: {
    isModal?: boolean;
    onSuccess?: () => void;
    onToggleMode?: () => void;
}) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const form = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    async function onSubmit(data: LoginValues) {
        setIsLoading(true)
        try {
            console.log("Login Request:", data)

            // Verify credentials against mock database
            const users = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
            const user = users.find((u: any) => u.email === data.email && u.password === data.password)

            if (!user) {
                throw new Error("Invalid terminal identifier or access key.")
            }

            localStorage.setItem("isLoggedIn", "true")
            localStorage.setItem("userEmail", user.email)
            localStorage.setItem("userName", user.name)

            toast.success("Identity verified", {
                description: `Terminal session authorized for ${user.email}. Welcome back.`,
            })

            if (onSuccess) {
                onSuccess()
            } else {
                setTimeout(() => {
                    router.push("/chat")
                }, 1000)
            }
        } catch (error) {
            toast.error("Authorization denied", {
                description: "Invalid credentials or security lockout. Access revoked.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className={cn("relative flex items-center justify-center overflow-hidden font-mono", isModal ? "min-h-0 bg-transparent" : "min-h-screen bg-[#050505] text-foreground")}>
            {/* Scanline & Grid Overlays */}
            {!isModal && (
                <>
                    <div className="absolute inset-0 z-10 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%),linear-gradient(90deg,rgba(0,255,100,0.02),rgba(0,100,255,0.02))] bg-[length:100%_4px,3px_100%] opacity-20" />

                    {/* Ambient Background Graphic */}
                    <div
                        className="absolute inset-0 z-0 opacity-20 grayscale transition-all duration-1000"
                        style={{
                            backgroundImage: `url('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=2000')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    />

                    {/* Glowing Accent Orbs */}
                    <div className="absolute bottom-[-5%] left-[-5%] w-[45%] h-[45%] bg-accent/15 rounded-full blur-[120px] z-0" />
                </>
            )}

            <motion.div
                initial={isModal ? { opacity: 1 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className={cn("relative z-20 w-full px-6", isModal ? "max-w-none" : "max-w-md")}
            >
                <div className={cn("backdrop-blur-xl bg-black/50 border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)]", isModal && "border-none shadow-none bg-transparent")}>
                    {/* Top Status Bar */}
                    {!isModal && <div className="h-0.5 w-full bg-accent/30" />}

                    <div className={cn("p-10 md:p-12", isModal && "p-4")}>
                        <div className="mb-10 text-center">
                            {!isModal && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="inline-block mb-6 px-4 py-1.5 bg-accent/5 border border-accent/20 rounded-sm"
                                >
                                    <span className="text-[9px] tracking-[0.4em] text-accent font-bold uppercase">SECURITY_PROTOCOL: ACTIVE</span>
                                </motion.div>
                            )}

                            {!isModal && (
                                <Link href="/" className="block mb-8 group">
                                    <span className="font-[family-name:var(--font-display)] text-5xl tracking-tighter text-white">
                                        NEXIS<span className="text-accent group-hover:animate-pulse">.</span>AI
                                    </span>
                                </Link>
                            )}

                            <h1 className="text-xl font-bold tracking-[0.2em] text-foreground uppercase opacity-80">
                                {isModal ? "AUTHENTICATE_SESSION" : "Welcome Back"}
                            </h1>
                        </div>

                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <label className="flex items-center justify-between font-mono text-[9px] uppercase tracking-widest text-muted-foreground ml-1">
                                    <span>TERMINAL_ID</span>
                                    {form.formState.errors.email && (
                                        <span className="text-red-500/80 lowercase tracking-normal">[{form.formState.errors.email.message}]</span>
                                    )}
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-4 w-4 text-muted-foreground/30 group-focus-within:text-accent transition-colors" />
                                    </div>
                                    <input
                                        {...form.register("email")}
                                        className="block w-full bg-white/[0.03] border border-white/5 py-4 pl-12 pr-4 text-sm text-foreground placeholder:text-muted-foreground/10 focus:outline-none focus:border-accent/40 focus:bg-white/[0.05] transition-all duration-300"
                                        placeholder="admin@nexis.ai"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                                        ACCESS_KEY
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const email = form.getValues("email")
                                            if (!email) {
                                                toast.error("Input Required", {
                                                    description: "Please enter your Terminal ID (Email) first."
                                                })
                                                return
                                            }

                                            // Check if user exists in mock DB
                                            const users = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
                                            const userExists = users.some((u: any) => u.email === email)

                                            if (!userExists) {
                                                toast.error("Identity Not Found", {
                                                    description: `The terminal ID ${email} is not registered in our nodes.`
                                                })
                                                return
                                            }

                                            toast.promise(new Promise(resolve => setTimeout(resolve, 2000)), {
                                                loading: 'Initializing recovery protocol...',
                                                success: (data) => {
                                                    return `Recovery protocol dispatched to ${email}. Check your simulated uplink.`
                                                },
                                                error: 'Uplink failed',
                                            })
                                        }}
                                        className="font-mono text-[9px] uppercase text-accent/60 hover:text-accent transition-colors"
                                    >
                                        FORGOT?
                                    </button>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-4 w-4 text-muted-foreground/30 group-focus-within:text-accent transition-colors" />
                                    </div>
                                    <input
                                        {...form.register("password")}
                                        type={showPassword ? "text" : "password"}
                                        className="block w-full bg-white/[0.03] border border-white/5 py-4 pl-12 pr-12 text-sm text-foreground placeholder:text-muted-foreground/10 focus:outline-none focus:border-accent/40 focus:bg-white/[0.05] transition-all duration-300"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground/30 hover:text-accent transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full relative group mt-4 overflow-hidden bg-foreground text-background py-5 px-6 font-bold transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                            >
                                <div className="relative z-10 flex items-center justify-center gap-3">
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <ScrambleTextOnHover
                                                text="AUTHORIZE SESSION"
                                                as="span"
                                                className="text-[12px] uppercase tracking-[0.3em]"
                                            />
                                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
                                        </>
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                            </button>
                        </form>

                        {!isModal && (
                            <div className="mt-12">
                                <div className="relative mb-8 text-center">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/5"></div>
                                    </div>
                                    <span className="relative px-3 bg-[#050505] text-[8px] uppercase tracking-[0.5em] text-muted-foreground/30 font-mono italic">3rd Party Auth</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button className="flex items-center justify-center gap-3 border border-white/5 py-4 font-mono text-[9px] uppercase tracking-widest hover:bg-white/[0.02] hover:border-white/10 transition-all duration-300 group">
                                        <Github className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                                        GitHub
                                    </button>
                                    <button className="flex items-center justify-center gap-3 border border-white/5 py-4 font-mono text-[9px] uppercase tracking-widest hover:bg-white/[0.02] hover:border-white/10 transition-all duration-300 group">
                                        <Chrome className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                                        Google
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className={cn("text-center border-t border-white/5", isModal ? "mt-8 pt-6" : "mt-12 pt-8")}>
                            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
                                No profile found?{" "}
                                {isModal ? (
                                    <button
                                        type="button"
                                        onClick={onToggleMode}
                                        className="text-accent underline underline-offset-8 decoration-accent/10 hover:decoration-accent/100 transition-all font-bold"
                                    >
                                        Initialize Registration
                                    </button>
                                ) : (
                                    <Link href="/signup" className="text-accent underline underline-offset-8 decoration-accent/10 hover:decoration-accent/100 transition-all">
                                        Initialize Registration
                                    </Link>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Terminal Decorations */}
            {!isModal && (
                <div className="absolute bottom-8 left-8 flex flex-col gap-2 font-mono text-[7px] text-muted-foreground/20 leading-none">
                    <div>LOC_IP: 192.168.1.104</div>
                    <div>SEC_LEVEL: 05</div>
                    <div>OS_TYPE: NEXIS_KRNL_V2</div>
                </div>
            )}
        </main>
    )
}
