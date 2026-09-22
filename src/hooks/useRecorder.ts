"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { saveRecording, getRecording, deleteRecording, type AyahRecording } from "@/lib/db/recordings"

export function useRecorder(verseKey: string) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<Error | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  
  useEffect(() => {
    // Load existing recording on mount
    getRecording(verseKey).then(rec => {
      if (rec) setRecordingBlob(rec.audioBlob)
    }).catch(console.error)
  }, [verseKey])

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType || "audio/webm" })
        setRecordingBlob(blob)
        await saveRecording(verseKey, blob).catch(console.error)
        
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start(200) // fire ondataavailable every 200ms
      setIsRecording(true)
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError(new Error("Microphone access was denied. Please allow microphone access to record your recitation."))
        } else {
          setError(err)
        }
      }
    }
  }, [verseKey])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [])
  
  const clearRecording = useCallback(async () => {
    await deleteRecording(verseKey).catch(console.error)
    setRecordingBlob(null)
  }, [verseKey])

  return {
    isRecording,
    recordingBlob,
    startRecording,
    stopRecording,
    clearRecording,
    error,
  }
}
