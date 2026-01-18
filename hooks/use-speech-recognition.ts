"use client"

import { useState, useEffect, useCallback, useRef } from "react"

export function useSpeechRecognition() {
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState("")
    const recognitionRef = useRef<any>(null)
    const [hasSupport, setHasSupport] = useState(false)

    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition =
                (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

            if (SpeechRecognition) {
                const recognitionInstance = new SpeechRecognition()
                recognitionInstance.continuous = true
                recognitionInstance.interimResults = true
                recognitionInstance.lang = "en-US"

                recognitionInstance.onresult = (event: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                    let finalTranscript = ""
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript
                        }
                    }
                    if (finalTranscript) {
                        setTranscript(prev => prev + " " + finalTranscript)
                    }
                }

                recognitionInstance.onerror = (event: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                    console.error("Speech recognition error", event.error)
                    setIsListening(false)
                }

                recognitionInstance.onend = () => {
                    setIsListening(false)
                }

                recognitionRef.current = recognitionInstance
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setHasSupport(true)
            }
        }
    }, [])

    const startListening = useCallback(() => {
        const recognition = recognitionRef.current
        if (recognition) {
            try {
                recognition.start()
                setIsListening(true)
            } catch (error) {
                console.error("Speech recognition start failed:", error)
            }
        }
    }, [])

    const stopListening = useCallback(() => {
        const recognition = recognitionRef.current
        if (recognition) {
            try {
                recognition.stop()
                setIsListening(false)
            } catch (error) {
                console.error("Speech recognition stop failed:", error)
            }
        }
    }, [])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.onresult = null
                recognitionRef.current.onerror = null
                recognitionRef.current.onend = null
                // attempt stop?
                try { recognitionRef.current.abort() } catch (e) { }
            }
        }
    }, [])

    return {
        isListening,
        transcript,
        setTranscript,
        startListening,
        stopListening,
        hasSupport
    }
}
