import { NextRequest, NextResponse } from "next/server";
import { setAuthCookies } from "next-firebase-auth-edge/lib/next/cookies";
import { getFirebaseAuth } from "next-firebase-auth-edge/lib/auth";
import { serverConfig } from "@/lib/firebase/server";
import { getDb } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { cookieSignatureKeys } from "@/lib/auth/cookie-secret";

export async function POST(request: NextRequest) {
  const reqBody = (await request.json().catch(() => ({}))) as { idToken?: string, displayName?: string };
  const idToken = reqBody.idToken;
  const displayName = reqBody.displayName || "";

  if (!idToken) {
    return NextResponse.json({ error: "Missing ID token" }, { status: 400 });
  }

  const { verifyIdToken } = getFirebaseAuth(
    {
      projectId: serverConfig.projectId,
      clientEmail: serverConfig.clientEmail,
      privateKey: serverConfig.privateKey,
    },
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY || ""
  );

  try {
    const decodedToken = await verifyIdToken(idToken);
    const db = getDb();

    // Ensure the user exists in D1
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, decodedToken.uid),
    });

    if (!existingUser) {
      await db.insert(users).values({
        id: decodedToken.uid,
        email: decodedToken.email || "",
        displayName: displayName || decodedToken.email?.split("@")[0] || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${idToken}`);

    const response = await setAuthCookies(headers, {
      cookieName: "AuthToken",
      cookieSignatureKeys: cookieSignatureKeys(),
      cookieSerializeOptions: {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 12 * 60 * 60 * 24, // 12 days in seconds
      },
      serviceAccount: {
        projectId: serverConfig.projectId,
        clientEmail: serverConfig.clientEmail,
        privateKey: serverConfig.privateKey,
      },
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
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
