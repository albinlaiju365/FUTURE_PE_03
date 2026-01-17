
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, User, Mail, Lock, Loader2, ShieldCheck, Eye, EyeOff, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { ScrambleTextOnHover } from "@/components/scramble-text"

import { cn } from "@/lib/utils"

const signupSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
})

type SignupValues = z.infer<typeof signupSchema>

export default function SignupPage({
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

    const form = useForm<SignupValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    })

    async function onSubmit(data: SignupValues) {
        setIsLoading(true)
        try {
            // Simulate API call for now or implement real one
            console.log("Signup Request:", data)

            // Simulate user "database" in local storage
            const users = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
            const userExists = users.some((u: any) => u.email === data.email)

            if (userExists) {
                throw new Error("Terminal ID already registered.")
            }

            users.push({
                name: data.name,
                email: data.email,
                password: data.password // In a real app, this would be hashed
            })

            localStorage.setItem("registeredUsers", JSON.stringify(users))
            localStorage.setItem("isLoggedIn", "true")
            localStorage.setItem("userName", data.name)
            localStorage.setItem("userEmail", data.email)

            toast.success("Operative protocol initialized!", {
                description: `Welcome to Nexis, ${data.name}. Redirecting to terminal...`,
            })

            if (onSuccess) {
                onSuccess()
            } else {
                setTimeout(() => {
                    router.push("/chat")
                }, 2000)
            }
        } catch (error) {
            toast.error("Uplink failed", {
                description: "Security protocols prevented registration. Please try again.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className={cn("relative flex items-center justify-center overflow-hidden font-mono", isModal ? "min-h-0 bg-transparent" : "min-h-screen bg-[#050505] text-foreground")}>
            {/* Background Graphic */}
            {!isModal && (
                <>
                    <div
                        className="absolute inset-0 z-0 opacity-30 mix-blend-screen scale-110 pointer-events-none"
                        style={{
                            backgroundImage: `url('/futuristic_login_background_1768587543034.png')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            filter: 'hue-rotate(180deg) brightness(0.5)',
                        }}
                    />

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 z-10 bg-gradient-to-bl from-background via-background/95 to-transparent" />
                </>
            )}

            <motion.div
                initial={isModal ? { opacity: 1 } : { opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn("relative z-20 w-full px-6", isModal ? "max-w-none py-0" : "max-w-xl py-12")}
            >
                <div className={cn("grid backdrop-blur-2xl bg-background/20 border border-border/50 shadow-2xl overflow-hidden", isModal ? "grid-cols-1 border-none shadow-none bg-transparent" : "md:grid-cols-5")}>
                    {/* Left Side - Info */}
                    {!isModal && (
                        <div className="md:col-span-2 bg-foreground/5 p-10 border-r border-border/50 hidden md:flex flex-col justify-between">
                            <div>
                                <Link href="/" className="inline-block mb-12">
                                    <span className="font-[family-name:var(--font-display)] text-3xl tracking-tighter text-foreground">
                                        NEXIS<span className="text-accent">.</span>AI
                                    </span>
                                </Link>
                                <h2 className="font-[family-name:var(--font-display)] text-5xl tracking-tight leading-[0.9] text-foreground mb-8">
                                    JOIN THE <br />EVOLUTION
                                </h2>
                                <ul className="space-y-6">
                                    {[
                                        "Predictive Intelligence",
                                        "Multi-modal Synthesis",
                                        "Global Edge Nodes",
                                        "Zero-Trust Security"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                                            <CheckCircle2 className="w-4 h-4 text-accent" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-muted-foreground/60">
                                Protocol established. Prepare for uplink.
                            </p>
                        </div>
                    )}

                    {/* Right Side - Form */}
                    <div className={cn("p-10 md:p-12 bg-background/40", isModal ? "md:col-span-1 p-4 bg-transparent" : "md:col-span-3")}>
                        {!isModal && (
                            <div className="mb-10 lg:hidden text-center">
                                <Link href="/" className="inline-block mb-4">
                                    <span className="font-[family-name:var(--font-display)] text-3xl tracking-tighter text-foreground">
                                        NEXIS<span className="text-accent">.</span>AI
                                    </span>
                                </Link>
                            </div>
                        )}

                        <div className="mb-8">
                            <h1 className="font-[family-name:var(--font-display)] text-2xl tracking-tight text-foreground uppercase text-center">
                                {isModal ? "INITIALIZE_PROFILE" : "Create Operative Profile"}
                            </h1>
                        </div>

                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            <div className="space-y-2">
                                <label className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground ml-1">
                                    <span>OPERATIVE_NAME</span>
                                    {form.formState.errors.name && (
                                        <span className="text-red-500 text-[8px] lowercase tracking-normal">[{form.formState.errors.name.message}]</span>
                                    )}
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="h-4 w-4 text-muted-foreground/40 group-focus-within:text-accent transition-colors" />
                                    </div>
                                    <input
                                        {...form.register("name")}
                                        className="w-full bg-background/50 border border-border px-11 py-3 font-mono text-sm text-foreground focus:border-accent outline-none transition-colors"
                                        placeholder="Identity Code"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground ml-1">
                                    <span>TERMINAL_ID (EMAIL)</span>
                                    {form.formState.errors.email && (
                                        <span className="text-red-500 text-[8px] lowercase tracking-normal">[{form.formState.errors.email.message}]</span>
                                    )}
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-4 w-4 text-muted-foreground/40 group-focus-within:text-accent transition-colors" />
                                    </div>
                                    <input
                                        {...form.register("email")}
                                        className="w-full bg-background/50 border border-border px-11 py-3 font-mono text-sm text-foreground focus:border-accent outline-none transition-colors"
                                        placeholder="agent@nexis.ai"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground ml-1">
                                    <span>SECURITY_CODE</span>
                                    {form.formState.errors.password && (
                                        <span className="text-red-500 text-[8px] lowercase tracking-normal">[{form.formState.errors.password.message}]</span>
                                    )}
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-4 w-4 text-muted-foreground/40 group-focus-within:text-accent transition-colors" />
                                    </div>
                                    <input
                                        {...form.register("password")}
                                        type={showPassword ? "text" : "password"}
                                        className="w-full bg-background/50 border border-border px-11 py-3 font-mono text-sm text-foreground focus:border-accent outline-none transition-colors"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground/40 hover:text-accent transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                    <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-accent transition-all duration-500 group-focus-within:w-full" />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full relative group mt-8 overflow-hidden bg-white/5 border border-white/10 py-4 px-6 transition-all duration-300 hover:bg-accent/10 hover:border-accent/50 disabled:opacity-50"
                            >
                                <div className="relative z-10 flex items-center justify-center gap-3">
                                    {isLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-accent" />
                                    ) : (
                                        <>
                                            <ScrambleTextOnHover text="INITIALIZE_ONBOARDING" as="span" className="text-[11px] font-bold tracking-[0.2em] text-foreground group-hover:text-accent transition-colors" />
                                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-all group-hover:translate-x-1" />
                                        </>
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            </button>
                        </form>

                        <div className={cn("text-center", isModal ? "mt-6" : "mt-8")}>
                            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
                                Already registered?{" "}
                                {isModal ? (
                                    <button
                                        type="button"
                                        onClick={onToggleMode}
                                        className="text-accent hover:text-accent/80 transition-colors underline underline-offset-4 decoration-accent/20 font-bold"
                                    >
                                        Authorize Session
                                    </button>
                                ) : (
                                    <Link href="/login" className="text-accent hover:text-accent/80 transition-colors underline underline-offset-4 decoration-accent/20">
                                        Authorize Session
                                    </Link>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Footer Status */}
                    {!isModal && (
                        <div className="px-8 py-4 bg-white/[0.02] border-t border-border/20 flex items-center justify-between font-mono text-[8px] uppercase tracking-widest text-muted-foreground/40">
                            <div className="flex items-center gap-4">
                                <span>REGION: GLOBAL-NODE-01</span>
                                <span className="text-accent/40 animate-pulse">ENCRYPTION: AES-256-GCM</span>
                            </div>
                            <span>v.1.0.4</span>
                        </div>
                    )}
                </div>
            </motion.div>
        </main>
    )
}
