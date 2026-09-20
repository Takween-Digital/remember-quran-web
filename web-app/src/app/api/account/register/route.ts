import { NextResponse } from "next/server"
import { APIError } from "better-auth"
import { validateCredentials } from "@/lib/auth/credentials"
import { getUserByEmail } from "@/lib/db/users"
import { auth } from "@/lib/auth"
import { sendWelcomeEmail } from "@/lib/email/hostinger"
import { runInBackground } from "@/lib/runInBackground"

export const maxDuration = 30

const MAX_REQUEST_BYTES = 16_384
const DISPLAY_NAME_MAX_LENGTH = 80

interface RegisterBody {
  email?: unknown
  password?: unknown
  displayName?: unknown
}

function json(
  body: Record<string, unknown>,
  status: number,
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  })
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0)
  if (contentLength > MAX_REQUEST_BYTES) {
    return json({ error: "Request is too large." }, 413)
  }

  let body: RegisterBody
  try {
    body = (await request.json()) as RegisterBody
  } catch {
    return json({ error: "Invalid JSON body." }, 400)
  }

  const parsed = validateCredentials(body.email, body.password)
  if (!parsed.success) {
    return json({ error: parsed.error }, 400)
  }

  const displayName =
    typeof body.displayName === "string" ? body.displayName.trim() : ""

  if (displayName.length > DISPLAY_NAME_MAX_LENGTH) {
    return json(
      {
        error: `Display name must be at most ${DISPLAY_NAME_MAX_LENGTH} characters.`,
      },
      400,
    )
  }

  const existing = await getUserByEmail(parsed.data.email)
  if (existing) {
    return json({ error: "An account with this email already exists." }, 409)
  }

  try {
    // Goes through better-auth's own sign-up rather than inserting into the
    // `users`/`account` tables by hand — it's the only thing that writes a
    // credential `account` row in the hash format better-auth's own
    // sign-in later verifies against. A hand-rolled insert here previously
    // left new accounts unable to ever sign back in (a `passwordHash`
    // column with no matching `account` row for better-auth to check).
    const result = await auth.api.signUpEmail({
      body: {
        name: displayName || parsed.data.email.split("@")[0],
        email: parsed.data.email,
        password: parsed.data.password,
      },
    })

    // Best-effort — a welcome email failing to send shouldn't fail an
    // otherwise-successful registration. Backgrounded via waitUntil, not a
    // bare fire-and-forget promise: Workers can terminate the execution
    // context the instant the response below is returned, which would
    // otherwise cut the SMTP connection off mid-handshake.
    await runInBackground(sendWelcomeEmail(result.user.email, displayName || null))

    return json(
      {
        user: {
          id: result.user.id,
          email: result.user.email,
          name: displayName || null,
        },
      },
      201,
    )
  } catch (error) {
    if (error instanceof APIError) {
      const status = error.statusCode >= 400 && error.statusCode < 600 ? error.statusCode : 400
      return json(
        { error: error.body?.message ?? "Could not create your account." },
        status,
      )
    }
    console.error("Registration failed", error)
    return json(
      { error: "Could not create your account. Please try again." },
      500,
    )
  }
}
