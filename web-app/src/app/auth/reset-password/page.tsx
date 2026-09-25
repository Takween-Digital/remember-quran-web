import type { Metadata } from "next"
import Link from "next/link"
import { AuthShell } from "@/components/auth/AuthShell"
import { CustomResetPasswordForm } from "@/components/auth/CustomResetPasswordForm"

export const metadata: Metadata = {
  title: "Reset Password | Remember Quran",
  description: "Reset your Remember Quran account password securely.",
}

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Reset Your Password"
      subtitle="Enter your email and we'll send you a 6-digit code to reset your password."
      footer={
        <Link
          href="/login"
          className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
        >
          Back to sign in
        </Link>
      }
    >
      <CustomResetPasswordForm />
    </AuthShell>
  )
}
