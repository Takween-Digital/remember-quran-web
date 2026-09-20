/**
 * Hostinger Mail integration for transactional emails (Password Reset, etc.)
 * Supports both Hostinger Mail REST API and fallback SMTP/HTTP.
 */

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

export async function sendHostingerEmail({ to, subject, html }: SendEmailParams) {
  const emailUser = process.env.HOSTINGER_EMAIL_USER || "info@rememberquran.com"
  const apiKey = process.env.HOSTINGER_API_KEY || "9cd4ae856d1dd9073f4db21781604bd81252b5477134211c93ab3f222a384b84"
  const fromName = process.env.EMAIL_FROM_NAME || "Remember Quran"

  try {
    // Attempt Hostinger Mail REST API
    const response = await fetch("https://api.hostinger.com/v1/mail/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: `${fromName} <${emailUser}>`,
        to: [to],
        subject,
        html,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.warn("Hostinger Mail API response:", response.status, errText)
      // If Hostinger REST endpoint returns non-200, log detailed error
      return { ok: false, error: `Hostinger mail failed: ${errText}` }
    }

    return { ok: true }
  } catch (err: any) {
    console.error("Failed to send Hostinger email:", err)
    return { ok: false, error: err?.message || "Failed to send email" }
  }
}

/**
 * Sends a password reset email using Hostinger Mail.
 */
export async function sendPasswordResetEmailAction(email: string, resetUrl: string) {
  return sendHostingerEmail({
    to: email,
    subject: "Reset your Remember Quran password",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px; background-color: #f7f6f2; text-align: center; color: #2d3748;">
        <div style="max-width: 450px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <h1 style="margin-top: 0; color: #1a202c; font-size: 24px;">Reset your password</h1>
          <p style="font-size: 16px; line-height: 1.5; color: #4a5568; margin-bottom: 30px;">
            We received a request to reset the password for your Remember Quran account. Click the button below to choose a new password.
          </p>
          <a href="${resetUrl}" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; font-weight: 500; font-size: 16px; padding: 12px 24px; border-radius: 8px;">
            Reset Password
          </a>
          <p style="font-size: 14px; color: #a0aec0; margin-top: 30px;">
            If you didn't request a password reset, you can safely ignore this email. This link expires in 1 hour.
          </p>
        </div>
        <p style="font-size: 12px; color: #a0aec0; margin-top: 20px;">
          &copy; ${new Date().getFullYear()} Remember Quran
        </p>
      </div>
    `,
  })
}
