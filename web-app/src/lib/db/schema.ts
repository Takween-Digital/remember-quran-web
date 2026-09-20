import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core"

/**
 * Users Table
 * Replaces Firestore `users` collection and aligns with Better Auth User schema.
 */
export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull().default(""),
    displayName: text("display_name").notNull().default(""),
    email: text("email").notNull().unique(),
    emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
    image: text("image"),
    avatarUrl: text("avatar_url"),
    passwordHash: text("password_hash").notNull().default(""),
    passwordChangedAt: integer("password_changed_at", { mode: "timestamp_ms" }).notNull().default(new Date(0)),
    roles: text("roles", { mode: "json" }).$type<string[]>().notNull().default(["user"]),
    moderationFlagged: integer("moderation_flagged", { mode: "boolean" }).notNull().default(false),
    moderationSuspended: integer("moderation_suspended", { mode: "boolean" }).notNull().default(false),
    settings: text("settings", { mode: "json" }).$type<Record<string, unknown>>().notNull().default({}),
    lastPosition: text("last_position", { mode: "json" }).$type<{
      verseKey: string
      surahId: number
      ayahId: number
      updatedAt: string
    } | null>(),
    activeGoal: text("active_goal", { mode: "json" }).$type<{
      type: "pages" | "ayahs" | "khatm"
      target: number
      targetDate?: string | null
      dailyTarget?: number
      daysRemaining?: number
    } | null>(),
    streak: text("streak", { mode: "json" }).$type<{
      currentStreak: number
      longestStreak: number
      lastMetDate: string | null
    }>().notNull().default({
      currentStreak: 0,
      longestStreak: 0,
      lastMetDate: null,
    }),
    viewedSurahs: text("viewed_surahs", { mode: "json" }).$type<number[]>().notNull().default([]),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    uniqueIndex("users_email_idx").on(table.email),
  ]
)

/** Better Auth: sessions */
export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
})

/** Better Auth: accounts */
export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp_ms" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp_ms" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
})

/** Better Auth: verification tokens */
export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
})

/**
 * Hifz / Memorised Ayahs
 * Replaces Firestore `users/{userId}/memorisedAyahs` subcollection.
 */
export const hifzEntries = sqliteTable(
  "hifz_entries",
  {
    id: text("id").primaryKey(), // `${userId}_${verseKey}`
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    verseKey: text("verse_key").notNull(),
    surahId: integer("surah_id").notNull(),
    ayahId: integer("ayah_id").notNull(),
    memorisedAt: integer("memorised_at", { mode: "timestamp_ms" }).notNull(),
    repetitions: integer("repetitions").default(0),
    intervalDays: integer("interval_days").default(0),
    easeFactor: integer("ease_factor").default(2500),
    nextReviewAt: integer("next_review_at", { mode: "timestamp_ms" }),
    lastReviewedAt: integer("last_reviewed_at", { mode: "timestamp_ms" }),
  },
  (table) => [
    index("hifz_user_surah_ayah_idx").on(table.userId, table.surahId, table.ayahId),
    uniqueIndex("hifz_user_verse_idx").on(table.userId, table.verseKey),
  ]
)

/**
 * Notes
 * Replaces Firestore `users/{userId}/notes` subcollection.
 */
export const notes = sqliteTable(
  "notes",
  {
    id: text("id").primaryKey(), // `${userId}_${verseKey}`
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    verseKey: text("verse_key").notNull(),
    text: text("text").notNull(),
    // E-12: verse highlight colour ("yellow" | "green" | "blue" | "pink"),
    // null = no highlight. Lives on the same row as the note — a row can now
    // exist for a highlight alone (empty text), a note alone, or both.
    highlightColor: text("highlight_color"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    uniqueIndex("notes_user_verse_idx").on(table.userId, table.verseKey),
    index("notes_user_updated_idx").on(table.userId, table.updatedAt),
  ]
)

/**
 * Bookmark Collections
 * Replaces Firestore `users/{userId}/bookmarkCollections` subcollection.
 */
export const bookmarkCollections = sqliteTable(
  "bookmark_collections",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
    bookmarkCount: integer("bookmark_count").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("coll_user_default_idx").on(table.userId, table.isDefault),
    uniqueIndex("coll_user_name_idx").on(table.userId, table.name),
  ]
)

/**
 * Bookmarks
 * Replaces Firestore `users/{userId}/bookmarks` subcollection.
 */
export const bookmarks = sqliteTable(
  "bookmarks",
  {
    id: text("id").primaryKey(), // `${userId}_${verseKey}`
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    collectionId: text("collection_id").notNull().references(() => bookmarkCollections.id, { onDelete: "cascade" }),
    verseKey: text("verse_key").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    uniqueIndex("bookmarks_user_verse_idx").on(table.userId, table.verseKey),
    index("bookmarks_user_coll_idx").on(table.userId, table.collectionId),
  ]
)

/**
 * Progress Events
 * Replaces Firestore `users/{userId}/progressEvents` subcollection.
 */
export const progress = sqliteTable(
  "progress",
  {
    id: text("id").primaryKey(), // `${userId}_${surah}_${localDayKey}`
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    surahId: integer("surah_id").notNull(),
    ranges: text("ranges", { mode: "json" }).$type<Array<{ from: number; to: number }>>().notNull().default([]),
    date: integer("date", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("progress_user_date_idx").on(table.userId, table.date),
  ]
)
