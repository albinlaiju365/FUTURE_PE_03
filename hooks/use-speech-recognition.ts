"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { toast } from "sonner"

export function useSpeechRecognition() {
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState("")
    const recognitionRef = useRef<any>(null)

    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition =
                (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

            if (!SpeechRecognition) {
                console.error("Speech recognition not supported in this browser.")
                return
            }

            const recognition = new SpeechRecognition()
            recognition.continuous = true
            recognition.interimResults = true
            recognition.lang = "en-US"

            recognition.onstart = () => {
                setIsListening(true)
                toast.success("Voice Module Active", { description: "Listening for input..." })
            }

            recognition.onresult = (event: any) => {
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

            recognition.onerror = (event: any) => {
                console.error("Speech recognition error", event.error)
                setIsListening(false)

                if (event.error === 'not-allowed') {
                    toast.error("Microphone Access Denied", { description: "Please allow microphone access in your browser settings." })
                } else if (event.error === 'no-speech') {
                    // Ignore no-speech errors, just restart or let it be
                } else {
                    toast.error("Voice Module Error", { description: event.error })
                }
            }

            recognition.onend = () => {
                setIsListening(false)
            }

            recognitionRef.current = recognition
        }
    }, [])

    const startListening = useCallback(async () => {
        if (!recognitionRef.current) {
            toast.error("Voice Not Supported", { description: "Your browser does not support speech recognition." })
            return
        }

        try {
            // Explicitly request microphone permission first to trigger the prompt
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // If we get here, permission is granted. We can stop the stream immediately
            // because we only needed it to trigger the permission prompt.
            stream.getTracks().forEach(track => track.stop());

            // Now start the actual recognition
            try {
                recognitionRef.current.start()
            } catch (innerError) {
                // Ignore if already started
            }

        } catch (error) {
            console.error("Microphone permission denied:", error);
            toast.error("Microphone Access Denied", { description: "Please allow microphone access in your browser settings." });
        }
    }, [])

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop()
            } catch (error) {
                // Ignore
            }
        }
    }, [])

    return {
        isListening,
        transcript,
        setTranscript,
        startListening,
        stopListening
    }
}
