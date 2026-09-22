import { eq, and, sql, desc, like } from "drizzle-orm"
import { getDb } from "./client"
import { bookmarks, bookmarkCollections } from "./schema"
import {
  adjustBookmarkCount,
  getOrCreateFavourites,
  getCollection,
  DeleteCollectionResult,
} from "./bookmarkCollections"

export const MAX_BOOKMARKS = 2000

export interface BookmarkRecord {
  verseKey: string
  collectionId: string
  createdAt: Date
}

function mapBookmarkRow(row: typeof bookmarks.$inferSelect): BookmarkRecord {
  return {
    verseKey: row.verseKey,
    collectionId: row.collectionId,
    createdAt: new Date(row.createdAt),
  }
}

export async function listBookmarks(
  userId: string,
  filter: { collectionId?: string; surahPrefix?: number } = {},
): Promise<BookmarkRecord[]> {
  const db = getDb()
  const conditions = [eq(bookmarks.userId, userId)]

  if (filter.collectionId) {
    conditions.push(eq(bookmarks.collectionId, filter.collectionId))
  }
  if (filter.surahPrefix) {
    conditions.push(like(bookmarks.verseKey, `${filter.surahPrefix}:%`))
  }

  const rows = await db
    .select()
    .from(bookmarks)
    .where(and(...conditions))
    .orderBy(desc(bookmarks.createdAt))
    .limit(MAX_BOOKMARKS)

  return rows.map(mapBookmarkRow)
}

export async function countBookmarks(userId: string): Promise<number> {
  const db = getDb()
  const res = await db
    .select({ count: sql<number>`count(*)` })
    .from(bookmarks)
    .where(eq(bookmarks.userId, userId))
  return Number(res[0]?.count || 0)
}

export async function getBookmark(
  userId: string,
  verseKey: string,
): Promise<BookmarkRecord | null> {
  const db = getDb()
  const rows = await db
    .select()
    .from(bookmarks)
    .where(and(eq(bookmarks.userId, userId), eq(bookmarks.verseKey, verseKey)))
    .limit(1)

  return rows[0] ? mapBookmarkRow(rows[0]) : null
}

export type CreateBookmarkResult =
  | { ok: true; created: boolean; bookmark: BookmarkRecord }
  | { ok: false; error: "limit-reached" | "collection-not-found" }

export async function createBookmark(
  userId: string,
  verseKey: string,
  collectionId: string | null,
): Promise<CreateBookmarkResult> {
  const db = getDb()
  const existing = await getBookmark(userId, verseKey)
  if (existing) return { ok: true, created: false, bookmark: existing }

  const targetCollectionId = collectionId ?? (await getOrCreateFavourites(userId)).id

  if (collectionId) {
    const col = await getCollection(userId, collectionId)
    if (!col) return { ok: false, error: "collection-not-found" }
  }

  const total = await countBookmarks(userId)
  if (total >= MAX_BOOKMARKS) {
    return { ok: false, error: "limit-reached" }
  }

  const id = `${userId}_${verseKey}`
  const now = new Date()
  await db.insert(bookmarks).values({
    id,
    userId,
    collectionId: targetCollectionId,
    verseKey,
    createdAt: now,
  })

  await adjustBookmarkCount(userId, targetCollectionId, 1)
  const created = await getBookmark(userId, verseKey)
  return { ok: true, created: true, bookmark: created! }
}

export type MoveBookmarkResult =
  | { ok: true; bookmark: BookmarkRecord }
  | { ok: false; error: "not-found" | "collection-not-found" }

export async function moveBookmark(
  userId: string,
  verseKey: string,
  collectionId: string | null,
): Promise<MoveBookmarkResult> {
  const db = getDb()
  const targetCollectionId = collectionId ?? (await getOrCreateFavourites(userId)).id

  if (collectionId) {
    const col = await getCollection(userId, collectionId)
    if (!col) return { ok: false, error: "collection-not-found" }
  }

  const current = await getBookmark(userId, verseKey)
  if (!current) return { ok: false, error: "not-found" }
  if (current.collectionId === targetCollectionId) {
    return { ok: true, bookmark: current }
  }

  await db
    .update(bookmarks)
    .set({ collectionId: targetCollectionId })
    .where(and(eq(bookmarks.userId, userId), eq(bookmarks.verseKey, verseKey)))

  await Promise.all([
    adjustBookmarkCount(userId, current.collectionId, -1),
    adjustBookmarkCount(userId, targetCollectionId, 1),
  ])

  const updated = await getBookmark(userId, verseKey)
  return { ok: true, bookmark: updated! }
}

export async function deleteBookmark(
  userId: string,
  verseKey: string,
): Promise<boolean> {
  const db = getDb()
  const current = await getBookmark(userId, verseKey)
  if (!current) return false

  await db
    .delete(bookmarks)
    .where(and(eq(bookmarks.userId, userId), eq(bookmarks.verseKey, verseKey)))

  await adjustBookmarkCount(userId, current.collectionId, -1)
  return true
}

export async function deleteCollection(
  userId: string,
  id: string,
): Promise<DeleteCollectionResult> {
  const db = getDb()
  const target = await getCollection(userId, id)
  if (!target) return { ok: false, error: "not-found" }
  if (target.isDefault) return { ok: false, error: "is-default" }

  const favourites = await getOrCreateFavourites(userId)

  const toMove = await db
    .select()
    .from(bookmarks)
    .where(and(eq(bookmarks.userId, userId), eq(bookmarks.collectionId, id)))

  const movedCount = toMove.length

  if (movedCount > 0) {
    await db
      .update(bookmarks)
      .set({ collectionId: favourites.id })
      .where(and(eq(bookmarks.userId, userId), eq(bookmarks.collectionId, id)))

    await adjustBookmarkCount(userId, favourites.id, movedCount)
  }

  await db
    .delete(bookmarkCollections)
    .where(and(eq(bookmarkCollections.userId, userId), eq(bookmarkCollections.id, id)))

  return { ok: true, movedToFavourites: movedCount }
}
