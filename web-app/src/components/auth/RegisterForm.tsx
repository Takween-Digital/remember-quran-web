"use client"

import { useState, useEffect, type FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { auth } from "@/lib/firebase/client"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { useAuth } from "@/components/auth/AuthProvider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { validateCredentials } from "@/lib/auth/credentials"
import { safeNextPath } from "@/lib/auth/safe-next"
import { ensureServerSession } from "@/lib/auth/establish-session"
import { cn } from "@/lib/utils"

const fieldLabel =
  "mb-1.5 block text-xs font-medium tracking-wide text-muted-foreground"

export function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user: sessionUser, loading: sessionPending } = useAuth()
  const next = safeNextPath(searchParams.get("next"), "/account")

  useEffect(() => {
    if (sessionPending || !sessionUser) return
    let cancelled = false
    ensureServerSession(sessionUser).then((ok) => {
      if (cancelled) return
      if (ok) {
        window.location.assign(next)
      } else {
        // Client thinks we're signed in but the server couldn't mint a
        // session cookie for it (stale/invalid client auth state) — sign
        // out instead of looping back here forever.
        auth.signOut()
      }
    })
    return () => {
      cancelled = true
    }
  }, [sessionPending, sessionUser, next])

  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const parsed = validateCredentials(email, password)
    if (!parsed.success) {
      setError(parsed.error)
      return
    }

    if (displayName.trim().length > 80) {
      setError("Display name must be at most 80 characters.")
      return
    }

    setPending(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, parsed.data.email, parsed.data.password)
      
      if (displayName.trim()) {
        await updateProfile(userCredential.user, { displayName: displayName.trim() })
      }

      const idToken = await userCredential.user.getIdToken()
      
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken, displayName: displayName.trim() }),
      })

      if (!res.ok) {
        throw new Error("Failed to create session")
      }

      window.location.assign(next)
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.")
      setPassword("")
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <div>
        <label htmlFor="register-name" className={fieldLabel}>
          Display name <span className="font-normal">(optional)</span>
        </label>
        <Input
          id="register-name"
          name="displayName"
          type="text"
          autoComplete="name"
          maxLength={80}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="h-11 bg-card/60 px-3 text-base backdrop-blur-sm md:text-sm"
          disabled={pending}
        />
      </div>

      <div>
        <label htmlFor="register-email" className={fieldLabel}>
          Email
        </label>
        <Input
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 bg-card/60 px-3 text-base backdrop-blur-sm md:text-sm"
          disabled={pending}
        />
      </div>

      <div>
        <label htmlFor="register-password" className={fieldLabel}>
          Password
        </label>
        <PasswordInput
          id="register-password"
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-11 bg-card/60 px-3 text-base backdrop-blur-sm md:text-sm"
          disabled={pending}
        />
        <p className="mt-1.5 text-xs text-muted-foreground">
          At least 8 characters.
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        className={cn("h-11 w-full text-sm")}
        disabled={pending}
      >
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  )
}
