import { cookies } from "next/headers";
import { getTokens } from "next-firebase-auth-edge";
import { serverConfig } from "@/lib/firebase/server";
import { getAdminDb } from "@/lib/firebase/server";
import { env } from "@/lib/env";

export async function auth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("AuthToken")?.value;

  if (!token) {
    return null;
  }

  try {
    const tokens = await getTokens(cookieStore, {
      apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
      cookieName: "AuthToken",
      cookieSignatureKeys: [env.COOKIE_SECRET_CURRENT],
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
    const adminDb = getAdminDb();
    const userDoc = await adminDb.collection("users").doc(decodedToken.uid).get();

    if (!userDoc.exists) {
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

    const dbUser = userDoc.data();

    return {
      user: {
        id: decodedToken.uid,
        ...dbUser
      },
    };
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}
