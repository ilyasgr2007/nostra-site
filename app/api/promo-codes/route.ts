import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getAllPromoCodes, createPromoCode, deletePromoCode, togglePromoCode } from "@/lib/db"

async function isAuthenticated() {
  const cookieStore = await cookies()
  return cookieStore.get("admin_session")?.value === "authenticated"
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const promoCodes = await getAllPromoCodes()
    return NextResponse.json({ promoCodes })
  } catch (error) {
    console.error("Error fetching promo codes:", error)
    return NextResponse.json({ error: "Failed to fetch promo codes" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const { code, discountPercent } = await request.json()
    if (!code || !discountPercent || discountPercent < 1 || discountPercent > 100) {
      return NextResponse.json({ error: "Code et pourcentage de réduction valides requis" }, { status: 400 })
    }
    await createPromoCode(code, discountPercent)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error creating promo code:", error)
    return NextResponse.json({ error: "Failed to create promo code" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const { code, active } = await request.json()
    await togglePromoCode(code, active)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating promo code:", error)
    return NextResponse.json({ error: "Failed to update promo code" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    if (!code) {
      return NextResponse.json({ error: "Code requis" }, { status: 400 })
    }
    await deletePromoCode(code)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting promo code:", error)
    return NextResponse.json({ error: "Failed to delete promo code" }, { status: 500 })
  }
}
