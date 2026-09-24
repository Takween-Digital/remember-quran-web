import type { UserRecord } from "@/lib/firestore/users"

/**
 * Resolves the Firebase Auth UID actually backing this user, if any.
 *
 * `user.firebaseUid` is only populated by this module's own web
 * registration/migration paths — it's never set for accounts the mobile app
 * creates directly against Firebase Auth (mobile writes a bare
 * `users/{firebaseUid}` doc with no `firebaseUid` field of its own). Those
 * accounts are recognizable by having no legacy `passwordHash` either: a
 * *real* unmigrated legacy account always has one (set at its original
 * bcrypt-based registration), while a mobile-created account never does. In
 * that case `user.id` — the Firestore doc ID — already *is* the Firebase
 * UID, since that's what the mobile app used as the doc path.
 */
export function resolveFirebaseUid(user: UserRecord): string | null {
  if (user.firebaseUid) return user.firebaseUid
  if (!user.passwordHash) return user.id
  return null
}
