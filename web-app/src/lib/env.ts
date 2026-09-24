// Centralized server & client environment variable helpers
// Works consistently across Node.js, Next.js, and Cloudflare Workers (vinext / edge)

function getEnvVar(key: string, defaultValue: string = ''): string {
  if (typeof process !== 'undefined' && process.env && process.env[key] !== undefined) {
    return process.env[key] || defaultValue;
  }
  if (typeof globalThis !== 'undefined' && (globalThis as any)[key] !== undefined) {
    return (globalThis as any)[key] || defaultValue;
  }
  return defaultValue;
}

export const env = {
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  isProduction: getEnvVar('NODE_ENV') === 'production',

  // Auth / Session
  COOKIE_SECRET_CURRENT: getEnvVar('COOKIE_SECRET_CURRENT') || getEnvVar('AUTH_SECRET', 'secret'),

  // Firebase Public
  NEXT_PUBLIC_FIREBASE_API_KEY: getEnvVar('NEXT_PUBLIC_FIREBASE_API_KEY'),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: getEnvVar('NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'remember-quran'),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: getEnvVar('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: getEnvVar('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: getEnvVar('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  NEXT_PUBLIC_FIREBASE_APP_ID: getEnvVar('NEXT_PUBLIC_FIREBASE_APP_ID'),

  // Firebase Admin / Service Account
  FIREBASE_PROJECT_ID: getEnvVar('FIREBASE_PROJECT_ID') || getEnvVar('NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'remember-quran'),
  FIREBASE_CLIENT_EMAIL: getEnvVar('FIREBASE_CLIENT_EMAIL'),
  FIREBASE_PRIVATE_KEY: (getEnvVar('FIREBASE_PRIVATE_KEY') || '').replace(/\\n/g, '\n'),
  FIREBASE_WEB_API_KEY: getEnvVar('FIREBASE_WEB_API_KEY'),
};
