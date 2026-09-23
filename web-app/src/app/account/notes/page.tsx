"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/components/auth/AuthProvider"
import {
  NotesView,
  type AccountNoteDto,
} from "@/components/account/NotesView"
import { getChapters } from "@/lib/quranApi"
import { listNotes } from "@/lib/firebase/notes"

export default function NotesPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AccountNoteDto[] | null>(null)

  useEffect(() => {
    if (!user) return

    let isMounted = true
    const fetchData = async () => {
      try {
        const [notes, chapters] = await Promise.all([
          listNotes(user.uid),
          getChapters(),
        ])

        const chapterById = new Map(chapters.map((c) => [c.id, c]))

        const noteDtos: AccountNoteDto[] = notes.map((n) => {
          const [surahId, ayahId] = n.verseKey.split(":").map(Number)
          const chapter = chapterById.get(surahId)
          return {
            verseKey: n.verseKey,
            surahId,
            ayahId,
            text: n.text,
            surahName: chapter?.name_simple ?? `Surah ${surahId}`,
            surahArabic: chapter?.name_arabic ?? "",
            updatedAt: n.updatedAt.toISOString(),
            createdAt: n.createdAt.toISOString(),
          }
        })

        if (isMounted) {
          setData(noteDtos)
        }
      } catch (error) {
        console.error("Failed to fetch notes:", error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchData()
    return () => { isMounted = false }
  }, [user])

  return (
    <ProtectedRoute>
      <div className="max-w-3xl">
        <div className="mb-7">
          <p className="text-xs font-medium tracking-[0.16em] text-primary uppercase">
            Your account
          </p>
          <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight">
            Notes
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Private notes on ayahs. Only you can see them — tap a reference to
            jump back into reading.
          </p>
        </div>

        {loading || !data ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        ) : (
          <NotesView initialNotes={data} />
        )}
      </div>
    </ProtectedRoute>
  )
}
