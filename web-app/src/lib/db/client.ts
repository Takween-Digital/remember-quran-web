import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1"
import * as schema from "./schema"

export type AppDatabase = DrizzleD1Database<typeof schema>

declare global {
  // eslint-disable-next-line no-var
  var __app_db: AppDatabase | undefined
}

/**
 * Resolves the D1 Drizzle database instance.
 * In Cloudflare Pages / Workers environment, passes through `getRequestContext().env.DB` or global binding.
 */
export function getDb(d1Instance?: D1Database): AppDatabase {
  if (d1Instance) {
    return drizzle(d1Instance, { schema })
  }

  // Check if running within Cloudflare Pages / OpenNext / Workers request context
  try {
    const cfContext = (globalThis as unknown as Record<symbol, any>)[Symbol.for("__cloudflare-context__")]
    if (cfContext?.env?.DB) {
      return drizzle(cfContext.env.DB, { schema })
    }
    const cf = (globalThis as unknown as { env?: { DB?: D1Database } })?.env?.DB
    if (cf) {
      return drizzle(cf, { schema })
    }
  } catch {
    // ignore
  }

  // Fallback / cached dev instance
  if (!globalThis.__app_db && (process.env as unknown as { DB?: D1Database })?.DB) {
    globalThis.__app_db = drizzle((process.env as unknown as { DB: D1Database }).DB, { schema })
  }

  if (globalThis.__app_db) {
    return globalThis.__app_db
  }

  // Outside a Cloudflare context (plain `next dev`/`next start`) there's no
  // real D1 binding — fall back to a real local SQLite file via node:sqlite
  // so DB-backed routes (auth, bookmarks, hifz, notes...) actually work
  // during local development, not just during `next build`'s static
  // analysis. Guarded in case node:sqlite genuinely isn't available (older
  // Node, or an actual Workers runtime that reaches this branch some other
  // way) — falls back to a no-op mock rather than crashing.
  try {
    const { createLocalD1 } = require("./local-sqlite") as typeof import("./local-sqlite")
    globalThis.__app_db = drizzle(createLocalD1(), { schema })
    return globalThis.__app_db
  } catch {
    // ignore — fall through to the no-op mock below
  }

  // Structurally minimal — only the members drizzle-orm's D1 driver actually calls.
  const mockD1 = {
    prepare: () => ({
      bind: () => ({ all: async () => ({ results: [] }), first: async () => null, run: async () => ({}) }),
      all: async () => ({ results: [] }),
      first: async () => null,
      run: async () => ({}),
    }),
    dump: async () => new ArrayBuffer(0),
    batch: async () => [],
    exec: async () => ({}),
  } as unknown as D1Database

  return drizzle(mockD1, { schema })
}
