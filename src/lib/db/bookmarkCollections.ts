import { eq, and, sql, desc, asc } from "drizzle-orm"
import { getDb } from "./client"
import { bookmarkCollections } from "./schema"

export const FAVOURITES_NAME = "Favourites"
export const MAX_COLLECTIONS = 50

export interface BookmarkCollectionRecord {
  id: string
  name: string
  isDefault: boolean
  count: number
}

function mapCollectionRow(row: typeof bookmarkCollections.$inferSelect): BookmarkCollectionRecord {
  return {
    id: row.id,
    name: row.name,
    isDefault: Boolean(row.isDefault),
    count: row.bookmarkCount ?? 0,
  }
}

export async function listCollections(
  userId: string,
): Promise<BookmarkCollectionRecord[]> {
  const db = getDb()
  const rows = await db
    .select()
    .from(bookmarkCollections)
    .where(eq(bookmarkCollections.userId, userId))
    .orderBy(desc(bookmarkCollections.isDefault), asc(bookmarkCollections.createdAt))

  return rows.map(mapCollectionRow)
}

export async function getCollection(
  userId: string,
  id: string,
): Promise<BookmarkCollectionRecord | null> {
  const db = getDb()
  const rows = await db
    .select()
    .from(bookmarkCollections)
    .where(and(eq(bookmarkCollections.userId, userId), eq(bookmarkCollections.id, id)))
    .limit(1)

  return rows[0] ? mapCollectionRow(rows[0]) : null
}

export async function getOrCreateFavourites(
  userId: string,
): Promise<BookmarkCollectionRecord> {
  const db = getDb()
  const existing = await db
    .select()
    .from(bookmarkCollections)
    .where(and(eq(bookmarkCollections.userId, userId), eq(bookmarkCollections.isDefault, true)))
    .limit(1)

  if (existing[0]) return mapCollectionRow(existing[0])

  const byName = await db
    .select()
    .from(bookmarkCollections)
    .where(and(eq(bookmarkCollections.userId, userId), eq(bookmarkCollections.name, FAVOURITES_NAME)))
    .limit(1)

  if (byName[0]) {
    await db
      .update(bookmarkCollections)
      .set({ isDefault: true, updatedAt: new Date() })
      .where(eq(bookmarkCollections.id, byName[0].id))
    return { ...mapCollectionRow(byName[0]), isDefault: true }
  }

  const id = crypto.randomUUID()
  const now = new Date()
  await db.insert(bookmarkCollections).values({
    id,
    userId,
    name: FAVOURITES_NAME,
    isDefault: true,
    bookmarkCount: 0,
    createdAt: now,
    updatedAt: now,
  })

  return { id, name: FAVOURITES_NAME, isDefault: true, count: 0 }
}

export type CreateCollectionResult =
  | { ok: true; collection: BookmarkCollectionRecord }
  | { ok: false; error: "duplicate-name" | "limit-reached" }

export async function createCollection(
  userId: string,
  name: string,
): Promise<CreateCollectionResult> {
  const db = getDb()
  const trimmed = name.trim()

  const dupe = await db
    .select()
    .from(bookmarkCollections)
    .where(and(eq(bookmarkCollections.userId, userId), eq(bookmarkCollections.name, trimmed)))
    .limit(1)

  if (dupe[0]) return { ok: false, error: "duplicate-name" }

  const total = await db
    .select({ count: sql<number>`count(*)` })
    .from(bookmarkCollections)
    .where(eq(bookmarkCollections.userId, userId))

  if (Number(total[0]?.count || 0) >= MAX_COLLECTIONS) {
    return { ok: false, error: "limit-reached" }
  }

  const id = crypto.randomUUID()
  const now = new Date()
  await db.insert(bookmarkCollections).values({
    id,
    userId,
    name: trimmed,
    isDefault: false,
    bookmarkCount: 0,
    createdAt: now,
    updatedAt: now,
  })

  return {
    ok: true,
    collection: { id, name: trimmed, isDefault: false, count: 0 },
  }
}

export type RenameCollectionResult =
  | { ok: true; collection: BookmarkCollectionRecord }
  | { ok: false; error: "not-found" | "is-default" | "duplicate-name" }

export async function renameCollection(
  userId: string,
  id: string,
  name: string,
): Promise<RenameCollectionResult> {
  const db = getDb()
  const trimmed = name.trim()

  const target = await getCollection(userId, id)
  if (!target) return { ok: false, error: "not-found" }
  if (target.isDefault) return { ok: false, error: "is-default" }

  const dupe = await db
    .select()
    .from(bookmarkCollections)
    .where(and(eq(bookmarkCollections.userId, userId), eq(bookmarkCollections.name, trimmed)))
    .limit(1)

  if (dupe[0] && dupe[0].id !== id) return { ok: false, error: "duplicate-name" }

  const now = new Date()
  await db
    .update(bookmarkCollections)
    .set({ name: trimmed, updatedAt: now })
    .where(and(eq(bookmarkCollections.userId, userId), eq(bookmarkCollections.id, id)))

  return {
    ok: true,
    collection: {
      id,
      name: trimmed,
      isDefault: false,
      count: target.count,
    },
  }
}

export type DeleteCollectionResult =
  | { ok: true; movedToFavourites: number }
  | { ok: false; error: "not-found" | "is-default" }

export async function adjustBookmarkCount(
  userId: string,
  collectionId: string,
  delta: number,
): Promise<void> {
  const db = getDb()
  await db
    .update(bookmarkCollections)
    .set({
      bookmarkCount: sql`max(0, ${bookmarkCollections.bookmarkCount} + ${delta})`,
      updatedAt: new Date(),
    })
    .where(and(eq(bookmarkCollections.userId, userId), eq(bookmarkCollections.id, collectionId)))
}

export { deleteCollection } from "./bookmarks"

