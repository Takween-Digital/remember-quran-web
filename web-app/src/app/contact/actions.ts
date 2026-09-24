"use server"

import { z } from "zod"
import { sendHostingerEmail } from "@/lib/email/hostinger"

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please provide a valid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

export type ContactFormData = z.infer<typeof contactFormSchema>

export async function submitContactForm(data: ContactFormData) {
  // 1. Validate on the server side securely
  const parsed = contactFormSchema.safeParse(data)

  if (!parsed.success) {
    return { ok: false, error: "Invalid form data provided." }
  }

  const { name, email, subject, message } = parsed.data

  try {
    // 2. Send email via Hostinger API (from the lib we found)
    const result = await sendHostingerEmail({
      // Send TO the support email itself, or admin email
      to: process.env.HOSTINGER_EMAIL_USER || "info@rememberquran.com",
      subject: `[Contact Form] ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Contact Request</h2>
          <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
          <div style="white-space: pre-wrap; color: #555;">
            ${message}
          </div>
        </div>
      `,
    })

    if (!result.ok) {
      return { ok: false, error: result.error || "Failed to send email." }
    }

    return { ok: true }
  } catch (err) {
    console.error("Error submitting contact form:", err)
    return { ok: false, error: "An unexpected error occurred." }
  }
}
