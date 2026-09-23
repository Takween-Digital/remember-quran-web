import { eq, and, sql, desc, like } from "drizzle-orm"
import { getDb } from "./client"
import { notes } from "./schema"
import type { HighlightColor } from "@/lib/notes/highlights"

export const MAX_NOTES = 2000

export interface NoteRecord {
  verseKey: string
  text: string
  highlightColor: HighlightColor | null
  createdAt: Date
  updatedAt: Date
}

function mapNoteRow(row: typeof notes.$inferSelect): NoteRecord {
  return {
    verseKey: row.verseKey,
    text: row.text,
    highlightColor: (row.highlightColor as HighlightColor | null) ?? null,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  }
}

export async function countNotes(userId: string): Promise<number> {
  const db = getDb()
  const res = await db
    .select({ count: sql<number>`count(*)` })
    .from(notes)
    .where(eq(notes.userId, userId))
  return Number(res[0]?.count || 0)
}

export async function getNote(
  userId: string,
  verseKey: string,
): Promise<NoteRecord | null> {
  const db = getDb()
  const rows = await db
    .select()
    .from(notes)
    .where(and(eq(notes.userId, userId), eq(notes.verseKey, verseKey)))
    .limit(1)

  if (!rows[0]) return null
  return mapNoteRow(rows[0])
}

export async function listNotes(
  userId: string,
  filter: { surahPrefix?: number } = {},
): Promise<NoteRecord[]> {
  const db = getDb()
  const conditions = [eq(notes.userId, userId)]

  if (filter.surahPrefix) {
    conditions.push(like(notes.verseKey, `${filter.surahPrefix}:%`))
  }

  const rows = await db
    .select()
    .from(notes)
    .where(and(...conditions))
    .orderBy(desc(notes.updatedAt))
    .limit(MAX_NOTES)

  return rows.map(mapNoteRow)
}

export type SaveNoteResult =
  | { ok: true; note: NoteRecord }
  | { ok: false; error: "limit-reached" }

export async function saveNote(
  userId: string,
  verseKey: string,
  text: string,
): Promise<SaveNoteResult> {
  const db = getDb()
  const id = `${userId}_${verseKey}`
  const existing = await getNote(userId, verseKey)

  if (!existing) {
    const currentCount = await countNotes(userId)
    if (currentCount >= MAX_NOTES) {
      return { ok: false, error: "limit-reached" }
    }
  }

  const now = new Date()

  if (existing) {
    await db
      .update(notes)
      .set({
        text,
        updatedAt: now,
      })
      .where(and(eq(notes.userId, userId), eq(notes.verseKey, verseKey)))
  } else {
    await db.insert(notes).values({
      id,
      userId,
      verseKey,
      text,
      createdAt: now,
      updatedAt: now,
    })
  }

  const saved = await getNote(userId, verseKey)
  return { ok: true, note: saved! }
}

export async function deleteNote(userId: string, verseKey: string): Promise<void> {
  const db = getDb()
  await db
    .delete(notes)
    .where(and(eq(notes.userId, userId), eq(notes.verseKey, verseKey)))
}

/**
 * E-12: set/clear this ayah's highlight colour independently of its note
 * text — a row can now exist for a highlight alone. Clearing the colour on
 * a row with no note text removes the row entirely (nothing left to keep).
 */
export async function setHighlightColor(
  userId: string,
  verseKey: string,
  color: HighlightColor | null,
): Promise<NoteRecord | null> {
  const db = getDb()
  const existing = await getNote(userId, verseKey)
  const now = new Date()

  if (!existing) {
    if (color === null) return null
    const currentCount = await countNotes(userId)
    if (currentCount >= MAX_NOTES) return null
    await db.insert(notes).values({
      id: `${userId}_${verseKey}`,
      userId,
      verseKey,
      text: "",
      highlightColor: color,
      createdAt: now,
      updatedAt: now,
    })
    return getNote(userId, verseKey)
  }

  if (color === null && existing.text.length === 0) {
    await deleteNote(userId, verseKey)
    return null
  }

  await db
    .update(notes)
    .set({ highlightColor: color, updatedAt: now })
    .where(and(eq(notes.userId, userId), eq(notes.verseKey, verseKey)))

  return getNote(userId, verseKey)
}
