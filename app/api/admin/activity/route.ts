import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getAdminActivity } from "@/lib/db"

export async function GET() {
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.get("admin_session")?.value === "authenticated"
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const activity = await getAdminActivity(50)
    return NextResponse.json({ activity })
  } catch (error) {
    console.error("Error fetching admin activity:", error)
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 })
  }
}
