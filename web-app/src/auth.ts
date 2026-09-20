import { auth as betterAuthInstance } from "@/lib/auth"
import { headers } from "next/headers"

export async function auth() {
  const reqHeaders = await headers()
  const session = await betterAuthInstance.api.getSession({
    headers: reqHeaders,
  })
  return session
}
