import { eq, and, sql, asc } from "drizzle-orm"
import { getDb } from "./client"
import { hifzEntries } from "./schema"

export const MAX_MEMORISED = 6236

export interface MemorisedAyahRecord {
  verseKey: string
  surahId: number
  ayahId: number
  memorisedAt: Date
  repetitions?: number
  intervalDays?: number
  easeFactor?: number
  nextReviewAt?: Date
  lastReviewedAt?: Date
}

function mapHifzRow(row: typeof hifzEntries.$inferSelect): MemorisedAyahRecord {
  return {
    verseKey: row.verseKey,
    surahId: row.surahId,
    ayahId: row.ayahId,
    memorisedAt: new Date(row.memorisedAt),
    repetitions: row.repetitions ?? 0,
    intervalDays: row.intervalDays ?? 0,
    easeFactor: row.easeFactor ?? 2500,
    nextReviewAt: row.nextReviewAt ? new Date(row.nextReviewAt) : undefined,
    lastReviewedAt: row.lastReviewedAt ? new Date(row.lastReviewedAt) : undefined,
  }
}

export async function countMemorisedAyahs(userId: string): Promise<number> {
  const db = getDb()
  const res = await db
    .select({ count: sql<number>`count(*)` })
    .from(hifzEntries)
    .where(eq(hifzEntries.userId, userId))
  return Number(res[0]?.count || 0)
}

export async function listMemorisedAyahs(
  userId: string,
  surahId?: number,
): Promise<MemorisedAyahRecord[]> {
  const db = getDb()
  const conditions = [eq(hifzEntries.userId, userId)]
  if (surahId !== undefined) {
    conditions.push(eq(hifzEntries.surahId, surahId))
  }

  const rows = await db
    .select()
    .from(hifzEntries)
    .where(and(...conditions))
    .orderBy(asc(hifzEntries.surahId), asc(hifzEntries.ayahId))
    .limit(MAX_MEMORISED)

  return rows.map(mapHifzRow)
}

export type MarkMemorisedResult =
  | { ok: true; created: boolean; ayah: MemorisedAyahRecord }
  | { ok: false; error: "limit-reached" }

export async function markMemorised(
  userId: string,
  verseKey: string,
  surahId: number,
  ayahId: number,
): Promise<MarkMemorisedResult> {
  const db = getDb()
  const id = `${userId}_${verseKey}`

  // Check if already exists
  const existing = await db
    .select()
    .from(hifzEntries)
    .where(and(eq(hifzEntries.userId, userId), eq(hifzEntries.verseKey, verseKey)))
    .limit(1)

  if (existing[0]) {
    return { ok: true, created: false, ayah: mapHifzRow(existing[0]) }
  }

  const currentCount = await countMemorisedAyahs(userId)
  if (currentCount >= MAX_MEMORISED) {
    return { ok: false, error: "limit-reached" }
  }

  const now = new Date()
  await db.insert(hifzEntries).values({
    id,
    userId,
    verseKey,
    surahId,
    ayahId,
    memorisedAt: now,
    repetitions: 0,
    intervalDays: 0,
    easeFactor: 2500,
    nextReviewAt: null,
    lastReviewedAt: null,
  })

  const created = await db
    .select()
    .from(hifzEntries)
    .where(eq(hifzEntries.id, id))
    .limit(1)

  return { ok: true, created: true, ayah: mapHifzRow(created[0]!) }
}

export async function recordReviewSRS(
  userId: string,
  verseKey: string,
  srsUpdate: {
    repetitions: number
    intervalDays: number
    easeFactor: number
    nextReviewAt: Date
    lastReviewedAt: Date
  },
): Promise<MemorisedAyahRecord | null> {
  const db = getDb()
  const id = `${userId}_${verseKey}`

  await db
    .update(hifzEntries)
    .set({
      repetitions: srsUpdate.repetitions,
      intervalDays: srsUpdate.intervalDays,
      easeFactor: srsUpdate.easeFactor,
      nextReviewAt: srsUpdate.nextReviewAt,
      lastReviewedAt: srsUpdate.lastReviewedAt,
    })
    .where(and(eq(hifzEntries.userId, userId), eq(hifzEntries.verseKey, verseKey)))

  const updated = await db
    .select()
    .from(hifzEntries)
    .where(eq(hifzEntries.id, id))
    .limit(1)

  return updated[0] ? mapHifzRow(updated[0]) : null
}

export async function unmarkMemorised(userId: string, verseKey: string): Promise<boolean> {
  const db = getDb()
  const res = await db
    .delete(hifzEntries)
    .where(and(eq(hifzEntries.userId, userId), eq(hifzEntries.verseKey, verseKey)))
    .returning({ id: hifzEntries.id })
  return res.length > 0
}
