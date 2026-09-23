"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useSession } from "@/lib/auth/react-compat"
import { isHighlightColor, type HighlightColor } from "@/lib/notes/highlights"

interface NoteEntry {
  verseKey: string
  text: string
  highlightColor: string | null
}

interface VerseEntry {
  hasNote: boolean
  highlightColor: HighlightColor | null
}

type EntryMap = Map<string, VerseEntry>

interface NotesContextValue {
  /** True once the signed-in user's note/highlight data has loaded */
  loaded: boolean
  hasNote: (verseKey: string) => boolean
  /** E-12: this verse's highlight colour, or null if unhighlighted */
  getHighlightColor: (verseKey: string) => HighlightColor | null
  /** Re-sync reader icons after editor / account mutations */
  refresh: () => Promise<void>
  /** Optimistically mark a verse as having / not having a note */
  setHasNote: (verseKey: string, present: boolean) => void
  /** Optimistically set/clear a verse's highlight colour */
  setHighlightColorLocal: (verseKey: string, color: HighlightColor | null) => void
}

const NotesContext = createContext<NotesContextValue | null>(null)

/**
 * One GET per session holds every verseKey with a note and/or highlight
 * (2000 cap), so ayah icons and reading-mode tints render without N+1.
 * Cleared on logout / account switch.
 */
export function NotesProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const userId = session?.user?.id ?? null

  const [entries, setEntries] = useState<EntryMap | null>(null)
  const [entriesUserId, setEntriesUserId] = useState<string | null>(null)

  const effectiveEntries =
    userId && entriesUserId === userId ? entries : null

  useEffect(() => {
    let cancelled = false
    const fetchFor = userId

    import("@/lib/firebase/notes").then(({ listNotes }) => {
      if (cancelled) return
      setEntries(null)
      setEntriesUserId(null)
      if (!fetchFor) return
      
      listNotes(fetchFor).then((notes) => {
        if (cancelled || !fetchFor) return
        const map: EntryMap = new Map()
        for (const n of notes) {
          map.set(n.verseKey, {
            hasNote: n.text.length > 0,
            highlightColor: isHighlightColor(n.highlightColor) ? n.highlightColor as HighlightColor : null,
          })
        }
        setEntries(map)
        setEntriesUserId(fetchFor)
      }).catch(() => {})
    })

    return () => {
      cancelled = true
    }
  }, [userId])

  const refresh = useCallback(async () => {
    if (!userId) return
    try {
      const { listNotes } = await import("@/lib/firebase/notes")
      const notes = await listNotes(userId)
      const map: EntryMap = new Map()
      for (const n of notes) {
        map.set(n.verseKey, {
          hasNote: n.text.length > 0,
          highlightColor: isHighlightColor(n.highlightColor) ? n.highlightColor as HighlightColor : null,
        })
      }
      setEntries(map)
      setEntriesUserId(userId)
    } catch {
      // Reader stays usable — icons may be stale until next refresh
    }
  }, [userId])

  const hasNote = useCallback(
    (verseKey: string) => effectiveEntries?.get(verseKey)?.hasNote ?? false,
    [effectiveEntries],
  )

  const getHighlightColor = useCallback(
    (verseKey: string) => effectiveEntries?.get(verseKey)?.highlightColor ?? null,
    [effectiveEntries],
  )

  const setHasNote = useCallback((verseKey: string, present: boolean) => {
    setEntries((prev) => {
      const next = new Map(prev ?? [])
      const current = next.get(verseKey) ?? { hasNote: false, highlightColor: null }
      if (!present && !current.highlightColor) {
        next.delete(verseKey)
      } else {
        next.set(verseKey, { ...current, hasNote: present })
      }
      return next
    })
  }, [])

  const setHighlightColorLocal = useCallback((verseKey: string, color: HighlightColor | null) => {
    setEntries((prev) => {
      const next = new Map(prev ?? [])
      const current = next.get(verseKey) ?? { hasNote: false, highlightColor: null }
      if (!color && !current.hasNote) {
        next.delete(verseKey)
      } else {
        next.set(verseKey, { ...current, highlightColor: color })
      }
      return next
    })
  }, [])

  const value = useMemo(
    () => ({
      loaded: effectiveEntries !== null,
      hasNote,
      getHighlightColor,
      refresh,
      setHasNote,
      setHighlightColorLocal,
    }),
    [effectiveEntries, hasNote, getHighlightColor, refresh, setHasNote, setHighlightColorLocal],
  )

  return (
    <NotesContext.Provider value={value}>{children}</NotesContext.Provider>
  )
}

export function useNotes() {
  const ctx = useContext(NotesContext)
  if (!ctx) throw new Error("useNotes must be used within NotesProvider")
  return ctx
}
