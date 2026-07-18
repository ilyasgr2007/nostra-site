import { NextResponse } from "next/server"
import { subscribeToNewsletter, getAllNewsletterSubscribers } from "@/lib/db"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 })
    }
    await subscribeToNewsletter(email)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error subscribing to newsletter:", error)
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 })
  }
}

export async function GET() {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get("admin_session")?.value === "authenticated"
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const subscribers = await getAllNewsletterSubscribers()
    return NextResponse.json({ subscribers })
  } catch (error) {
    console.error("Error fetching subscribers:", error)
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 })
  }
}
