import { NextResponse } from "next/server"
import { cookies, headers } from "next/headers"
import { logAdminActivity } from "@/lib/db"

const ADMIN_PASSWORD = "ilyas2007"

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 })
    }

    const cookieStore = await cookies()
    cookieStore.set("admin_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    try {
      const headersList = await headers()
      const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown"
      const userAgent = headersList.get("user-agent") || "unknown"
      await logAdminActivity("login", ip, userAgent)
    } catch (logError) {
      console.error("Failed to log admin activity:", logError)
      // Do not block login if logging fails
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 })
  }
}
