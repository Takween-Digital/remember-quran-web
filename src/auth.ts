import { cookies } from "next/headers";
import { getTokens } from "next-firebase-auth-edge";
import { serverConfig } from "@/lib/firebase/server";
import { getDb } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { cookieSignatureKeys } from "@/lib/auth/cookie-secret";

export async function auth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("AuthToken")?.value;

  if (!token) {
    return null;
  }

  try {
    const tokens = await getTokens(cookieStore, {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
      cookieName: "AuthToken",
      cookieSignatureKeys: cookieSignatureKeys(),
      serviceAccount: {
        projectId: serverConfig.projectId,
        clientEmail: serverConfig.clientEmail,
        privateKey: serverConfig.privateKey,
      },
    });

    if (!tokens) {
      return null;
    }

    const decodedToken = tokens.decodedToken;

    // Fetch user from DB
    const db = getDb();
    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, decodedToken.uid),
    });

    if (!dbUser) {
      return {
        user: {
          id: decodedToken.uid,
          email: decodedToken.email || "",
          name: decodedToken.name || "",
          displayName: decodedToken.name || "",
          image: decodedToken.picture || null,
          avatarUrl: decodedToken.picture || null,
          roles: [],
          moderationFlagged: false,
          moderationSuspended: false,
          settings: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };
    }

    return {
      user: dbUser,
    };
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}
