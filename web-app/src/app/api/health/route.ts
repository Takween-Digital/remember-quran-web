import { NextResponse } from "next/server"
import { getDb } from "@/lib/db/client"
import { sql } from "drizzle-orm"

/**
 * Liveness / readiness for account infrastructure.
 * Always dynamic — never cache health across deploys or cold starts.
 */
export const dynamic = "force-dynamic"

export async function GET() {
  const started = Date.now()

  try {
    const db = getDb()
    await db.run(sql`SELECT 1`)

    return NextResponse.json(
      {
        ok: true,
        service: "rememberquran",
        database: { configured: true, connected: true, engine: "Cloudflare D1" },
        durationMs: Date.now() - started,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Database connection check failed"

    return NextResponse.json(
      {
        ok: false,
        service: "rememberquran",
        database: { configured: true, connected: false, error: message },
        durationMs: Date.now() - started,
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      },
    )
  }
}
