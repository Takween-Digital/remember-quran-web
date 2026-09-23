import { eq, and, gte, lte, not, sql } from "drizzle-orm"
import { getDb } from "./client"
import { progress, users } from "./schema"
import { localDayStart, localDayKey } from "@/lib/progress/date"

export interface AyahRange {
  from: number
  to: number
}

export interface ProgressEventRecord {
  surah: number
  ranges: AyahRange[]
  date: Date
}

export function mergeRanges(ranges: AyahRange[]): AyahRange[] {
  if (ranges.length === 0) return []
  const sorted = [...ranges].sort((a, b) => a.from - b.from)
  const merged: AyahRange[] = [{ ...sorted[0]! }]
  for (const r of sorted.slice(1)) {
    const last = merged[merged.length - 1]!
    if (r.from <= last.to + 1) {
      last.to = Math.max(last.to, r.to)
    } else {
      merged.push({ ...r })
    }
  }
  return merged
}

function rangesEqual(a: AyahRange[], b: AyahRange[]): boolean {
  return (
    a.length === b.length &&
    a.every((r, i) => r.from === b[i]!.from && r.to === b[i]!.to)
  )
}

function sumRanges(ranges: AyahRange[]): number {
  return ranges.reduce((total, r) => total + Math.max(0, r.to - r.from + 1), 0)
}

export async function recordProgressEvent(
  userId: string,
  surah: number,
  fromAyah: number,
  toAyah: number,
  timeZone: string,
): Promise<ProgressEventRecord> {
  const db = getDb()
  const now = new Date()
  const date = localDayStart(timeZone, now)
  const id = `${userId}_${surah}_${localDayKey(timeZone, now)}`

  const existing = await db
    .select()
    .from(progress)
    .where(eq(progress.id, id))
    .limit(1)

  if (!existing[0]) {
    const ranges: AyahRange[] = [{ from: fromAyah, to: toAyah }]
    await db.insert(progress).values({
      id,
      userId,
      surahId: surah,
      ranges,
      date,
      createdAt: now,
    })

    await db
      .update(users)
      .set({
        viewedSurahs: sql`json_array_append(
          COALESCE(viewedSurahs, json_array()),
          '$',
          ${surah}
        )`,
        updatedAt: now,
      })
      .where(
        and(
          eq(users.id, userId),
          not(sql`json_contains(COALESCE(viewedSurahs, json_array()), json(${surah}))`)
        )
      )

    return { surah, ranges, date }
  }

  const existingRanges = (existing[0].ranges ?? []) as AyahRange[]
  const merged = mergeRanges([...existingRanges, { from: fromAyah, to: toAyah }])

  if (!rangesEqual(merged, existingRanges)) {
    await db.update(progress).set({ ranges: merged }).where(eq(progress.id, id))
  }

  return { surah, ranges: merged, date }
}

export async function sumAyahsForDay(userId: string, day: Date): Promise<number> {
  const db = getDb()
  const rows = await db
    .select()
    .from(progress)
    .where(and(eq(progress.userId, userId), eq(progress.date, day)))

  let total = 0
  for (const row of rows) {
    total += sumRanges((row.ranges ?? []) as AyahRange[])
  }
  return total
}

export async function sumAyahsForDateRange(
  userId: string,
  startDate: Date,
  endDate: Date,
): Promise<Record<string, number>> {
  const db = getDb()
  const rows = await db
    .select()
    .from(progress)
    .where(and(eq(progress.userId, userId), gte(progress.date, startDate), lte(progress.date, endDate)))

  const map: Record<string, number> = {}
  for (const row of rows) {
    const key = row.date.toISOString().split("T")[0]
    const ayahs = sumRanges((row.ranges ?? []) as AyahRange[])
    map[key] = (map[key] ?? 0) + ayahs
  }
  return map
}

export async function getYearActivityHeatmap(
  userId: string,
  timeZone: string,
  startDate: Date,
): Promise<Record<string, number>> {
  const db = getDb()
  const rows = await db
    .select()
    .from(progress)
    .where(and(eq(progress.userId, userId), gte(progress.date, startDate)))

  const map: Record<string, number> = {}
  for (const row of rows) {
    const d = new Date(row.date)
    const key = localDayKey(timeZone, d)
    const ayahs = sumRanges((row.ranges ?? []) as AyahRange[])
    map[key] = (map[key] ?? 0) + ayahs
  }
  return map
}

export async function sumTotalAyahsRead(userId: string): Promise<number> {
  const db = getDb()
  const rows = await db
    .select()
    .from(progress)
    .where(eq(progress.userId, userId))

  let total = 0
  for (const row of rows) {
    total += sumRanges((row.ranges ?? []) as AyahRange[])
  }
  return total
}

export async function getSurahReadRanges(userId: string, surahId: number): Promise<AyahRange[]> {
  const db = getDb()
  const rows = await db
    .select({ ranges: progress.ranges })
    .from(progress)
    .where(and(eq(progress.userId, userId), eq(progress.surahId, surahId)))

  const allRanges: AyahRange[] = []
  for (const row of rows) {
    if (row.ranges && Array.isArray(row.ranges)) {
      allRanges.push(...(row.ranges as AyahRange[]))
    }
  }

  return mergeRanges(allRanges)
}
