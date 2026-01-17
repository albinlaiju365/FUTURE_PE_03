"use client"

import { useState, useEffect, useCallback } from "react"

export function useSpeechRecognition() {
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState("")
    const [recognition, setRecognition] = useState<any>(null)

    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition =
                (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

            if (SpeechRecognition) {
                const recognitionInstance = new SpeechRecognition()
                recognitionInstance.continuous = true
                recognitionInstance.interimResults = true
                recognitionInstance.lang = "en-US"
                setRecognition(recognitionInstance)
            }
        }
    }, [])

    const startListening = useCallback(() => {
        if (recognition) {
            try {
                recognition.start()
                setIsListening(true)
            } catch (error) {
                console.error("Speech recognition start failed:", error)
            }
        }
    }, [recognition])

    const stopListening = useCallback(() => {
        if (recognition) {
            try {
                recognition.stop()
                setIsListening(false)
            } catch (error) {
                console.error("Speech recognition stop failed:", error)
            }
        }
    }, [recognition])

    useEffect(() => {
        if (!recognition) return

        recognition.onresult = (event: any) => {
            let finalTranscript = ""
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript
                } else {
                    // interim logic if needed, but for now we might just want to grab the latest
                }
            }
            if (finalTranscript) {
                setTranscript(prev => prev + " " + finalTranscript)
            }
        }

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error)
            setIsListening(false)
        }

        recognition.onend = () => {
            setIsListening(false)
        }

        return () => {
            recognition.onresult = null
            recognition.onerror = null
            recognition.onend = null
        }

    }, [recognition])

    return {
        isListening,
        transcript,
        setTranscript, // To clear it if needed
        startListening,
        stopListening,
        hasSupport: !!recognition
    }
}
