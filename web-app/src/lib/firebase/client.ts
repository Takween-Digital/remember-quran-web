/// <reference types="node" />
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: any;
let auth: any;
let db: any;

try {
  if (!firebaseConfig.apiKey) {
    throw new Error(
      "🔥 Firebase Error: NEXT_PUBLIC_FIREBASE_API_KEY is missing or invalid. " +
      "Please check your .env or .env.local file and ensure the environment variable is loaded."
    );
  }
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.warn("Firebase initialization failed:", error instanceof Error ? error.message : error);
  auth = {} as any;
  db = {} as any;
}

export { app, auth, db };
