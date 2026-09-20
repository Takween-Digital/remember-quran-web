import { initializeApp, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import * as fs from "fs"
import * as path from "path"

/**
 * Migration Script: Firestore -> Cloudflare D1
 *
 * Reads collections from Firestore and outputs SQL INSERT statements
 * into `drizzle/firestore_migration.sql` for import via `wrangler d1 execute`.
 */

async function main() {
  const projectId = process.env.FIREBASE_PROJECT_ID || "remember-quran"
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")

  if (!clientEmail || !privateKey) {
    console.error("Missing FIREBASE_CLIENT_EMAIL or FIREBASE_PRIVATE_KEY in .env")
    process.exit(1)
  }

  const app = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  })

  const db = getFirestore(app)
  const sqlStatements: string[] = []

  function escapeSql(val: any): string {
    if (val === null || val === undefined) return "NULL"
    if (typeof val === "boolean") return val ? "1" : "0"
    if (typeof val === "number") return val.toString()
    if (typeof val === "object") {
      if (val instanceof Date) return val.getTime().toString()
      return `'${JSON.stringify(val).replace(/'/g, "''")}'`
    }
    return `'${val.toString().replace(/'/g, "''")}'`
  }

  console.log("Exporting Firestore collections...")

  // 1. Users
  console.log("- Exporting users...")
  const usersSnap = await db.collection("users").get()
  for (const doc of usersSnap.docs) {
    const d = doc.data()
    const id = escapeSql(doc.id)
    const email = escapeSql(d.email?.toLowerCase())
    const passwordHash = escapeSql(d.passwordHash || null)
    const displayName = escapeSql(d.displayName || d.name || null)
    const roles = escapeSql(d.roles || ["user"])
    const flagged = d.flagged ? 1 : 0
    const suspended = d.suspended ? 1 : 0
    const emailVerified = d.emailVerified ? 1 : 0
    const createdAt = d.createdAt?.toMillis?.() || Date.now()
    const updatedAt = d.updatedAt?.toMillis?.() || Date.now()
    const streak = escapeSql(d.streak || null)
    const lastPosition = escapeSql(d.lastPosition || null)
    const activeGoal = escapeSql(d.activeGoal || null)
    const settings = escapeSql(d.settings || null)

    sqlStatements.push(
      `INSERT OR IGNORE INTO users (id, email, password_hash, display_name, roles, flagged, suspended, email_verified, streak, last_position, active_goal, settings, created_at, updated_at) VALUES (${id}, ${email}, ${passwordHash}, ${displayName}, ${roles}, ${flagged}, ${suspended}, ${emailVerified}, ${streak}, ${lastPosition}, ${activeGoal}, ${settings}, ${createdAt}, ${updatedAt});`
    )
  }

  // 2. Hifz Entries
  console.log("- Exporting hifz...")
  const hifzSnap = await db.collection("hifz").get()
  for (const doc of hifzSnap.docs) {
    const d = doc.data()
    sqlStatements.push(
      `INSERT OR IGNORE INTO hifz_entries (id, user_id, surah_id, ayah_start, ayah_end, strength, last_reviewed, created_at, updated_at) VALUES (${escapeSql(doc.id)}, ${escapeSql(d.userId)}, ${d.surahId || 1}, ${d.ayahStart || 1}, ${d.ayahEnd || 1}, ${escapeSql(d.strength || "learning")}, ${d.lastReviewed?.toMillis?.() || null}, ${d.createdAt?.toMillis?.() || Date.now()}, ${d.updatedAt?.toMillis?.() || Date.now()});`
    )
  }

  // 3. Notes
  console.log("- Exporting notes...")
  const notesSnap = await db.collection("notes").get()
  for (const doc of notesSnap.docs) {
    const d = doc.data()
    sqlStatements.push(
      `INSERT OR IGNORE INTO notes (id, user_id, verse_key, content, created_at, updated_at) VALUES (${escapeSql(doc.id)}, ${escapeSql(d.userId)}, ${escapeSql(d.verseKey)}, ${escapeSql(d.content || "")}, ${d.createdAt?.toMillis?.() || Date.now()}, ${d.updatedAt?.toMillis?.() || Date.now()});`
    )
  }

  // 4. Bookmark Collections & Bookmarks
  console.log("- Exporting bookmark collections & bookmarks...")
  const colSnap = await db.collection("bookmark_collections").get()
  for (const doc of colSnap.docs) {
    const d = doc.data()
    sqlStatements.push(
      `INSERT OR IGNORE INTO bookmark_collections (id, user_id, name, color, is_default, created_at, updated_at) VALUES (${escapeSql(doc.id)}, ${escapeSql(d.userId)}, ${escapeSql(d.name)}, ${escapeSql(d.color || null)}, ${d.isDefault ? 1 : 0}, ${d.createdAt?.toMillis?.() || Date.now()}, ${d.updatedAt?.toMillis?.() || Date.now()});`
    )
  }

  const bmSnap = await db.collection("bookmarks").get()
  for (const doc of bmSnap.docs) {
    const d = doc.data()
    sqlStatements.push(
      `INSERT OR IGNORE INTO bookmarks (id, user_id, collection_id, verse_key, created_at) VALUES (${escapeSql(doc.id)}, ${escapeSql(d.userId)}, ${escapeSql(d.collectionId)}, ${escapeSql(d.verseKey)}, ${d.createdAt?.toMillis?.() || Date.now()});`
    )
  }

  const outPath = path.join(process.cwd(), "drizzle", "firestore_migration.sql")
  fs.writeFileSync(outPath, sqlStatements.join("\n"), "utf-8")
  console.log(`✅ Done! Written ${sqlStatements.length} statements to ${outPath}`)
}

main().catch(console.error)
