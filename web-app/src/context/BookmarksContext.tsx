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
import { useAuth } from "@/components/auth/AuthProvider"
import { useRemoteSet } from "@/hooks/useRemoteSet"
import { listBookmarks, addBookmark, removeBookmark, moveBookmark } from "@/lib/firebase/bookmarks"
import { listCollections, getOrCreateFavourites, createCollection as fbCreateCollection } from "@/lib/firebase/collections"

export interface CollectionSummary {
  id: string
  name: string
  isDefault: boolean
}

interface BookmarksContextValue {
  /** True once the signed-in user's bookmarks + collections have loaded */
  loaded: boolean
  collections: CollectionSummary[]
  isBookmarked: (verseKey: string) => boolean
  isPending: (verseKey: string) => boolean
  /** Quick toggle: saves to Favourites, or removes if already saved. */
  toggle: (verseKey: string) => Promise<void>
  /** Save (or move, if already saved) an ayah into a specific collection. */
  saveTo: (verseKey: string, collectionId: string | null) => Promise<boolean>
  createCollection: (name: string) => Promise<CollectionSummary | null>
  /** Re-sync reader icons after account-page mutations */
  refresh: () => Promise<void>
}

const BookmarksContext = createContext<BookmarksContextValue | null>(null)

const EMPTY_COLLECTIONS: CollectionSummary[] = []

export function BookmarksProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const userId = user?.uid ?? null

  const fetchCallback = useCallback(async () => {
    if (!userId) return new Set<string>()
    const bms = await listBookmarks(userId)
    return new Set(bms.map(b => b.verseKey))
  }, [userId])

  const addCallback = useCallback(async (verseKey: string) => {
    if (!userId) throw new Error("Not signed in")
    const fav = await getOrCreateFavourites(userId)
    await addBookmark(userId, verseKey, fav.id)
  }, [userId])

  const deleteCallback = useCallback(async (verseKey: string) => {
    if (!userId) throw new Error("Not signed in")
    await removeBookmark(userId, verseKey)
  }, [userId])

  const remote = useRemoteSet({
    fetchKeys: fetchCallback,
    onAdd: addCallback,
    onDelete: deleteCallback,
  })

  const [collections, setCollections] = useState<CollectionSummary[]>([])
  const [collectionsUserId, setCollectionsUserId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    if (!userId) {
      setCollections([])
      setCollectionsUserId(null)
      return
    }

    listCollections(userId).then((cols) => {
      if (!cancelled) {
        setCollections(cols)
        setCollectionsUserId(userId)
      }
    })

    return () => {
      cancelled = true
    }
  }, [userId])

  const effectiveCollections =
    userId && collectionsUserId === userId ? collections : EMPTY_COLLECTIONS

  const saveTo = useCallback(
    async (verseKey: string, collectionId: string | null) => {
      if (!userId || !remote.keys || remote.isPending(verseKey)) return false
      const wasSaved = remote.has(verseKey)

      remote.setKeysDirect((prev) => new Set(prev ?? []).add(verseKey))

      try {
        const targetCollectionId = collectionId || (await getOrCreateFavourites(userId)).id

        if (wasSaved) {
          await moveBookmark(userId, verseKey, targetCollectionId)
        } else {
          await addBookmark(userId, verseKey, targetCollectionId)
        }
        return true
      } catch {
        if (!wasSaved) {
          remote.setKeysDirect((prev) => {
            const next = new Set(prev ?? [])
            next.delete(verseKey)
            return next
          })
        }
        return false
      }
    },
    [userId, remote],
  )

  const createCollection = useCallback(async (name: string) => {
    if (!userId) return null
    try {
      const created = await fbCreateCollection(userId, name)
      const summary: CollectionSummary = {
        id: created.id,
        name: created.name,
        isDefault: created.isDefault,
      }
      setCollections((prev) => [...prev, summary])
      return summary
    } catch {
      return null
    }
  }, [userId])

  const refreshAll = useCallback(async () => {
    await remote.refresh()
    if (userId) {
      const cols = await listCollections(userId)
      setCollections(cols)
      setCollectionsUserId(userId)
    }
  }, [remote, userId])

  const value = useMemo(
    () => ({
      loaded: remote.loaded,
      collections: effectiveCollections,
      isBookmarked: remote.has,
      isPending: remote.isPending,
      toggle: remote.toggle,
      saveTo,
      createCollection,
      refresh: refreshAll,
    }),
    [
      remote.loaded,
      effectiveCollections,
      remote.has,
      remote.isPending,
      remote.toggle,
      saveTo,
      createCollection,
      refreshAll,
    ],
  )

  return (
    <BookmarksContext.Provider value={value}>
      {children}
    </BookmarksContext.Provider>
  )
}

export function useBookmarks() {
  const ctx = useContext(BookmarksContext)
  if (!ctx) throw new Error("useBookmarks must be used within BookmarksProvider")
  return ctx
}

