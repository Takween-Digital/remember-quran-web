"use server"

import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin"
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
    user: process.env.HOSTINGER_EMAIL_USER,
    pass: process.env.HOSTINGER_EMAIL_PASSWORD,
  },
})

async function sendOTPEmail(email: string, otp: string) {
  if (!process.env.HOSTINGER_EMAIL_USER || !process.env.HOSTINGER_EMAIL_PASSWORD) {
    console.warn("[PASSWORD_RESET] SMTP credentials not configured. OTP:", otp)
    return
  }

  const brandColor = "#0d9488"
  const textColor = "#1f2937"

  console.log(`[PASSWORD_RESET] Sending email to ${email} via SMTP...`)
  console.log(`[PASSWORD_RESET] SMTP Host: smtp.hostinger.com:465`)

  try {
    const result = await transporter.sendMail({
      from: `"Remember Quran" <${process.env.HOSTINGER_EMAIL_USER}>`,
      to: email,
      subject: "Your Password Reset Code",
      html: `<!DOCTYPE html>
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
</html>`,
    })
    console.log(`[PASSWORD_RESET] Email sent successfully. Message ID: ${result.messageId}`)
  } catch (error: any) {
    console.error("[PASSWORD_RESET] Email send failed:", error.message)
    console.error("[PASSWORD_RESET] Error code:", error.code)
    console.error("[PASSWORD_RESET] Error response:", error.response)
    throw error
  }
}

const RESEND_COOLDOWN_SECONDS = 60

export async function requestPasswordResetOTP(email: string) {
  try {
    console.log("[PASSWORD_RESET] OTP request started for:", email)
    console.log("[PASSWORD_RESET] SMTP Email:", process.env.HOSTINGER_EMAIL_USER)
    console.log("[PASSWORD_RESET] SMTP Password configured:", !!process.env.HOSTINGER_EMAIL_PASSWORD)

    const emailValidation = validateEmail(email)
    if (!emailValidation.success) {
      console.error("[PASSWORD_RESET] Email validation failed:", emailValidation.error)
      return { success: false, error: emailValidation.error }
    }

    console.log("[PASSWORD_RESET] Checking if user exists...")
    await getAdminAuth().getUserByEmail(emailValidation.email)
    console.log("[PASSWORD_RESET] User found")

    console.log("[PASSWORD_RESET] Checking resend cooldown...")
    const resetDoc = await getAdminDb()
      .collection("password_reset_otps")
      .doc(emailValidation.email)
      .get()

    if (resetDoc.exists) {
      const data = resetDoc.data()
      const lastRequestTime = data?.requestedAt?.toDate() || new Date(0)
      const secondsSinceLastRequest = (Date.now() - lastRequestTime.getTime()) / 1000

      if (secondsSinceLastRequest < RESEND_COOLDOWN_SECONDS) {
        const waitSeconds = Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSinceLastRequest)
        console.log(`[PASSWORD_RESET] Resend cooldown active: ${waitSeconds}s remaining`)
        return {
          success: false,
          error: `Please wait ${waitSeconds} seconds before requesting a new code.`,
          cooldownSeconds: waitSeconds,
        }
      }
    }

    console.log("[PASSWORD_RESET] Generating OTP...")
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
    console.log(`[PASSWORD_RESET] OTP generated: ${otp}`)

    console.log("[PASSWORD_RESET] Saving OTP to Firestore...")
    await getAdminDb().collection("password_reset_otps").doc(emailValidation.email).set(
      {
        otp,
        expiresAt,
        requestedAt: new Date(),
      },
      { merge: true },
    )
    console.log("[PASSWORD_RESET] OTP saved to Firestore")

    console.log("[PASSWORD_RESET] Sending email...")
    await sendOTPEmail(emailValidation.email, otp)
    console.log("[PASSWORD_RESET] Email sending completed")

    return { success: true }
  } catch (error: any) {
    console.error("[PASSWORD_RESET] Error in requestPasswordResetOTP:", error.message)
    console.error("[PASSWORD_RESET] Error stack:", error.stack)
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
    const emailValidation = validateEmail(email)
    if (!emailValidation.success) {
      return { success: false, error: emailValidation.error }
    }

    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.success) {
      return { success: false, error: passwordValidation.error }
    }

    const docRef = getAdminDb().collection("password_reset_otps").doc(emailValidation.email)
    const doc = await docRef.get()

    if (!doc.exists) {
      return { success: false, error: "Invalid or expired code." }
    }

    const data = doc.data()
    if (!data) return { success: false, error: "Invalid or expired code." }

    if (data.expiresAt.toDate() < new Date()) {
      await docRef.delete()
      return { success: false, error: "This code has expired. Please request a new one." }
    }

    if (data.otp !== otp.trim()) {
      return { success: false, error: "Incorrect code. Please try again." }
    }

    const user = await getAdminAuth().getUserByEmail(emailValidation.email)
    await getAdminAuth().updateUser(user.uid, {
      password: passwordValidation.password,
    })

    await docRef.delete()

    return { success: true }
  } catch (error: any) {
    console.error("Error resetting password:", error)
    return { success: false, error: "Failed to reset password. Please try again." }
  }
}
