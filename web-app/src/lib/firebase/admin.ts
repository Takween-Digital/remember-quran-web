import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { env } from '@/lib/env';

let adminDb: Firestore | null = null;
let adminAuth: Auth | null = null;
let initialized = false;

function initializeAdmin() {
  if (initialized) {
    return;
  }

  if (!getApps().length) {
    const privateKey = env.FIREBASE_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('FIREBASE_PRIVATE_KEY is not configured');
    }

    initializeApp({
      credential: cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    });
  }

  adminDb = getFirestore();
  adminAuth = getAuth();
  initialized = true;
}

export function getAdminDb(): Firestore {
  if (!adminDb) {
    initializeAdmin();
  }
  return adminDb!;
}

export function getAdminAuth(): Auth {
  if (!adminAuth) {
    initializeAdmin();
  }
  return adminAuth!;
}
