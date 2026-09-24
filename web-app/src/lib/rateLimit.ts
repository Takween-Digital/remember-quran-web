export interface RateLimitResult {
  allowed: boolean
  /** Seconds until the window resets — only meaningful when `allowed` is false. */
  retryAfterSeconds: number
}

// In-memory rate limit store
const localMemoryStore = new Map<string, { count: number; windowStart: number }>()

/**
 * Fixed-window rate limiter with in-memory storage.
 * For production use with persistent storage, consider Redis or a database.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const now = Date.now()

  const existing = localMemoryStore.get(key)
  if (!existing || now - existing.windowStart >= windowMs) {
    localMemoryStore.set(key, { windowStart: now, count: 1 })
    return { allowed: true, retryAfterSeconds: 0 }
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((existing.windowStart + windowMs - now) / 1000),
    }
  }

  existing.count += 1
  return { allowed: true, retryAfterSeconds: 0 }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim()
    if (first) return first
  }
  return request.headers.get("x-real-ip") ?? "unknown"
}
