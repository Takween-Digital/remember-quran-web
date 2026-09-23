"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { useRemoteSet } from "@/hooks/useRemoteSet"
import { listMemorisedAyahs, addHifzRecord, removeHifzRecord } from "@/lib/firebase/hifz"
import { parseVerseKey } from "@/lib/quran/verse-key"

interface HifzContextValue {
  loaded: boolean
  isMemorised: (verseKey: string) => boolean
  isPending: (verseKey: string) => boolean
  toggle: (verseKey: string) => Promise<void>
  refresh: () => Promise<void>
  memorisedCount: number
  getMemorisedCountForSurah: (surahId: number) => number
}

const HifzContext = createContext<HifzContextValue | null>(null)

export function HifzProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const userId = user?.uid ?? null

  const fetchCallback = useCallback(async () => {
    if (!userId) return new Set<string>()
    const ayahs = await listMemorisedAyahs(userId)
    return new Set(ayahs.map((a) => a.verseKey))
  }, [userId])

  const addCallback = useCallback(async (verseKey: string) => {
    if (!userId) throw new Error("Not signed in")
    const parsed = parseVerseKey(verseKey)
    if (!parsed) throw new Error("Invalid verse key")
    await addHifzRecord(userId, verseKey, parsed.surahId, parsed.ayahId)
  }, [userId])

  const deleteCallback = useCallback(async (verseKey: string) => {
    if (!userId) throw new Error("Not signed in")
    await removeHifzRecord(userId, verseKey)
  }, [userId])

  const remote = useRemoteSet({
    fetchKeys: fetchCallback,
    onAdd: addCallback,
    onDelete: deleteCallback,
  })

  const getMemorisedCountForSurah = useCallback(
    (surahId: number) => {
      if (!remote.keys) return 0
      let count = 0
      const prefix = `${surahId}:`
      for (const k of remote.keys) {
        if (k.startsWith(prefix)) {
          count++
        }
      }
      return count
    },
    [remote.keys],
  )

  const value = useMemo<HifzContextValue>(
    () => ({
      loaded: remote.loaded,
      isMemorised: remote.has,
      isPending: remote.isPending,
      toggle: remote.toggle,
      refresh: remote.refresh,
      memorisedCount: remote.size,
      getMemorisedCountForSurah,
    }),
    [remote.loaded, remote.has, remote.isPending, remote.toggle, remote.refresh, remote.size, getMemorisedCountForSurah],
  )

  return <HifzContext.Provider value={value}>{children}</HifzContext.Provider>
}

export function useHifz() {
  const ctx = useContext(HifzContext)
  if (!ctx) {
    throw new Error("useHifz must be used within HifzProvider")
  }
  return ctx
}
