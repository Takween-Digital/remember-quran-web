"use client"

import Link from "next/link"
import { useState, type FormEvent } from "react"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { validateEmail } from "@/lib/auth/credentials"
import { auth } from "@/lib/firebase/client"
import { sendPasswordResetEmail } from "firebase/auth"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setMessage(null)

    const parsed = validateEmail(email)
    if (!parsed.success) {
      setError(parsed.error)
      return
    }

    setPending(true)
    try {
      await sendPasswordResetEmail(auth, parsed.email)
      setMessage("If an account exists for that email, a reset link has been sent.")
    } catch (err: any) {
      // Firebase throws errors for invalid emails, etc.
      // Usually, it's safer to not reveal if an email exists, 
      // but sendPasswordResetEmail will do it automatically.
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div>
        <label
          htmlFor="reset-email"
          className="mb-1.5 block text-xs font-medium tracking-wide text-muted-foreground"
        >
          Email
        </label>
        <Input
          id="reset-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-11 bg-background px-3 shadow-sm"
          required
          disabled={pending}
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      {message && (
        <div
          role="status"
          className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-3 text-sm"
        >
          <p className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
            {message}
          </p>
        </div>
      )}

      <Button type="submit" size="lg" className="h-11 w-full" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  )
}
