import { auth } from "@/auth"
import { privateJson } from "@/lib/auth/api-response"
import { validateEmail } from "@/lib/auth/credentials"
import { getUserById, changeEmail } from "@/lib/db/users"
import { verifyPassword } from "@/lib/auth/password"


export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
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

  const user = await getUserById(session.user.id)
  if (!user) return privateJson({ error: "Account not found." }, 404)

  const correctPassword = await verifyPassword(user.passwordHash, body.currentPassword)
  if (!correctPassword) {
    return privateJson({ error: "Current password is incorrect." }, 400)
  }

  if (user.email === email.email) {
    return privateJson({ ok: true, email: user.email })
  }

  const result = await changeEmail(session.user.id, email.email)
  if (!result.ok) {
    return privateJson(
      { error: "An account with this email already exists." },
      409,
    )
  }

  return privateJson({
    ok: true,
    email: email.email,
    reauthenticate: true,
  })
}
