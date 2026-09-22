import { auth } from "@/auth"

export async function getSessionUserId() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }
  return session.user.id
}
