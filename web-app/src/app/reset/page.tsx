import type { Metadata } from "next"
import Link from "next/link"
import { AuthShell } from "@/components/auth/AuthShell"
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm"

export const metadata: Metadata = {
  title: "Reset password",
}

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we’ll send you a 6-digit code to reset your password."
      footer={
        <Link
          href="/login?next=/account"
          className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
        >
          Return to sign in
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  )
}
