"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/components/auth/AuthProvider"
import { ProgressView } from "@/components/account/ProgressView"
import { getChapters } from "@/lib/quranApi"
import { getUserById } from "@/lib/firebase/users"
import { TOTAL_SURAHS } from "@/lib/progress/date"
import { parseVerseKey } from "@/lib/quran/verse-key"

export default function ProgressPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    if (!user) return

    let isMounted = true
    const fetchData = async () => {
      try {
        const [userDoc, chapters] = await Promise.all([
          getUserById(user.uid),
          getChapters(),
        ])

        const raw = userDoc?.lastPosition ?? null
        let lastPosition = null as null | {
          verseKey: string
          surahId: number
          ayahId: number
          updatedAt: string
        }

        if (raw?.verseKey) {
          const parsed = parseVerseKey(raw.verseKey)
          if (parsed) {
            lastPosition = {
              verseKey: `${parsed.surahId}:${parsed.ayahId}`,
              surahId: parsed.surahId,
              ayahId: parsed.ayahId,
              updatedAt: raw.updatedAt.toISOString(),
            }
          }
        }

        const viewedSurahIds = (userDoc?.viewedSurahs ?? [])
          .filter((n) => Number.isInteger(n) && n >= 1 && n <= TOTAL_SURAHS)
          .sort((a, b) => a - b)

        if (isMounted) {
          setData({ viewedSurahIds, lastPosition, chapters })
        }
      } catch (error) {
        console.error("Failed to fetch progress:", error)
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
            Progress
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Continue where you left off and see which surahs you have viewed.
          </p>
        </div>

        {loading || !data ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        ) : (
          <ProgressView
            viewedSurahIds={data.viewedSurahIds}
            lastPosition={data.lastPosition}
            chapters={data.chapters.map((c: any) => ({
              id: c.id,
              name_simple: c.name_simple,
            }))}
          />
        )}
      </div>
    </ProtectedRoute>
  )
}
