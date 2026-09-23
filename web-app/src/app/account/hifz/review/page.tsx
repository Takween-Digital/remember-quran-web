"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/components/auth/AuthProvider"
import { getChapters } from "@/lib/quranApi"
import { listMemorisedAyahs } from "@/lib/firebase/hifz"
import { HifzReviewSession } from "@/components/account/HifzReviewSession"
import type { HifzAyahDto } from "@/components/account/HifzView"

export default function HifzReviewPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<HifzAyahDto[] | null>(null)

  useEffect(() => {
    if (!user) return

    let isMounted = true
    const fetchData = async () => {
      try {
        const [rows, chapters] = await Promise.all([
          listMemorisedAyahs(user.uid),
          getChapters(),
        ])

        const chapterById = new Map(chapters.map((c) => [c.id, c]))

        const now = new Date().getTime()

        // Find ayahs that are due or haven't been reviewed yet
        const dueRows = rows.filter((r) => {
          if (!r.nextReviewAt) return true
          return r.nextReviewAt.getTime() <= now
        })

        // Fallback to all memorised rows if none are strictly due, so user can practice anytime
        const activeRows = dueRows.length > 0 ? dueRows : rows

        const ayahs: HifzAyahDto[] = activeRows.map((r) => {
          const chapter = chapterById.get(r.surahId)
          return {
            verseKey: r.verseKey,
            surahId: r.surahId,
            ayahId: r.ayahId,
            surahName: chapter?.name_simple ?? `Surah ${r.surahId}`,
            surahArabic: chapter?.name_arabic ?? "",
            memorisedAt: r.memorisedAt.toISOString(),
            repetitions: r.repetitions ?? 0,
            intervalDays: r.intervalDays ?? 1,
            easeFactor: r.easeFactor ?? 2.5,
            nextReviewAt: r.nextReviewAt ? r.nextReviewAt.toISOString() : null,
            lastReviewedAt: r.lastReviewedAt ? r.lastReviewedAt.toISOString() : null,
          }
        })

        if (isMounted) {
          setData(ayahs)
        }
      } catch (error) {
        console.error("Failed to fetch hifz review:", error)
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
        <div className="mb-6">
          <p className="text-xs font-medium tracking-[0.16em] text-primary uppercase">
            Spaced Repetition
          </p>
          <h1 className="mt-1.5 font-serif text-3xl font-medium tracking-tight">
            Hifz Review
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Self-paced recall test using the SM-2 algorithm to reinforce long-term Quran retention.
          </p>
        </div>

        {loading || !data ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        ) : (
          <HifzReviewSession initialDueAyahs={data} />
        )}
      </div>
    </ProtectedRoute>
  )
}
