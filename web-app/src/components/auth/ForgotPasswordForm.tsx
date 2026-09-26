"use client"

import { useState, type FormEvent } from "react"
import { CheckCircle2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { validateEmail, validatePassword } from "@/lib/auth/credentials"
import { requestPasswordResetOTP, verifyAndResetPassword } from "@/actions/authActions"

type Step = "email" | "otp" | "password"

function extractErrorMessage(err: unknown, fallback: string = "Something went wrong"): string {
  if (!err) return fallback
  if (typeof err === "string") return err
  if (err instanceof Error && err.message) return err.message
  if (typeof err === "object") {
    const maybeObj = err as Record<string, unknown>
    if (typeof maybeObj.message === "string" && maybeObj.message) {
      return maybeObj.message
    }
    if (typeof maybeObj.error === "string" && maybeObj.error) {
      return maybeObj.error
    }
  }
  return fallback
}

export function ForgotPasswordForm() {
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)

  const handleSendCode = async (event: FormEvent) => {
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
      const result = await requestPasswordResetOTP(parsed.email)
      if (result.success) {
        setMessage("Check your email for the 6-digit code!")
        setStep("otp")
        setOtp("")
      } else {
        setError(extractErrorMessage(result.error, "Failed to send code"))
        if (result.cooldownSeconds) {
          setCooldownSeconds(result.cooldownSeconds)
        }
      }
    } catch (err: unknown) {
      setError(extractErrorMessage(err, "Something went wrong"))
    } finally {
      setPending(false)
    }
  }

  const handleVerifyOTP = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setMessage(null)

    if (!otp.trim() || otp.length < 6) {
      setError("Enter the 6-digit code")
      return
    }

    setPending(true)
    try {
      setMessage("Code verified! Now enter your new password")
      setStep("password")
    } catch (err: unknown) {
      setError(extractErrorMessage(err, "Something went wrong"))
    } finally {
      setPending(false)
    }
  }

  const handleResetPassword = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setMessage(null)

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.success) {
      setError(passwordValidation.error)
      return
    }

    setPending(true)
    try {
      const result = await verifyAndResetPassword(email, otp, passwordValidation.password)
      if (result.success) {
        setMessage("✓ Password reset successful! Redirecting to sign in...")
        setTimeout(() => {
          window.location.href = "/login"
        }, 2000)
      } else {
        setError(extractErrorMessage(result.error, "Failed to reset password"))
      }
    } catch (err: unknown) {
      setError(extractErrorMessage(err, "Something went wrong"))
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Step 1: Email */}
      {step === "email" && (
        <form onSubmit={handleSendCode} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="reset-email"
              className="mb-1.5 block text-xs font-medium tracking-wide text-muted-foreground"
            >
              Email Address
            </label>
            <Input
              id="reset-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 bg-background px-3 shadow-sm"
              placeholder="your@email.com"
              required
              disabled={pending}
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {typeof error === "string" ? error : String(error)}
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

          <Button type="submit" size="lg" className="h-11 w-full" disabled={pending || cooldownSeconds > 0}>
            {pending ? "Sending…" : cooldownSeconds > 0 ? `Wait ${cooldownSeconds}s` : "Send Code"}
          </Button>
        </form>
      )}

      {/* Step 2: OTP */}
      {step === "otp" && (
        <form onSubmit={handleVerifyOTP} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="otp-code"
              className="mb-1.5 block text-xs font-medium tracking-wide text-muted-foreground"
            >
              6-Digit Code
            </label>
            <Input
              id="otp-code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="h-11 bg-background px-3 shadow-sm text-center text-lg font-mono tracking-widest"
              placeholder="000000"
              required
              disabled={pending}
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {typeof error === "string" ? error : String(error)}
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

          <Button type="submit" size="lg" className="h-11 w-full" disabled={pending || otp.length < 6}>
            {pending ? "Verifying…" : "Next"}
          </Button>

          <button
            type="button"
            onClick={() => setStep("email")}
            className="w-full text-sm text-muted-foreground hover:text-foreground"
          >
            ← Change email
          </button>
        </form>
      )}

      {/* Step 3: New Password */}
      {step === "password" && (
        <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="new-password"
              className="mb-1.5 block text-xs font-medium tracking-wide text-muted-foreground"
            >
              New Password
            </label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 bg-background px-3 shadow-sm"
              placeholder="Min. 8 characters"
              required
              disabled={pending}
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {typeof error === "string" ? error : String(error)}
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

          <Button type="submit" size="lg" className="h-11 w-full" disabled={pending || !password}>
            {pending ? "Resetting…" : "Reset Password"}
          </Button>

          <button
            type="button"
            onClick={() => setStep("otp")}
            className="w-full text-sm text-muted-foreground hover:text-foreground"
          >
            ← Change code
          </button>
        </form>
      )}
    </div>
  )
}
