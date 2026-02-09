"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui"
import { Mic, MicOff, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

interface VoiceToLogProps {
  studentId: string
  onTranscript?: (text: string) => void
}

export function VoiceToLog({ studentId, onTranscript }: VoiceToLogProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setError("Tarayıcınız ses tanımayı desteklemiyor.")
      return
    }

    const SpeechRecognition =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "tr-TR"

    recognition.onresult = (event: any) => {
      let interimTranscript = ""
      let finalTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " "
        } else {
          interimTranscript += transcript
        }
      }

      setTranscript(finalTranscript + interimTranscript)
    }

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error)
      setError(`Ses tanıma hatası: ${event.error}`)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    if (isListening) {
      recognition.start()
    } else {
      recognition.stop()
    }

    return () => {
      recognition.stop()
    }
  }, [isListening])

  const handleToggle = () => {
    setError(null)
    setIsListening(!isListening)
  }

  const handleSave = () => {
    if (transcript.trim() && onTranscript) {
      onTranscript(transcript)
      setTranscript("")
    }
  }

  return (
    <Card className="rounded-2xl shadow-harmony border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5 text-neuro-purple" />
          🎤 Voice to Log
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-risk-red/10 border border-risk-red/20 text-sm text-risk-red">
            {error}
          </div>
        )}

        <div className="flex items-center justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleToggle}
            className={`
              h-20 w-20 rounded-full flex items-center justify-center
              transition-all
              ${
                isListening
                  ? "bg-risk-red text-white animate-pulse"
                  : "bg-harmony-brain text-white hover:bg-harmony-brain/90"
              }
            `}
          >
            {isListening ? (
              <MicOff className="h-8 w-8" />
            ) : (
              <Mic className="h-8 w-8" />
            )}
          </motion.button>
        </div>

        {isListening && (
          <div className="text-center text-sm text-muted-foreground">
            Dinleniyor...
          </div>
        )}

        {transcript && (
          <div className="space-y-2">
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full p-3 rounded-xl border border-harmony-shadow bg-white min-h-[100px] text-sm"
              placeholder="Transkript buraya gelecek..."
            />
            <Button
              onClick={handleSave}
              className="w-full rounded-xl"
              disabled={!transcript.trim()}
            >
              Kaydet
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

