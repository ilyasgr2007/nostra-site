import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getSetting, setSetting } from "@/lib/db"

async function isAuthenticated() {
  const cookieStore = await cookies()
  return cookieStore.get("admin_session")?.value === "authenticated"
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const whatsappNumber = await getSetting("whatsapp_number")
  return NextResponse.json({ whatsappNumber })
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const { whatsappNumber } = await request.json()
    if (!whatsappNumber || !/^\d{9,15}$/.test(whatsappNumber)) {
      return NextResponse.json(
        { error: "Numéro invalide. Utilisez le format international sans le +, ex: 212612345678" },
        { status: 400 },
      )
    }
    await setSetting("whatsapp_number", whatsappNumber)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
