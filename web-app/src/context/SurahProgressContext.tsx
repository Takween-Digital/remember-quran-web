"use client"

import { createContext, useContext, ReactNode } from "react"
import { useSurahProgress } from "@/hooks/useSurahProgress"

interface SurahProgressContextValue {
  isRead: (verseKey: string) => boolean
  readCount: number
  loading: boolean
}

const SurahProgressContext = createContext<SurahProgressContextValue | null>(null)

export function SurahProgressProvider({
  surahId,
  children,
}: {
  surahId: number
  children: ReactNode
}) {
  const progress = useSurahProgress(surahId)

  return (
    <SurahProgressContext.Provider value={progress}>
      {children}
    </SurahProgressContext.Provider>
  )
}

export function useSurahProgressContext() {
  const ctx = useContext(SurahProgressContext)
  if (!ctx) {
    throw new Error("useSurahProgressContext must be used within SurahProgressProvider")
  }
  return ctx
}
