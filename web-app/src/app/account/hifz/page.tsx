"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/components/auth/AuthProvider"
import { HifzView, type HifzAyahDto } from "@/components/account/HifzView"
import { getChapters } from "@/lib/quranApi"
import { listMemorisedAyahs } from "@/lib/firebase/hifz"

export default function HifzPage() {
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

        const ayahs: HifzAyahDto[] = rows.map((r) => {
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
        console.error("Failed to fetch hifz:", error)
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
            Hifz
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Track ayahs you have memorised. Progress by surah and by juz — mark
            or unmark anytime from the reader.
          </p>
        </div>

        {loading || !data ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        ) : (
          <HifzView initialAyahs={data} />
        )}
      </div>
    </ProtectedRoute>
  )
}
