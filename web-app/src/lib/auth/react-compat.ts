"use client"

import { authClient } from "@/lib/auth/client"

export function useSession() {
  const { data: session, isPending, error } = authClient.useSession()

  return {
    data: session,
    status: isPending ? ("loading" as const) : session?.user ? ("authenticated" as const) : ("unauthenticated" as const),
    error,
    update: async (_data?: any) => {
      // Better Auth auto-refreshes session or can be called via router.refresh()
      return session
    },
  }
}

export async function signOut(options?: { callbackUrl?: string; callbackURL?: string; redirect?: boolean }) {
  const redirectUrl = options?.callbackUrl || options?.callbackURL
  await authClient.signOut()
  if (redirectUrl && typeof window !== "undefined") {
    window.location.assign(redirectUrl)
  }
}

export const signIn = authClient.signIn

