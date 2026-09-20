export interface RateLimitResult {
  allowed: boolean
  /** Seconds until the window resets — only meaningful when `allowed` is false. */
  retryAfterSeconds: number
}

interface KVNamespace {
  get(key: string, type?: "text" | "json"): Promise<any>
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>
}

// In-memory fallback map for local development if KV binding is not yet bound
const localMemoryStore = new Map<string, { count: number; windowStart: number }>()

function getRateLimitKV(): KVNamespace | null {
  try {
    const cfContext = (globalThis as unknown as Record<symbol, any>)[Symbol.for("__cloudflare-context__")]
    if (cfContext?.env?.RATE_LIMIT_KV) return cfContext.env.RATE_LIMIT_KV
    const cfKV = (globalThis as unknown as { env?: { RATE_LIMIT_KV?: KVNamespace } })?.env?.RATE_LIMIT_KV
    if (cfKV) return cfKV
  } catch {
    // ignore
  }
  return null
}

/**
 * Fixed-window rate limiter backed by Cloudflare KV (with in-memory fallback for local dev).
 * Edge-native, zero database transaction overhead.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const kv = getRateLimitKV()
  const now = Date.now()
  const windowSec = Math.ceil(windowMs / 1000)

  if (kv) {
    try {
      const data = await kv.get(`rl:${key}`, "json")
      const windowStart = typeof data?.windowStart === "number" ? data.windowStart : 0
      const count = typeof data?.count === "number" ? data.count : 0
      const expired = now - windowStart >= windowMs

      if (expired || !data) {
        await kv.put(
          `rl:${key}`,
          JSON.stringify({ windowStart: now, count: 1 }),
          { expirationTtl: windowSec + 60 }
        )
        return { allowed: true, retryAfterSeconds: 0 }
      }

      if (count >= limit) {
        return {
          allowed: false,
          retryAfterSeconds: Math.ceil((windowStart + windowMs - now) / 1000),
        }
      }

      await kv.put(
        `rl:${key}`,
        JSON.stringify({ windowStart, count: count + 1 }),
        { expirationTtl: Math.max(60, Math.ceil((windowStart + windowMs - now) / 1000)) }
      )
      return { allowed: true, retryAfterSeconds: 0 }
    } catch (err) {
      console.warn("KV rate limit read/write failed, using memory fallback", err)
    }
  }

  // Memory fallback
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

/** Best-effort client IP from CF-Connecting-IP and standard proxy headers. */
export function getClientIp(request: Request): string {
  const cfIp = request.headers.get("cf-connecting-ip")
  if (cfIp) return cfIp.trim()

  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim()
    if (first) return first
  }
  return request.headers.get("x-real-ip") ?? "unknown"
}
