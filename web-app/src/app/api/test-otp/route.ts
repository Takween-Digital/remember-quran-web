import { requestPasswordResetOTP } from "@/actions/authActions"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    console.log("[TEST-OTP-API] Received request for:", email)

    const result = await requestPasswordResetOTP(email)

    console.log("[TEST-OTP-API] Result:", result)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("[TEST-OTP-API] Error:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
