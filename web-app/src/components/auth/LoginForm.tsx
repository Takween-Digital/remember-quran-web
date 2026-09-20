"use client"

import Link from "next/link"
import { useState, useEffect, type FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { authClient } from "@/lib/auth/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { validateCredentials } from "@/lib/auth/credentials"
import { safeNextPath } from "@/lib/auth/safe-next"
import { cn } from "@/lib/utils"

const fieldLabel =
  "mb-1.5 block text-xs font-medium tracking-wide text-muted-foreground"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const next = safeNextPath(searchParams.get("next"), "/account")

  // If the user is already authenticated on the client, immediately send them to destination
  useEffect(() => {
    if (!sessionPending && session?.user) {
      window.location.assign(next)
    }
  }, [sessionPending, session, next])

  // Set by the failure branch below via a real top-level navigation back to
  // this same page (see its comment for why) — read once on load, then
  // stripped from the URL so refreshing doesn't re-show a stale error.
  const failedEmail = searchParams.get("loginFailed") ? searchParams.get("email") : null

  const [email, setEmail] = useState(failedEmail ?? "")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(
    searchParams.get("loginFailed") ? "Invalid email or password." : null,
  )
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!searchParams.get("loginFailed")) return
    const url = new URL(window.location.href)
    url.searchParams.delete("loginFailed")
    url.searchParams.delete("email")
    router.replace(`${url.pathname}${url.search}`, { scroll: false })
    // Only ever meant to run once, against the URL the page loaded with.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const parsed = validateCredentials(email, password)
    if (!parsed.success) {
      setError(parsed.error)
      return
    }

    setPending(true)
    try {
      const result = await authClient.signIn.email({
        email: parsed.data.email,
        password: parsed.data.password,
      })

      if (result.error) {
        const url = new URL(window.location.href)
        url.searchParams.set("loginFailed", "1")
        url.searchParams.set("email", parsed.data.email)
        window.location.assign(url.toString())
        return
      }

      window.location.assign(next)
    } catch {
      setError("Something went wrong. Please try again.")
      setPassword("")
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <div>
        <label htmlFor="login-email" className={fieldLabel}>
          Email
        </label>
        <Input
          id="login-email"
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
        <div className="mb-1.5 flex items-center justify-between">
          <label
            htmlFor="login-password"
            className="block text-xs font-medium tracking-wide text-muted-foreground"
          >
            Password
          </label>
          <Link
            href="/reset"
            className="text-xs text-primary underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <PasswordInput
          id="login-password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-11 bg-card/60 px-3 text-base backdrop-blur-sm md:text-sm"
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

      <Button
        type="submit"
        size="lg"
        className={cn("h-11 w-full text-sm")}
        disabled={pending}
      >
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  )
}
