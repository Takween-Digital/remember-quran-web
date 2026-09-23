import { collection, doc, getDocs, getDoc, setDoc, deleteDoc, updateDoc, query, orderBy, limit, serverTimestamp } from "firebase/firestore"
import { db } from "./client"

export interface NoteRecord {
  verseKey: string
  text: string
  highlightColor: string | null
  createdAt: Date
  updatedAt: Date
}

export async function listNotes(userId: string): Promise<NoteRecord[]> {
  const q = query(
    collection(db, "users", userId, "notes"),
    orderBy("updatedAt", "desc"),
    limit(2000)
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    verseKey: doc.data().verseKey,
    text: doc.data().text || "",
    highlightColor: doc.data().highlightColor || null,
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date(),
  }))
}
export async function getNote(userId: string, verseKey: string): Promise<NoteRecord | null> {
  const ref = doc(db, "users", userId, "notes", verseKey)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return {
    verseKey: snap.data().verseKey,
    text: snap.data().text || "",
    highlightColor: snap.data().highlightColor || null,
    createdAt: snap.data().createdAt?.toDate() || new Date(),
    updatedAt: snap.data().updatedAt?.toDate() || new Date(),
  }
}

export async function upsertNote(userId: string, verseKey: string, text: string, highlightColor: string | null = null): Promise<void> {
  const ref = doc(db, "users", userId, "notes", verseKey)
  const snap = await getDoc(ref)
  if (snap.exists()) {
    await updateDoc(ref, {
      text,
      highlightColor,
      updatedAt: serverTimestamp(),
    })
  } else {
    await setDoc(ref, {
      verseKey,
      text,
      highlightColor,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }
}

export async function removeNote(userId: string, verseKey: string): Promise<void> {
  const ref = doc(db, "users", userId, "notes", verseKey)
  await deleteDoc(ref)
}
