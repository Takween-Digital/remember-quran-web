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

import { importPKCS8, SignJWT } from "jose";

let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const iat = Math.floor(Date.now() / 1000);
  const payload = {
    aud: "https://accounts.google.com/o/oauth2/token",
    iss: serverConfig.clientEmail,
    sub: serverConfig.clientEmail,
    scope: [
      "https://www.googleapis.com/auth/cloud-platform",
      "https://www.googleapis.com/auth/datastore"
    ].join(" "),
    iat,
    exp: iat + 3600,
  };

  const key = await importPKCS8(serverConfig.privateKey, "RS256");
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .sign(key);

  const res = await fetch("https://accounts.google.com/o/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${token}`,
    cache: "no-store"
  });

  const json = await res.json();
  if (!json.access_token) {
    throw new Error(`Failed to get access token: ${JSON.stringify(json)}`);
  }

  cachedToken = json.access_token;
  tokenExpiry = Date.now() + (json.expires_in - 60) * 1000;
  return cachedToken;
}

function parseFirestoreValue(value: any): any {
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.integerValue !== undefined) return parseInt(value.integerValue, 10);
  if (value.doubleValue !== undefined) return parseFloat(value.doubleValue);
  if (value.booleanValue !== undefined) return value.booleanValue;
  if (value.timestampValue !== undefined) return new Date(value.timestampValue);
  if (value.nullValue !== undefined) return null;
  if (value.mapValue !== undefined) {
    const result: any = {};
    for (const [k, v] of Object.entries(value.mapValue.fields || {})) {
      result[k] = parseFirestoreValue(v);
    }
    return result;
  }
  if (value.arrayValue !== undefined) {
    return (value.arrayValue.values || []).map(parseFirestoreValue);
  }
  return value;
}

function toFirestoreValue(val: any): any {
  if (typeof val === 'string') return { stringValue: val };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') {
    return Number.isInteger(val) ? { integerValue: val.toString() } : { doubleValue: val };
  }
  if (val instanceof Date) return { timestampValue: val.toISOString() };
  if (val === null) return { nullValue: null };
  if (Array.isArray(val)) return { arrayValue: { values: val.map(toFirestoreValue) } };
  if (typeof val === 'object') {
    const fields: any = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return {};
}

export function getAdminDb() {
  return {
    collection: (collName: string) => ({
      doc: (docId: string) => ({
        get: async () => {
          const token = await getAccessToken();
          const res = await fetch(`https://firestore.googleapis.com/v1/projects/${serverConfig.projectId}/databases/(default)/documents/${collName}/${docId}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store'
          });
          if (res.status === 404) return { exists: false, data: () => null };
          if (!res.ok) throw new Error(`Firestore get failed: ${res.statusText}`);
          const json = await res.json();
          const data = () => {
            const result: any = {};
            for (const [k, v] of Object.entries(json.fields || {})) {
              result[k] = parseFirestoreValue(v);
            }
            return result;
          };
          return { exists: true, data };
        },
        set: async (data: any) => {
          const token = await getAccessToken();
          const fields: any = {};
          for (const [k, v] of Object.entries(data)) {
            if (v !== undefined) fields[k] = toFirestoreValue(v);
          }
          const res = await fetch(`https://firestore.googleapis.com/v1/projects/${serverConfig.projectId}/databases/(default)/documents/${collName}?documentId=${docId}`, {
            method: "PATCH",
            headers: { 
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ fields }),
            cache: 'no-store'
          });
          if (!res.ok) {
            const errBody = await res.text();
            throw new Error(`Firestore set failed: ${res.statusText} - ${errBody}`);
          }
        }
      }),
      limit: (num: number) => ({
        get: async () => {
          const token = await getAccessToken();
          const res = await fetch(`https://firestore.googleapis.com/v1/projects/${serverConfig.projectId}/databases/(default)/documents/${collName}?pageSize=${num}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store'
          });
          if (!res.ok) throw new Error(`Firestore limit get failed: ${res.statusText}`);
          return { empty: false }; 
        }
      })
    })
  };
}
