import { auth } from "@/lib/auth"
import { privateJson } from "@/lib/auth/api-response"
import { validateEmail } from "@/lib/auth/credentials"
import { getUserByEmail } from "@/lib/db/users"
import { checkRateLimit, getClientIp } from "@/lib/rateLimit"


const EMAIL_COOLDOWN_MS = 60 * 1000
const GENERIC_MESSAGE =
  "If an account exists for that email, a reset link has been sent."

const RESET_IP_WINDOW_MS = 15 * 60 * 1000
const RESET_IP_LIMIT = 5
const MIN_RESPONSE_MS = 500

async function enforceMinDelay(startedAt: number) {
  const elapsed = Date.now() - startedAt
  if (elapsed < MIN_RESPONSE_MS) {
    await new Promise((resolve) => setTimeout(resolve, MIN_RESPONSE_MS - elapsed))
  }
}

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const ipCheck = await checkRateLimit(
    `reset-request:ip:${ip}`,
    RESET_IP_LIMIT,
    RESET_IP_WINDOW_MS,
  )
  if (!ipCheck.allowed) {
    return privateJson(
      { error: "Too many requests. Please try again later." },
      429,
      { "Retry-After": String(ipCheck.retryAfterSeconds) },
    )
  }

  const startedAt = Date.now()

  let body: { email?: unknown }
  try {
    body = (await request.json()) as { email?: unknown }
  } catch {
    return privateJson({ error: "Invalid JSON body." }, 400)
  }

  const parsed = validateEmail(body.email)
  if (!parsed.success) {
    await enforceMinDelay(startedAt)
    return privateJson({ ok: true, message: GENERIC_MESSAGE })
  }

  const user = await getUserByEmail(parsed.email)
  if (!user) {
    await enforceMinDelay(startedAt)
    return privateJson({ ok: true, message: GENERIC_MESSAGE })
  }

  const cooldownCheck = await checkRateLimit(
    `reset-cooldown:${user.id}`,
    1,
    EMAIL_COOLDOWN_MS,
  )
  if (!cooldownCheck.allowed) {
    await enforceMinDelay(startedAt)
    return privateJson({ ok: true, message: GENERIC_MESSAGE })
  }

  try {
    // Send password reset email via Better Auth
    await auth.api.requestPasswordReset({
      body: {
        email: user.email,
        redirectTo: "/reset",
      },
    })
  } catch (err) {
    console.warn("password-reset: error requesting reset", err)
  }

  await enforceMinDelay(startedAt)
  return privateJson({ ok: true, message: GENERIC_MESSAGE })
}
