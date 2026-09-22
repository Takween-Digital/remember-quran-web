import type { User } from "firebase/auth"

/**
 * Mints (or refreshes) the server-side "AuthToken" cookie for an
 * already-signed-in Firebase user. The client SDK's signed-in state can
 * outlive the 12-day session cookie, or diverge from it entirely if cookie
 * creation ever failed — calling this before trusting client auth state for
 * a redirect keeps the two in sync instead of bouncing forever between
 * /login and a cookie-gated route.
 */
export async function ensureServerSession(user: User): Promise<boolean> {
  try {
    const idToken = await user.getIdToken()
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    })
    return res.ok
  } catch {
    return false
  }
}
