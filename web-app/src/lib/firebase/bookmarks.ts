import { collection, doc, getDocs, getDoc, setDoc, deleteDoc, updateDoc, query, where, orderBy, limit, serverTimestamp } from "firebase/firestore"
import { db } from "./client"

export const MAX_BOOKMARKS = 2000

export interface BookmarkRecord {
  verseKey: string
  collectionId: string
  createdAt: Date
}

export async function listBookmarks(userId: string): Promise<BookmarkRecord[]> {
  const q = query(
    collection(db, "users", userId, "bookmarks"),
    orderBy("createdAt", "desc"),
    limit(MAX_BOOKMARKS)
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    verseKey: doc.data().verseKey,
    collectionId: doc.data().collectionId,
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  }))
}

export async function removeBookmark(userId: string, verseKey: string): Promise<void> {
  const ref = doc(db, "users", userId, "bookmarks", verseKey)
  await deleteDoc(ref)
}

export async function moveBookmark(userId: string, verseKey: string, collectionId: string): Promise<void> {
  const ref = doc(db, "users", userId, "bookmarks", verseKey)
  await updateDoc(ref, { collectionId })
}

export async function addBookmark(userId: string, verseKey: string, collectionId: string): Promise<void> {
  const ref = doc(db, "users", userId, "bookmarks", verseKey)
  await setDoc(ref, {
    verseKey,
    collectionId,
    createdAt: serverTimestamp(),
  })
}
