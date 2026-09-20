import { APIError } from "better-auth"
import { auth } from "@/lib/auth"
import { privateJson } from "@/lib/auth/api-response"
import { validatePassword } from "@/lib/auth/credentials"
import { sendPasswordChangedEmail } from "@/lib/email/hostinger"
import { runInBackground } from "@/lib/runInBackground"

export async function PATCH(request: Request) {
  const sessionResult = await auth.api.getSession({ headers: request.headers })
  if (!sessionResult?.user?.id) {
    return privateJson({ error: "Unauthorized." }, 401)
  }

  let body: {
    currentPassword?: unknown
    newPassword?: unknown
    confirmPassword?: unknown
  }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return privateJson({ error: "Invalid JSON body." }, 400)
  }

  if (typeof body.currentPassword !== "string") {
    return privateJson({ error: "Current password is required." }, 400)
  }

  const newPassword = validatePassword(body.newPassword)
  if (!newPassword.success) {
    return privateJson({ error: newPassword.error }, 400)
  }

  if (
    typeof body.confirmPassword !== "string" ||
    body.confirmPassword !== newPassword.password
  ) {
    return privateJson({ error: "New passwords do not match." }, 400)
  }

  if (body.currentPassword === newPassword.password) {
    return privateJson(
      { error: "Choose a password different from your current one." },
      400,
    )
  }

  try {
    // Goes through better-auth's own change-password so the credential
    // `account` row it actually verifies against (not the legacy
    // `users.passwordHash` column this route used to check, which is empty
    // for every account created via the current sign-up flow) gets updated.
    await auth.api.changePassword({
      headers: request.headers,
      body: {
        currentPassword: body.currentPassword,
        newPassword: newPassword.password,
        revokeOtherSessions: true,
      },
    })
  } catch (error) {
    if (error instanceof APIError) {
      const status = error.statusCode >= 400 && error.statusCode < 600 ? error.statusCode : 400
      return privateJson(
        { error: error.body?.message ?? "Current password is incorrect." },
        status,
      )
    }
    console.error("Password change failed", error)
    return privateJson({ error: "Could not change your password." }, 500)
  }

  await runInBackground(sendPasswordChangedEmail(sessionResult.user.email))

  return privateJson({ ok: true, reauthenticate: true })
}
