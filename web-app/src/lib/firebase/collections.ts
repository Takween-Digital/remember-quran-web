import { collection, doc, getDocs, getDoc, setDoc, deleteDoc, updateDoc, query, where, orderBy, limit, serverTimestamp } from "firebase/firestore"
import { db } from "./client"

export interface CollectionRecord {
  id: string
  name: string
  isDefault: boolean
  createdAt: Date
}

export async function listCollections(userId: string): Promise<CollectionRecord[]> {
  const q = query(
    collection(db, "users", userId, "collections"),
    orderBy("createdAt", "asc")
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    name: doc.data().name,
    isDefault: doc.data().isDefault || false,
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  }))
}

export async function getOrCreateFavourites(userId: string): Promise<CollectionRecord> {
  const q = query(
    collection(db, "users", userId, "collections"),
    where("isDefault", "==", true),
    limit(1)
  )
  const snapshot = await getDocs(q)
  if (!snapshot.empty) {
    const docSnap = snapshot.docs[0]
    return {
      id: docSnap.id,
      name: docSnap.data().name,
      isDefault: true,
      createdAt: docSnap.data().createdAt?.toDate() || new Date(),
    }
  }

  // Create it
  const favRef = doc(collection(db, "users", userId, "collections"))
  const now = new Date()
  await setDoc(favRef, {
    name: "Favourites",
    isDefault: true,
    createdAt: serverTimestamp(),
  })
  return {
    id: favRef.id,
    name: "Favourites",
    isDefault: true,
    createdAt: now,
  }
}

export async function createCollection(userId: string, name: string): Promise<CollectionRecord> {
  const ref = doc(collection(db, "users", userId, "collections"))
  const now = new Date()
  await setDoc(ref, {
    name,
    isDefault: false,
    createdAt: serverTimestamp(),
  })
  return {
    id: ref.id,
    name,
    isDefault: false,
    createdAt: now,
  }
}

export async function renameCollection(userId: string, id: string, name: string): Promise<void> {
  const ref = doc(db, "users", userId, "collections", id)
  await updateDoc(ref, { name })
}

export async function deleteCollection(userId: string, id: string): Promise<void> {
  const ref = doc(db, "users", userId, "collections", id)
  await deleteDoc(ref)
}
