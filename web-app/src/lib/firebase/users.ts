import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { db } from "./client"

export interface UserDoc {
  email?: string | null
  name?: string | null
  displayName?: string | null
  profile: {
    displayName: string
  }
  picture?: string | null
  createdAt?: Date
  lastPosition?: {
    verseKey: string
    updatedAt: Date
  } | null
  viewedSurahs?: number[]
}

export async function getUserById(userId: string): Promise<UserDoc | null> {
  const userRef = doc(db, "users", userId)
  const snapshot = await getDoc(userRef)
  
  if (snapshot.exists()) {
    const data = snapshot.data()
    return {
      email: data.email,
      name: data.name,
      displayName: data.displayName,
      profile: {
        displayName: data.displayName || data.name || "User",
      },
      picture: data.picture,
      createdAt: data.createdAt?.toDate(),
      lastPosition: data.lastPosition ? {
        verseKey: data.lastPosition.verseKey,
        updatedAt: data.lastPosition.updatedAt?.toDate() || new Date(),
      } : null,
      viewedSurahs: data.viewedSurahs || [],
    }
  }
  
  return null
}

export async function updateDisplayName(userId: string, displayName: string): Promise<void> {
  const userRef = doc(db, "users", userId)
  await updateDoc(userRef, {
    displayName,
    "profile.displayName": displayName
  })
}
