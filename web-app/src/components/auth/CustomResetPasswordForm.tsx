"use client"

import { useState, type FormEvent } from "react"
import { Mail, ArrowRight, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/ui/password-input"
import { requestPasswordResetOTP, verifyAndResetPassword } from "@/actions/authActions"
import { useRouter } from "next/navigation"

type Step = "email" | "otp" | "success"

interface ResetState {
  email: string
  otp: string
  newPassword: string
  confirmPassword: string
}

export function CustomResetPasswordForm() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("email")
  const [state, setState] = useState<ResetState>({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await requestPasswordResetOTP(state.email)
      if (res.success) {
        setStep("otp")
        startResendCountdown()
      } else {
        setError(res.error || "Failed to send code.")
        if (res.cooldownSeconds) {
          setResendCountdown(res.cooldownSeconds)
          startResendCountdown()
        }
      }
    } catch (err) {
      setError("An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  const startResendCountdown = () => {
    let remaining = 60
    setResendCountdown(remaining)
    const interval = setInterval(() => {
      remaining -= 1
      setResendCountdown(remaining)
      if (remaining <= 0) clearInterval(interval)
    }, 1000)
  }

  const handleResendCode = async () => {
    setError("")
    setLoading(true)

    try {
      const res = await requestPasswordResetOTP(state.email)
      if (res.success) {
        startResendCountdown()
        setError("")
      } else {
        setError(res.error || "Failed to resend code.")
      }
    } catch (err) {
      setError("An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  const handleResetSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")

    if (state.newPassword !== state.confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    if (state.newPassword.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    setLoading(true)

    try {
      const res = await verifyAndResetPassword(state.email, state.otp, state.newPassword)
      if (res.success) {
        setStep("success")
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } else {
        setError(res.error || "Failed to reset password.")
      }
    } catch (err) {
      setError("An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  // Success screen
  if (step === "success") {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center">
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-emerald-600" />
          <h3 className="text-lg font-semibold text-emerald-900">Password Reset Successfully</h3>
          <p className="mt-2 text-sm text-emerald-700">
            Your password has been updated. You'll be redirected to login in a few seconds.
          </p>
        </div>
      </div>
    )
  }

  // Email and OTP steps
  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex gap-2">
        <div
          className={`flex-1 h-1 rounded-full transition-colors ${
            step !== "email" ? "bg-primary" : "bg-primary/30"
          }`}
        />
        <div
          className={`flex-1 h-1 rounded-full transition-colors ${
            step === "otp" ? "bg-primary" : "bg-primary/30"
          }`}
        />
      </div>

      {error && (
        <div className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {step === "email" ? (
        <form onSubmit={handleEmailSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <label htmlFor="reset-email" className="block text-sm font-medium">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="reset-email"
                type="email"
                required
                value={state.email}
                onChange={(e) => setState({ ...state, email: e.target.value })}
                placeholder="you@example.com"
                className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-50"
                disabled={loading}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter the email address associated with your account
            </p>
          </div>

          <Button type="submit" size="lg" className="h-11 w-full" disabled={loading || !state.email}>
            {loading ? "Sending code..." : "Send Reset Code"}
            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleResetSubmit} className="space-y-4" noValidate>
          {/* OTP Input */}
          <div className="space-y-2">
            <label htmlFor="reset-otp" className="block text-sm font-medium">
              6-Digit Code
            </label>
            <p className="text-xs text-muted-foreground">Check your email for the code</p>
            <input
              id="reset-otp"
              type="text"
              required
              maxLength={6}
              inputMode="numeric"
              value={state.otp}
              onChange={(e) => setState({ ...state, otp: e.target.value.replace(/\D/g, "") })}
              placeholder="000000"
              className="h-12 w-full rounded-lg border border-input bg-background py-2 text-center text-2xl font-semibold tracking-widest placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-50"
              disabled={loading}
            />
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Expires in 15 minutes</span>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={loading || resendCountdown > 0}
                className="font-medium text-primary hover:text-primary/80 disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
              >
                {resendCountdown > 0 ? (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Resend in {resendCountdown}s
                  </span>
                ) : (
                  "Resend Code"
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <label htmlFor="reset-new-password" className="block text-sm font-medium">
              New Password
            </label>
            <PasswordInput
              id="reset-new-password"
              value={state.newPassword}
              onChange={(e) => setState({ ...state, newPassword: e.target.value })}
              placeholder="••••••••"
              minLength={8}
              className="h-11 bg-background"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label htmlFor="reset-confirm-password" className="block text-sm font-medium">
              Confirm Password
            </label>
            <PasswordInput
              id="reset-confirm-password"
              value={state.confirmPassword}
              onChange={(e) => setState({ ...state, confirmPassword: e.target.value })}
              placeholder="••••••••"
              minLength={8}
              className="h-11 bg-background"
              disabled={loading}
            />
            {state.newPassword &&
              state.confirmPassword &&
              state.newPassword === state.confirmPassword && (
                <p className="text-xs text-emerald-600">Passwords match</p>
              )}
          </div>

          <Button
            type="submit"
            size="lg"
            className="h-11 w-full"
            disabled={loading || !state.otp || !state.newPassword || !state.confirmPassword}
          >
            {loading ? "Resetting..." : "Confirm New Password"}
            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>

          <button
            type="button"
            onClick={() => {
              setStep("email")
              setState({ ...state, otp: "", newPassword: "", confirmPassword: "" })
              setError("")
            }}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            Try another email
          </button>
        </form>
      )}
    </div>
  )
}
