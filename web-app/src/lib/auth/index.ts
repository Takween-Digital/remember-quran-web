import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { getDb } from "@/lib/db/client"
import { users, session, account, verification } from "@/lib/db/schema"
import {
  sendPasswordResetEmailAction,
  sendEmailChangeVerificationEmail,
} from "@/lib/email/hostinger"

export const auth = betterAuth({
  database: drizzleAdapter(getDb(), {
    provider: "sqlite",
    schema: {
      user: users,
      session,
      account,
      verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    async sendResetPassword({ user, url }) {
      await sendPasswordResetEmailAction(user.email, url)
    },
  },
  // Nothing currently sets emailVerified=true at signup (requireEmailVerification
  // is off above), so `changeEmail` always takes the "update immediately, then
  // verify the new address" path below rather than the "confirm from the old
  // address first" path — matching this app's account settings flow, which
  // already gates the request behind the session itself rather than an email
  // round-trip. The old address still gets notified once the change lands
  // (see /api/account/settings/email), just not via this callback.
  emailVerification: {
    async sendVerificationEmail({ user, url }) {
      await sendEmailChangeVerificationEmail(user.email, url)
    },
  },
  user: {
    changeEmail: {
      enabled: true,
      updateEmailWithoutVerification: true,
    },
  },
  session: {
    expiresIn: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60,
  },
})

export type Auth = typeof auth
