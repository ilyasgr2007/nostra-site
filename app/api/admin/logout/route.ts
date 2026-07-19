import { NextResponse } from "next/server"
import { cookies, headers } from "next/headers"
import { logAdminActivity } from "@/lib/db"

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete("admin_session")

  try {
    const headersList = await headers()
    const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown"
    const userAgent = headersList.get("user-agent") || "unknown"
    await logAdminActivity("logout", ip, userAgent)
  } catch (logError) {
    console.error("Failed to log admin activity:", logError)
  }

  return NextResponse.json({ success: true })
}
