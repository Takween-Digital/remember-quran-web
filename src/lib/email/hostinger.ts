/**
 * Sends transactional email via the real Hostinger Mail REST API
 * (api.mail.hostinger.com — confirmed against Hostinger's own `hostinger-mail`
 * CLI, both its embedded API base URL and a live test send). Not SMTP:
 * Cloudflare Workers blocks outbound SMTP connections entirely (ports
 * 25/465/587) as an anti-spam platform restriction — confirmed in
 * production with both implicit-TLS and STARTTLS, both rejected at the
 * socket level before any SMTP handshake. A plain HTTPS fetch has no such
 * restriction.
 *
 * (Two earlier, wrong bases were tried before this one:
 * `api.hostinger.com/v1/mail/messages` doesn't exist at all — every email
 * this app ever tried to send, including password resets, silently failed
 * with a WAF/404 page. `HOSTINGER_API_KEY` is a real Agentic Mail API token
 * scoped to info@rememberquran.com, not an SMTP password — confirmed via
 * `hostinger-mail account current`.)
 */

const API_BASE = "https://api.mail.hostinger.com/api/v1"

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

let cachedMailboxId: string | null = null

async function getMailboxId(apiKey: string): Promise<string | null> {
  if (cachedMailboxId) return cachedMailboxId
  const configured = process.env.HOSTINGER_MAILBOX_ID
  if (configured) {
    cachedMailboxId = configured
    return configured
  }

  const emailUser = process.env.HOSTINGER_EMAIL_USER || "info@rememberquran.com"
  const response = await fetch(`${API_BASE}/me`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!response.ok) return null

  const data = (await response.json()) as {
    data?: { mailboxes?: { resourceId: string; address: string }[] }
  }
  const mailbox = data.data?.mailboxes?.find((m) => m.address === emailUser)
  cachedMailboxId = mailbox?.resourceId ?? null
  return cachedMailboxId
}

export async function sendHostingerEmail({ to, subject, html }: SendEmailParams) {
  const apiKey = process.env.HOSTINGER_API_KEY

  if (!apiKey) {
    console.error("HOSTINGER_API_KEY is not configured — email not sent:", subject, "to", to)
    return { ok: false, error: "Email is not configured" }
  }

  try {
    const mailboxId = await getMailboxId(apiKey)
    if (!mailboxId) {
      console.error("Could not resolve a Hostinger mailbox resource ID — email not sent")
      return { ok: false, error: "Email is not configured" }
    }

    const response = await fetch(`${API_BASE}/mailboxes/${mailboxId}/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: [to],
        subject,
        html,
        text: html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      }),
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => "")
      console.error("Hostinger Mail API send failed:", response.status, errText)
      return { ok: false, error: `Hostinger mail failed: ${response.status}` }
    }

    return { ok: true }
  } catch (err: any) {
    console.error("Failed to send email via Hostinger Mail API:", err)
    return { ok: false, error: err?.message || "Failed to send email" }
  }
}

/**
 * Shared visual shell for every transactional email — one place to keep
 * every auth-related email consistent, instead of each one hand-rolling its
 * own inline-styled HTML (which is how the original password-reset email
 * was written, and how a "no email arrived" bug report turned into
 * discovering only one of ~5 expected emails actually existed).
 */
function renderEmailShell(params: {
  heading: string
  bodyHtml: string
  ctaLabel?: string
  ctaUrl?: string
  footnote?: string
}): string {
  const { heading, bodyHtml, ctaLabel, ctaUrl, footnote } = params
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px; background-color: #f7f6f2; text-align: center; color: #2d3748;">
      <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); text-align: left;">
        <h1 style="margin-top: 0; color: #1a202c; font-size: 24px; text-align: center;">${heading}</h1>
        <div style="font-size: 16px; line-height: 1.6; color: #4a5568;">
          ${bodyHtml}
        </div>
        ${
          ctaLabel && ctaUrl
            ? `<div style="text-align: center; margin: 30px 0 10px;">
                 <a href="${ctaUrl}" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; font-weight: 500; font-size: 16px; padding: 12px 24px; border-radius: 8px;">
                   ${ctaLabel}
                 </a>
               </div>`
            : ""
        }
        ${
          footnote
            ? `<p style="font-size: 14px; color: #a0aec0; margin-top: 30px; text-align: center;">${footnote}</p>`
            : ""
        }
      </div>
      <p style="font-size: 12px; color: #a0aec0; margin-top: 20px;">
        &copy; ${new Date().getFullYear()} Remember Quran
      </p>
    </div>
  `
}

/** Sent right after a new account is created. */
export async function sendWelcomeEmail(email: string, name?: string | null) {
  const greeting = name ? `Assalamu alaikum, ${name}` : "Assalamu alaikum"
  return sendHostingerEmail({
    to: email,
    subject: "Welcome to Remember Quran",
    html: renderEmailShell({
      heading: "Welcome to Remember Quran",
      bodyHtml: `
        <p>${greeting},</p>
        <p>Your account is ready. Remember Quran keeps your bookmarks, notes, memorisation (hifz) progress, and daily reading goals in one place — free, with no ads and no tracking.</p>
        <p>Jump back in whenever you're ready to continue your reading.</p>
      `,
      ctaLabel: "Go to your dashboard",
      ctaUrl: `${getAppUrl()}/account`,
      footnote: `This email confirms the account created with ${email}. If this wasn't you, you can ignore it — no password was shared.`,
    }),
  })
}

/** Sent when a password-reset link is requested. */
export async function sendPasswordResetEmailAction(email: string, resetUrl: string) {
  return sendHostingerEmail({
    to: email,
    subject: "Reset your Remember Quran password",
    html: renderEmailShell({
      heading: "Reset your password",
      bodyHtml: `<p>We received a request to reset the password for your Remember Quran account. Click the button below to choose a new password.</p>`,
      ctaLabel: "Reset password",
      ctaUrl: resetUrl,
      footnote: "If you didn't request a password reset, you can safely ignore this email. This link expires in 1 hour.",
    }),
  })
}

/** Sent after a password change succeeds — from the account settings form,
 * not the forgot-password flow — so an attacker who changes it can't do so
 * silently. */
export async function sendPasswordChangedEmail(email: string) {
  return sendHostingerEmail({
    to: email,
    subject: "Your Remember Quran password was changed",
    html: renderEmailShell({
      heading: "Password changed",
      bodyHtml: `<p>The password for your Remember Quran account (${email}) was just changed.</p>`,
      footnote: "If you made this change, no action is needed. If you didn't, reset your password immediately and contact us.",
      ctaLabel: "Reset password",
      ctaUrl: `${getAppUrl()}/reset`,
    }),
  })
}

/** Sent to the *new* address to confirm ownership before an email change
 * takes effect. */
export async function sendEmailChangeVerificationEmail(newEmail: string, verificationUrl: string) {
  return sendHostingerEmail({
    to: newEmail,
    subject: "Confirm your new email for Remember Quran",
    html: renderEmailShell({
      heading: "Confirm your new email",
      bodyHtml: `<p>You asked to change the email on your Remember Quran account to this address. Confirm it below to complete the change.</p>`,
      ctaLabel: "Confirm email change",
      ctaUrl: verificationUrl,
      footnote: "If you didn't request this, you can ignore this email — your account email won't change.",
    }),
  })
}

/** Sent to the *old* address once an email change completes — the account's
 * previous owner-of-record should always hear about it, even though they no
 * longer receive mail at the new address going forward. */
export async function sendEmailChangedNoticeEmail(oldEmail: string, newEmail: string) {
  return sendHostingerEmail({
    to: oldEmail,
    subject: "Your Remember Quran account email was changed",
    html: renderEmailShell({
      heading: "Email address changed",
      bodyHtml: `<p>The email on your Remember Quran account was changed from <strong>${oldEmail}</strong> to <strong>${newEmail}</strong>.</p>`,
      footnote: "If you made this change, no action is needed. If you didn't, contact us right away.",
    }),
  })
}

function getAppUrl(): string {
  return process.env.BETTER_AUTH_URL || "https://rememberquran.com"
}
