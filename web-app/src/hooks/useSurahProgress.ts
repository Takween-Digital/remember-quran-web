"use client"

import { useEffect, useState } from "react"
import { useSession } from "@/lib/auth/react-compat"

interface AyahRange {
  from: number
  to: number
}

export function useSurahProgress(surahId: number) {
  const { data: session } = useSession()
  const userId = session?.user?.id ?? null

  const [readAyahs, setReadAyahs] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setReadAyahs(new Set())
      setLoading(false)
      return
    }

    let mounted = true
    setLoading(true)

    fetch(`/api/account/progress/surah?surahId=${surahId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch surah progress")
        return res.json() as Promise<{ ranges?: AyahRange[] }>
      })
      .then((data) => {
        if (!mounted) return
        const readSet = new Set<string>()
        if (data.ranges) {
          for (const range of data.ranges) {
            for (let i = range.from; i <= range.to; i++) {
              readSet.add(`${surahId}:${i}`)
            }
          }
        }
        setReadAyahs(readSet)
        setLoading(false)
      })
      .catch(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [userId, surahId])

  return {
    isRead: (verseKey: string) => readAyahs.has(verseKey),
    readCount: readAyahs.size,
    loading,
  }
}
