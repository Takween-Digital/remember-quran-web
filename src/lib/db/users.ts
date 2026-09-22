import { eq, sql } from "drizzle-orm"
import { getDb } from "./client"
import { users } from "./schema"

export interface LastPosition {
  verseKey: string
  surahId: number
  ayahId: number
  updatedAt: Date
}

export interface ActiveGoal {
  type: "pages" | "ayahs" | "khatm"
  target: number
  targetDate?: string | null
  dailyTarget?: number
  daysRemaining?: number
}

export interface Streak {
  currentStreak: number
  longestStreak: number
  lastMetDate: Date | null
}

export interface UserRecord {
  id: string
  email: string
  profile: { displayName: string; avatarUrl: string | null }
  roles: string[]
  moderation: { flagged: boolean; suspended: boolean }
  settings: Record<string, unknown>
  lastPosition: LastPosition | null
  activeGoal: ActiveGoal | null
  streak: Streak
  viewedSurahs: number[]
  createdAt: Date
  updatedAt: Date
}

const DEFAULT_STREAK: Streak = {
  currentStreak: 0,
  longestStreak: 0,
  lastMetDate: null,
}

function mapUserRow(row: typeof users.$inferSelect): UserRecord {
  return {
    id: row.id,
    email: row.email,
    profile: {
      displayName: row.displayName,
      avatarUrl: row.avatarUrl,
    },
    roles: row.roles ?? ["user"],
    moderation: {
      flagged: Boolean(row.moderationFlagged),
      suspended: Boolean(row.moderationSuspended),
    },
    settings: row.settings ?? {},
    lastPosition: row.lastPosition
      ? {
          verseKey: row.lastPosition.verseKey,
          surahId: row.lastPosition.surahId,
          ayahId: row.lastPosition.ayahId,
          updatedAt: new Date(row.lastPosition.updatedAt),
        }
      : null,
    activeGoal: row.activeGoal ?? null,
    streak: {
      currentStreak: row.streak?.currentStreak ?? 0,
      longestStreak: row.streak?.longestStreak ?? 0,
      lastMetDate: row.streak?.lastMetDate ? new Date(row.streak.lastMetDate) : null,
    },
    viewedSurahs: row.viewedSurahs ?? [],
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  }
}

export async function getUserById(userId: string): Promise<UserRecord | null> {
  const db = getDb()
  const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (!rows[0]) return null
  return mapUserRow(rows[0])
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const db = getDb()
  const rows = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1)
  if (!rows[0]) return null
  return mapUserRow(rows[0])
}

export type CreateUserResult =
  | { ok: true; user: UserRecord }
  | { ok: false; error: "email-taken" }

export async function createUser(input: {
  id?: string
  email: string
  displayName: string
}): Promise<CreateUserResult> {
  const db = getDb()
  const normalizedEmail = input.email.toLowerCase().trim()
  const existing = await getUserByEmail(normalizedEmail)
  if (existing) return { ok: false, error: "email-taken" }

  const userId = input.id || crypto.randomUUID()
  const now = new Date()

  await db.insert(users).values({
    id: userId,
    email: normalizedEmail,
    name: input.displayName,
    displayName: input.displayName,
    avatarUrl: null,
    roles: ["user"],
    moderationFlagged: false,
    moderationSuspended: false,
    settings: {},
    lastPosition: null,
    activeGoal: null,
    streak: {
      currentStreak: 0,
      longestStreak: 0,
      lastMetDate: null,
    },
    viewedSurahs: [],
    createdAt: now,
    updatedAt: now,
  })

  const created = await getUserById(userId)
  if (!created) throw new Error("User created but could not be re-read")
  return { ok: true, user: created }
}

export type ChangeEmailResult =
  | { ok: true }
  | { ok: false; error: "email-taken" }

export async function changeEmail(
  userId: string,
  newEmail: string,
): Promise<ChangeEmailResult> {
  const db = getDb()
  const normalized = newEmail.toLowerCase().trim()
  const existing = await getUserByEmail(normalized)
  if (existing && existing.id !== userId) {
    return { ok: false, error: "email-taken" }
  }

  const now = new Date()
  await db
    .update(users)
    .set({
      email: normalized,
      updatedAt: now,
    })
    .where(eq(users.id, userId))

  return { ok: true }
}

export async function updateDisplayName(
  userId: string,
  displayName: string,
): Promise<void> {
  const db = getDb()
  await db
    .update(users)
    .set({
      displayName,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
}

export async function updateLastPosition(
  userId: string,
  position: { verseKey: string; surahId: number; ayahId: number },
): Promise<void> {
  const db = getDb()
  const now = new Date()
  await db
    .update(users)
    .set({
      lastPosition: {
        verseKey: position.verseKey,
        surahId: position.surahId,
        ayahId: position.ayahId,
        updatedAt: now.toISOString(),
      },
      updatedAt: now,
    })
    .where(eq(users.id, userId))
}

