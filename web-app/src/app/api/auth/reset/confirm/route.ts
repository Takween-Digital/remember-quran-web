import { auth } from "@/lib/auth"
import { privateJson } from "@/lib/auth/api-response"
import { validatePassword } from "@/lib/auth/credentials"


export async function POST(request: Request) {
  let body: { oobCode?: unknown; token?: unknown; password?: unknown; confirmPassword?: unknown }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return privateJson({ error: "Invalid JSON body." }, 400)
  }

  const token = typeof body.token === "string" ? body.token : (typeof body.oobCode === "string" ? body.oobCode : "")
  if (!token) {
    return privateJson({ error: "This reset link is invalid or expired." }, 400)
  }
  if (typeof body.password !== "string") {
    return privateJson({ error: "Password is required." }, 400)
  }

  const validated = validatePassword(body.password)
  if (!validated.success) {
    return privateJson({ error: validated.error }, 400)
  }

  if (
    typeof body.confirmPassword !== "string" ||
    body.confirmPassword !== validated.password
  ) {
    return privateJson({ error: "Passwords do not match." }, 400)
  }

  try {
    await auth.api.resetPassword({
      body: {
        newPassword: validated.password,
        token,
      },
    })
    return privateJson({ ok: true })
  } catch (err: unknown) {
    console.error("Reset password failed", err)
    return privateJson({ error: "This reset link is invalid or expired." }, 400)
  }
}
