import { NextRequest, NextResponse } from "next/server";
import { setAuthCookies } from "next-firebase-auth-edge/lib/next/cookies";
import { verifyIdToken, serverConfig } from "@/lib/firebase/server";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  const reqBody = (await request.json().catch(() => ({}))) as { idToken?: string, displayName?: string };
  const idToken = reqBody.idToken;
  const displayName = reqBody.displayName || "";

  if (!idToken) {
    return NextResponse.json({ error: "Missing ID token" }, { status: 400 });
  }

  try {
    const decodedToken = await verifyIdToken(idToken);
    const { getAdminDb } = await import("@/lib/firebase/server")
    const adminDb = getAdminDb()

    // Ensure the user exists in Firestore
    const userRef = adminDb.collection("users").doc(decodedToken.uid)
    const userDoc = await userRef.get()

    if (!userDoc.exists) {
      await userRef.set({
        email: decodedToken.email || "",
        displayName: displayName || decodedToken.email?.split("@")[0] || "",
        profile: {
          displayName: displayName || decodedToken.email?.split("@")[0] || ""
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${idToken}`);

    const response = await setAuthCookies(headers, {
      cookieName: "AuthToken",
      cookieSignatureKeys: [env.COOKIE_SECRET_CURRENT],
      cookieSerializeOptions: {
        path: "/",
        httpOnly: true,
        secure: env.isProduction,
        sameSite: "lax",
        maxAge: 12 * 60 * 60 * 24, // 12 days in seconds
      },
      serviceAccount: {
        projectId: serverConfig.projectId,
        clientEmail: serverConfig.clientEmail,
        privateKey: serverConfig.privateKey,
      },
      apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
    });

    return response;
  } catch (error) {
    console.error("Error creating session cookie", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ status: "success" });
  response.cookies.delete("AuthToken");
  response.cookies.delete("AuthToken.sig");
  return response;
}
