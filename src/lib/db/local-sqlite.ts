import { existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { DatabaseSync, type StatementSync } from "node:sqlite"

/**
 * Real local persistence for `next dev` (no Cloudflare bindings available
 * outside `wrangler`/OpenNext). Without this, `getDb()`'s only fallback was
 * a no-op mock that couldn't run real queries at all — every DB-backed
 * route (register, sign-in, bookmarks, hifz, notes...) either silently saw
 * empty results or, once Drizzle's D1 driver needed `.raw()` for a mapped
 * `select()`, threw outright ("this.stmt.bind(...).raw is not a function").
 *
 * D1 *is* SQLite under the hood, so the same migration SQL in `drizzle/`
 * applies unmodified — this just runs it against a real local SQLite file
 * via Node's built-in `node:sqlite`, and exposes the same `prepare/bind/
 * run/all/first/raw/batch/exec` shape Drizzle's `drizzle-orm/d1` driver
 * expects, so nothing upstream needs to know the difference.
 */

const DB_DIR = join(process.cwd(), ".data")
const DB_PATH = join(DB_DIR, "dev.sqlite3")
const MIGRATIONS_DIR = join(process.cwd(), "drizzle")

function applyMigrationsIfNeeded(db: DatabaseSync) {
  const hasUsersTable = db
    .prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'users'")
    .get()
  if (hasUsersTable) return

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort()

  for (const file of files) {
    const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf-8")
    for (const statement of sql.split("--> statement-breakpoint")) {
      const trimmed = statement.trim()
      if (trimmed) db.exec(trimmed)
    }
  }
}

function toD1Result(rows: unknown[]) {
  return { results: rows, success: true, meta: {} }
}

function bindStatement(db: DatabaseSync, sql: string, params: unknown[]) {
  const arrayfy = (stmt: StatementSync) => {
    stmt.setReturnArrays(true)
    return stmt
  }
  return {
    run: async () => {
      const info = db.prepare(sql).run(...(params as never[]))
      return {
        success: true,
        meta: {
          last_row_id: Number(info.lastInsertRowid ?? 0),
          changes: info.changes,
        },
      }
    },
    all: async () => toD1Result(db.prepare(sql).all(...(params as never[]))),
    first: async () => db.prepare(sql).get(...(params as never[])) ?? null,
    // Drizzle's D1 driver calls this for schema-mapped `select()` queries —
    // it wants plain column-value arrays, not row objects (see
    // drizzle-orm/d1/session.js's `.values()`).
    raw: async () => arrayfy(db.prepare(sql)).all(...(params as never[])),
  }
}

export function createLocalD1(): D1Database {
  if (!existsSync(DB_DIR)) mkdirSync(DB_DIR, { recursive: true })
  const db = new DatabaseSync(DB_PATH)
  db.exec("PRAGMA foreign_keys = ON")
  applyMigrationsIfNeeded(db)

  // Structurally minimal — only the members drizzle-orm's D1 driver actually calls.
  return {
    prepare: (sql: string) => ({
      bind: (...params: unknown[]) => bindStatement(db, sql, params),
      run: () => bindStatement(db, sql, []).run(),
      all: () => bindStatement(db, sql, []).all(),
      first: () => bindStatement(db, sql, []).first(),
    }),
    batch: async (statements: { all: () => Promise<unknown> }[]) => {
      const results = []
      for (const statement of statements) results.push(await statement.all())
      return results
    },
    exec: async (query: string) => {
      db.exec(query)
      return {}
    },
    dump: async () => new ArrayBuffer(0),
  } as unknown as D1Database
}
