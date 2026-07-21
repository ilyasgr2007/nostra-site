import { NextResponse } from "next/server"
import { validatePromoCode } from "@/lib/db"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")

  if (!code) {
    return NextResponse.json({ valid: false })
  }

  try {
    const result = await validatePromoCode(code)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error validating promo code:", error)
    return NextResponse.json({ valid: false })
  }
}
