import { auth } from "@/lib/auth"
import { headers } from "next/headers"

/**
 * Session guard for account APIs. Returns the authenticated user id or null —
 * callers respond 401 themselves so each route controls its error shape.
 */
export async function getSessionUserId(): Promise<string | null> {
  const reqHeaders = await headers()
  const session = await auth.api.getSession({
    headers: reqHeaders,
  })
  return session?.user?.id ?? null
}
