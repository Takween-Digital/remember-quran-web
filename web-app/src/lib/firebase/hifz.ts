import { collection, doc, getDocs, getDoc, setDoc, deleteDoc, updateDoc, query, orderBy, limit, serverTimestamp } from "firebase/firestore"
import { db } from "./client"

export interface HifzRecord {
  verseKey: string
  surahId: number
  ayahId: number
  memorisedAt: Date
  repetitions: number
  intervalDays: number
  easeFactor: number
  nextReviewAt: Date | null
  lastReviewedAt: Date | null
}

export async function listMemorisedAyahs(userId: string): Promise<HifzRecord[]> {
  const q = query(
    collection(db, "users", userId, "hifz"),
    orderBy("surahId", "asc"),
    orderBy("ayahId", "asc")
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    verseKey: doc.data().verseKey,
    surahId: doc.data().surahId,
    ayahId: doc.data().ayahId,
    memorisedAt: doc.data().memorisedAt?.toDate() || new Date(),
    repetitions: doc.data().repetitions || 0,
    intervalDays: doc.data().intervalDays || 1,
    easeFactor: doc.data().easeFactor || 2.5,
    nextReviewAt: doc.data().nextReviewAt?.toDate() || null,
    lastReviewedAt: doc.data().lastReviewedAt?.toDate() || null,
  }))
}

export async function addHifzRecord(userId: string, verseKey: string, surahId: number, ayahId: number): Promise<void> {
  const ref = doc(db, "users", userId, "hifz", verseKey)
  await setDoc(ref, {
    verseKey,
    surahId,
    ayahId,
    memorisedAt: serverTimestamp(),
    repetitions: 0,
    intervalDays: 1,
    easeFactor: 2.5,
    nextReviewAt: null,
    lastReviewedAt: null,
  })
}

export async function removeHifzRecord(userId: string, verseKey: string): Promise<void> {
  const ref = doc(db, "users", userId, "hifz", verseKey)
  await deleteDoc(ref)
}

export async function updateHifzReview(
  userId: string, 
  verseKey: string, 
  updates: { repetitions: number, intervalDays: number, easeFactor: number, nextReviewAt: Date, lastReviewedAt: Date }
): Promise<void> {
  const ref = doc(db, "users", userId, "hifz", verseKey)
  await updateDoc(ref, updates)
}
