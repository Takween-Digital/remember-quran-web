"use server"

import { adminAuth, adminDb } from "@/lib/firebase/admin"
import * as nodemailer from "nodemailer"
import { validateEmail, validatePassword } from "@/lib/auth/credentials"

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.HOSTINGER_SMTP_EMAIL,
    pass: process.env.HOSTINGER_SMTP_PASSWORD,
  },
})

async function sendOTPEmail(email: string, otp: string) {
  if (!process.env.HOSTINGER_SMTP_EMAIL || !process.env.HOSTINGER_SMTP_PASSWORD) {
    console.warn("SMTP credentials not configured. OTP for testing:", otp)
    return
  }

  const brandColor = "#0d9488"
  const textColor = "#1f2937"

  await transporter.sendMail({
    from: `"Remember Quran" <${process.env.HOSTINGER_SMTP_EMAIL}>`,
    to: email,
    subject: "Your Password Reset Code",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: ${textColor}; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #f0f0f0; }
          .logo { font-size: 24px; font-weight: 600; color: ${brandColor}; margin-bottom: 10px; }
          .content { padding: 30px 0; }
          .code-container { background: #f9f9f9; border: 2px solid ${brandColor}; border-radius: 8px; padding: 30px; text-align: center; margin: 20px 0; }
          .code { font-size: 48px; font-weight: 700; letter-spacing: 8px; color: ${brandColor}; font-family: 'Courier New', monospace; }
          .expiry { font-size: 14px; color: #6b7280; margin-top: 15px; }
          .footer { text-align: center; padding-top: 20px; border-top: 1px solid #f0f0f0; font-size: 12px; color: #6b7280; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 4px; font-size: 13px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Remember Quran</div>
            <h2 style="margin: 0; color: ${textColor};">Reset Your Password</h2>
          </div>

          <div class="content">
            <p>We received a request to reset your password. Use the 6-digit code below to create a new password for your Remember Quran account.</p>

            <div class="code-container">
              <div class="code">${otp}</div>
              <div class="expiry">This code expires in 15 minutes</div>
            </div>

            <p style="margin-bottom: 10px;"><strong>Security tips:</strong></p>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Never share this code with anyone</li>
              <li>Remember Quran will never ask for this code via email</li>
              <li>If you didn't request this, ignore this email</li>
            </ul>

            <div class="warning">
              <strong>Didn't request a password reset?</strong><br>
              If this wasn't you, someone may be trying to access your account. Change your password immediately and contact our support team if you have concerns.
            </div>
          </div>

          <div class="footer">
            <p>© 2024 Remember Quran. All rights reserved.<br>
            <a href="https://rememberquran.com" style="color: ${brandColor}; text-decoration: none;">rememberquran.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  })
}

const RESEND_COOLDOWN_SECONDS = 60

export async function requestPasswordResetOTP(email: string) {
  try {
    const emailValidation = validateEmail(email)
    if (!emailValidation.success) {
      return { success: false, error: emailValidation.error }
    }

    // Verify user exists
    await adminAuth.getUserByEmail(emailValidation.email)

    // Check resend cooldown
    const resetDoc = await adminDb
      .collection("password_reset_otps")
      .doc(emailValidation.email)
      .get()

    if (resetDoc.exists) {
      const data = resetDoc.data()
      const lastRequestTime = data?.requestedAt?.toDate() || new Date(0)
      const secondsSinceLastRequest = (Date.now() - lastRequestTime.getTime()) / 1000

      if (secondsSinceLastRequest < RESEND_COOLDOWN_SECONDS) {
        const waitSeconds = Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSinceLastRequest)
        return {
          success: false,
          error: `Please wait ${waitSeconds} seconds before requesting a new code.`,
          cooldownSeconds: waitSeconds,
        }
      }
    }

    // Generate OTP with 15-minute expiry
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    // Save OTP with timestamp
    await adminDb.collection("password_reset_otps").doc(emailValidation.email).set(
      {
        otp,
        expiresAt,
        requestedAt: new Date(),
      },
      { merge: true },
    )

    // Send email
    await sendOTPEmail(emailValidation.email, otp)

    return { success: true }
  } catch (error: any) {
    console.error("Error requesting OTP:", error)
    return {
      success: false,
      error: "If this email is registered, a code has been sent.",
    }
  }
}

export async function verifyAndResetPassword(
  email: string,
  otp: string,
  newPassword: string,
) {
  try {
    // Validate inputs
    const emailValidation = validateEmail(email)
    if (!emailValidation.success) {
      return { success: false, error: emailValidation.error }
    }

    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.success) {
      return { success: false, error: passwordValidation.error }
    }

    // Verify OTP
    const docRef = adminDb.collection("password_reset_otps").doc(emailValidation.email)
    const doc = await docRef.get()

    if (!doc.exists) {
      return { success: false, error: "Invalid or expired code." }
    }

    const data = doc.data()
    if (!data) return { success: false, error: "Invalid or expired code." }

    // Check expiration
    if (data.expiresAt.toDate() < new Date()) {
      await docRef.delete()
      return { success: false, error: "This code has expired. Please request a new one." }
    }

    // Verify OTP matches
    if (data.otp !== otp.trim()) {
      return { success: false, error: "Incorrect code. Please try again." }
    }

    // Update password
    const user = await adminAuth.getUserByEmail(emailValidation.email)
    await adminAuth.updateUser(user.uid, {
      password: passwordValidation.password,
    })

    // Clean up
    await docRef.delete()

    return { success: true }
  } catch (error: any) {
    console.error("Error resetting password:", error)
    return { success: false, error: "Failed to reset password. Please try again." }
  }
}
