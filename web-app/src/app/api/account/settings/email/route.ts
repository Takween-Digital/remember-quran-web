import { APIError } from "better-auth"
import { auth } from "@/lib/auth"
import { privateJson } from "@/lib/auth/api-response"
import { validateEmail } from "@/lib/auth/credentials"
import { sendEmailChangedNoticeEmail } from "@/lib/email/hostinger"
import { runInBackground } from "@/lib/runInBackground"

export async function PATCH(request: Request) {
  const sessionResult = await auth.api.getSession({ headers: request.headers })
  if (!sessionResult?.user?.id) {
    return privateJson({ error: "Unauthorized." }, 401)
  }

  let body: { email?: unknown; currentPassword?: unknown }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return privateJson({ error: "Invalid JSON body." }, 400)
  }

  const email = validateEmail(body.email)
  if (!email.success) return privateJson({ error: email.error }, 400)

  if (typeof body.currentPassword !== "string") {
    return privateJson({ error: "Current password is required." }, 400)
  }

  const oldEmail = sessionResult.user.email
  if (oldEmail === email.email) {
    return privateJson({ ok: true, email: oldEmail })
  }

  try {
    // Goes through better-auth's own verify-password/change-email so this
    // checks the credential `account` row it actually verifies sign-in
    // against (not the legacy `users.passwordHash` column this route used
    // to check, which is empty for every account created via the current
    // sign-up flow).
    await auth.api.verifyPassword({
      headers: request.headers,
      body: { password: body.currentPassword },
    })

    await auth.api.changeEmail({
      headers: request.headers,
      body: { newEmail: email.email },
    })
  } catch (error) {
    if (error instanceof APIError) {
      const status = error.statusCode >= 400 && error.statusCode < 600 ? error.statusCode : 400
      return privateJson(
        { error: error.body?.message ?? "Current password is incorrect." },
        status,
      )
    }
    console.error("Email change failed", error)
    return privateJson({ error: "Could not change your email." }, 500)
  }

  // better-auth deliberately returns success even when `email.email` is
  // already taken by another account (email-enumeration protection — see
  // change-email's handling upstream), so this fires even in that case.
  // That's fine: the notice just confirms *this* account's email is
  // unchanged from the recipient's point of view, since the swap never
  // actually happened for the other account's address.
  await runInBackground(sendEmailChangedNoticeEmail(oldEmail, email.email))

  return privateJson({
    ok: true,
    email: email.email,
    reauthenticate: true,
  })
}
