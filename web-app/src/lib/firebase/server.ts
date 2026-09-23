import { getFirebaseAuth } from 'next-firebase-auth-edge/lib/auth';

export const serverConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
  // Handle newlines in the private key when loaded from environment variables
  privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : '',
};

export const { 
  getCustomIdAndRefreshTokens, 
  verifyIdToken, 
  createSessionCookie
} = getFirebaseAuth(
  {
    projectId: serverConfig.projectId,
    clientEmail: serverConfig.clientEmail,
    privateKey: serverConfig.privateKey,
  },
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY || ''
);

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export function getAdminDb() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: serverConfig.projectId,
        clientEmail: serverConfig.clientEmail,
        privateKey: serverConfig.privateKey,
      }),
    });
  }
  return getFirestore();
}
