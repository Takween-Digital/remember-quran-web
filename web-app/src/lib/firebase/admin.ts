import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { env } from '@/lib/env';

let adminDb: ReturnType<typeof getFirestore> | null = null;
let adminAuth: ReturnType<typeof getAuth> | null = null;

function initializeAdmin() {
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

  if (!adminDb) {
    adminDb = getFirestore();
  }
  if (!adminAuth) {
    adminAuth = getAuth();
  }
}

export function getAdminDb() {
  if (!adminDb) {
    initializeAdmin();
  }
  return adminDb;
}

export function getAdminAuth() {
  if (!adminAuth) {
    initializeAdmin();
  }
  return adminAuth;
}
