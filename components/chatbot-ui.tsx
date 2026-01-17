"use client"

import type React from "react"

import { useChat } from "@ai-sdk/react"
// import { Message } from "ai" // inference is better
import { useState, useRef, useEffect } from "react"
import { Send, Mic, Paperclip, ImageIcon, File, Music, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function ChatbotUI({ onAuthTrigger }: { onAuthTrigger?: () => void }) {
  const router = useRouter()
  const { input, handleInputChange } = useChat() as any
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const onLocalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    setIsLoading(true)

    // Save prompt for after login
    localStorage.setItem("pendingPrompt", input)

    if (onAuthTrigger) {
      onAuthTrigger()
      setIsLoading(false)
    } else {
      router.push(`/chat?q=${encodeURIComponent(input)}`)
    }
  }

  const handleMicClick = () => {
    setIsListening(!isListening)
    console.log("[v0] Mic toggled:", !isListening)
  }

  const handleFileSelect = (type: string) => {
    console.log("[v0] File type selected:", type)
    setShowDropdown(false)
  }

  return (
    <div className="flex flex-col gap-4 mt-8 max-w-md w-full">
      {/* Input Area */}
      <form onSubmit={onLocalSubmit} className="flex flex-col gap-3">

        <div className="flex items-center gap-2 border border-border bg-input px-4 py-3 focus-within:border-accent transition-colors duration-200">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask something..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none font-mono"
            disabled={isLoading}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center justify-center p-3 border border-border text-muted-foreground hover:border-accent hover:text-accent transition-all duration-200"
              aria-label="Add files or photos"
            >
              <Paperclip size={16} />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute bottom-full mb-2 left-0 border border-border bg-background rounded-sm shadow-lg z-50 min-w-48 overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleFileSelect("photo")}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground font-mono hover:bg-accent/10 hover:text-accent transition-colors border-b border-border/50"
                >
                  <ImageIcon size={16} />
                  Add Photo
                </button>
                <button
                  type="button"
                  onClick={() => handleFileSelect("file")}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground font-mono hover:bg-accent/10 hover:text-accent transition-colors border-b border-border/50"
                >
                  <File size={16} />
                  Add File
                </button>
                <button
                  type="button"
                  onClick={() => handleFileSelect("audio")}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground font-mono hover:bg-accent/10 hover:text-accent transition-colors"
                >
                  <Music size={16} />
                  Add Audio
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleMicClick}
            className={`flex items-center justify-center p-3 border transition-all duration-200 ${isListening
              ? "border-accent bg-accent/10 text-accent"
              : "border-border text-muted-foreground hover:border-accent hover:text-accent"
              }`}
            aria-label="Toggle microphone"
          >
            <Mic size={16} />
          </button>

          <button
            type="submit"
            disabled={!input?.trim() || isLoading}
            className="flex items-center justify-center flex-1 p-3 border border-foreground/20 text-foreground font-mono text-xs uppercase tracking-widest transition-all duration-200 hover:border-accent hover:text-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin mr-2" />
            ) : (
              <Send size={16} className="mr-2" />
            )}
            {isLoading ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  )
}
