/**
 * Signing key(s) for the "AuthToken" cookie set by next-firebase-auth-edge.
 * Must never fall back to a hardcoded default — a shared/guessable key lets
 * anyone forge a signed session cookie.
 */
export function cookieSignatureKeys(): string[] {
  const current = process.env.COOKIE_SECRET_CURRENT;
  if (!current) {
    throw new Error(
      "COOKIE_SECRET_CURRENT is not set. Refusing to sign auth cookies with a default key.",
    );
  }
  return [current];
}
