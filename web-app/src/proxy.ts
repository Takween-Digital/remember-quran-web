import { NextRequest, NextResponse } from "next/server"

export async function proxy(request: NextRequest) {
  // A lightweight edge check to see if the user has a token cookie.
  // This bypasses the need to do expensive JWT verification or DB calls
  // on every request at the edge, saving critical CPU time on Cloudflare.
  // The actual verification happens in the API route.
  const token = request.cookies.get("AuthToken")?.value

  if (!token) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("next", request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Only apply this middleware to account routes.
    // Public routes like /[surahId] completely bypass this for 0ms CPU time.
    "/account/:path*",
  ],
}
