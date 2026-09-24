// Centralized server & client environment variable helpers
// Works consistently across Node.js, Next.js, and Cloudflare Workers (vinext / edge)

// Store Cloudflare env context for access by getEnvVar
let cloudflareEnv: any = null;

export function setCloudflareEnv(env: any) {
  cloudflareEnv = env;
}

export function getCloudflareEnv() {
  return cloudflareEnv;
}

function getEnvVar(key: string, defaultValue: string = ''): string {
  // Try Cloudflare env first (for secrets set with wrangler secret put)
  if (cloudflareEnv && cloudflareEnv[key] !== undefined) {
    return cloudflareEnv[key] || defaultValue;
  }

  if (typeof process !== 'undefined' && process.env && process.env[key] !== undefined) {
    return process.env[key] || defaultValue;
  }

  if (typeof globalThis !== 'undefined') {
    // Check if value is directly on globalThis
    if ((globalThis as any)[key] !== undefined) {
      return (globalThis as any)[key] || defaultValue;
    }
    // Also check in __CF_ENV__ if available
    if ((globalThis as any).__CF_ENV__ && (globalThis as any).__CF_ENV__[key] !== undefined) {
      return (globalThis as any).__CF_ENV__[key] || defaultValue;
    }
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
