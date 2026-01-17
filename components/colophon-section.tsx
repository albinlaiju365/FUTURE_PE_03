"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function ColophonSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.from(headerRef.current, {
          x: -60,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        })
      }

      if (gridRef.current) {
        const columns = gridRef.current.querySelectorAll(":scope > div")
        gsap.from(columns, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        })
      }

      if (footerRef.current) {
        gsap.from(footerRef.current, {
          y: 20,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 95%",
            toggleActions: "play none none reverse",
          },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="colophon"
      className="relative py-32 pl-6 md:pl-28 pr-6 md:pr-12 border-t border-border/30"
    >
      <div ref={headerRef} className="mb-16">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">04 / Information</span>
        <h2 className="mt-4 font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">TECHNICAL STACK</h2>
      </div>

      <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 md:gap-12">
        {/* AI Models */}
        <div className="col-span-1">
          <h4 className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-4">AI Engine</h4>
          <ul className="space-y-2">
            <li className="font-mono text-xs text-foreground/80">GPT-4 Turbo</li>
            <li className="font-mono text-xs text-foreground/80">Whisper v3</li>
            <li className="font-mono text-xs text-foreground/80">Custom Fine-tuning</li>
          </ul>
        </div>

        {/* Infrastructure */}
        <div className="col-span-1">
          <h4 className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-4">Infrastructure</h4>
          <ul className="space-y-2">
            <li className="font-mono text-xs text-foreground/80">AWS SageMaker</li>
            <li className="font-mono text-xs text-foreground/80">Redis Cluster</li>
            <li className="font-mono text-xs text-foreground/80">PostgreSQL</li>
          </ul>
        </div>

        {/* API */}
        <div className="col-span-1">
          <h4 className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-4">Framework</h4>
          <ul className="space-y-2">
            <li className="font-mono text-xs text-foreground/80">Next.js</li>
            <li className="font-mono text-xs text-foreground/80">WebSocket</li>
            <li className="font-mono text-xs text-foreground/80">FastAPI</li>
          </ul>
        </div>

        {/* Security */}
        <div className="col-span-1">
          <h4 className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-4">Security</h4>
          <ul className="space-y-2">
            <li className="font-mono text-xs text-foreground/80">GDPR Compliant</li>
            <li className="font-mono text-xs text-foreground/80">End-to-End Encryption</li>
            <li className="font-mono text-xs text-foreground/80">SOC 2 Type II</li>
          </ul>
        </div>

        {/* Integration */}
        <div className="col-span-1">
          <h4 className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-4">Integration</h4>
          <ul className="space-y-2">
            <li className="font-mono text-xs text-foreground/80">REST API</li>
            <li className="font-mono text-xs text-foreground/80">Webhooks</li>
            <li className="font-mono text-xs text-foreground/80">SDK (Python, JS)</li>
          </ul>
        </div>

        {/* Support */}
        <div className="col-span-1">
          <h4 className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-4">Contact</h4>
          <ul className="space-y-2">
            <li>
              <a
                href="mailto:hello@nexis.ai"
                className="font-mono text-xs text-foreground/80 hover:text-accent transition-colors duration-200"
              >
                Email
              </a>
            </li>
            <li>
              <a
                href="#"
                className="font-mono text-xs text-foreground/80 hover:text-accent transition-colors duration-200"
              >
                Discord
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div
        ref={footerRef}
        className="mt-24 pt-8 border-t border-border/20 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
          © 2025 NEXIS. All rights reserved.
        </p>
        <p className="font-mono text-[10px] text-muted-foreground">Advanced conversational AI. Enterprise ready.</p>
      </div>
    </section>
  )
}
