"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/components/auth/AuthProvider"
import {
  BookmarksView,
  type BookmarkDto,
  type CollectionDto,
} from "@/components/account/BookmarksView"
import { getOrCreateFavourites, listCollections } from "@/lib/firebase/collections"
import { listBookmarks } from "@/lib/firebase/bookmarks"
import { getChapters } from "@/lib/quranApi"

export default function BookmarksPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{ collections: CollectionDto[], bookmarks: BookmarkDto[] } | null>(null)

  useEffect(() => {
    if (!user) return

    let isMounted = true
    const fetchData = async () => {
      try {
        const [, bookmarks, chapters] = await Promise.all([
          getOrCreateFavourites(user.uid),
          listBookmarks(user.uid),
          getChapters(),
        ])
        const collections = await listCollections(user.uid)

        const chapterById = new Map(chapters.map((c) => [c.id, c]))

        const collectionDtos: CollectionDto[] = collections.map((c) => ({
          id: c.id,
          name: c.name,
          isDefault: c.isDefault,
        }))

        const bookmarkDtos: BookmarkDto[] = bookmarks
          .map((b) => {
            const [surahId, ayahId] = b.verseKey.split(":").map(Number)
            const chapter = chapterById.get(surahId)
            return {
              verseKey: b.verseKey,
              surahId,
              ayahId,
              collectionId: b.collectionId,
              surahName: chapter?.name_simple ?? `Surah ${surahId}`,
              surahArabic: chapter?.name_arabic ?? "",
            }
          })
          .sort((a, b) => a.surahId - b.surahId || a.ayahId - b.ayahId)

        if (isMounted) {
          setData({ collections: collectionDtos, bookmarks: bookmarkDtos })
        }
      } catch (error) {
        console.error("Failed to fetch bookmarks:", error)
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
            Bookmarks
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Saved ayahs, organised into collections. Tap any ayah to continue
            reading from it.
          </p>
        </div>

        {loading || !data ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        ) : (
          <BookmarksView
            initialCollections={data.collections}
            initialBookmarks={data.bookmarks}
          />
        )}
      </div>
    </ProtectedRoute>
  )
}
