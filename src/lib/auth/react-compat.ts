"use client"

import { useAuth } from "@/components/auth/AuthProvider"
import { auth } from "@/lib/firebase/client"
import { navigateAfterAuth } from "@/lib/auth/navigate-after-auth"

export function useSession() {
  const { user, loading } = useAuth()
  
  let mappedUser = null
  if (user) {
    mappedUser = {
      id: user.uid,
      name: user.displayName,
      email: user.email,
      image: user.photoURL,
    }
  }

  return {
    data: mappedUser ? { user: mappedUser } : null,
    isPending: loading,
    status: loading ? "pending" : mappedUser ? "authenticated" : "unauthenticated",
    error: null,
    update: async () => {}, // mock update for compatibility
  }
}

export async function signOut({ fetchOptions }: { fetchOptions?: any } = {}) {
  await auth.signOut()
  await fetch("/api/auth/session", { method: "DELETE" })
  if (typeof window !== "undefined") {
    window.location.href = "/"
  }
}

