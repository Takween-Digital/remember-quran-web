import { doc, getDoc, setDoc, updateDoc, collection, addDoc, serverTimestamp, Timestamp, getDocs, query, orderBy, where } from "firebase/firestore"
import { db } from "./client"

export interface LastPositionDto {
  verseKey: string
  surahId: number
  ayahId: number
  updatedAt: string
  surahName?: string
}

export async function getLastPosition(userId: string): Promise<LastPositionDto | null> {
  const ref = doc(db, "users", userId, "progress", "lastPosition")
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    verseKey: data.verseKey,
    surahId: data.surahId,
    ayahId: data.ayahId,
    updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString(),
  }
}

export async function updateLastPosition(userId: string, verseKey: string, surahId: number, ayahId: number): Promise<void> {
  const ref = doc(db, "users", userId, "progress", "lastPosition")
  await setDoc(ref, {
    verseKey,
    surahId,
    ayahId,
    updatedAt: serverTimestamp(),
  })
}

export async function logProgressEvent(userId: string, surahId: number, fromAyah: number, toAyah: number): Promise<void> {
  const ref = collection(db, "users", userId, "progressEvents")
  await addDoc(ref, {
    surahId,
    fromAyah,
    toAyah,
    timestamp: serverTimestamp(),
  })
}

export interface AyahRange {
  from: number
  to: number
}

export async function getSurahProgress(userId: string, surahId: number): Promise<AyahRange[]> {
  const ref = collection(db, "users", userId, "progressEvents")
  const snap = await getDocs(query(ref, orderBy("timestamp", "desc")))
  // Note: For simplicity and free-tier efficiency, we fetch the events 
  // and filter by surahId. Ideally we could index this, but right now
  // let's do a basic client-side filter if no index. 
  // We will assume it's small or we add a where("surahId", "==", surahId)
  // Let's use where clause.
  const refSurah = collection(db, "users", userId, "progressEvents")
  const qSurah = query(refSurah, where("surahId", "==", surahId))
  const surahSnap = await getDocs(qSurah)
  
  return surahSnap.docs.map(doc => ({
    from: doc.data().fromAyah,
    to: doc.data().toAyah
  }))
}
