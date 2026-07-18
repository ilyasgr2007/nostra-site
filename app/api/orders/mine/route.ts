import { NextResponse } from "next/server"
import { getOrdersForCustomer } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const orders = await getOrdersForCustomer(session.user.email)
    return NextResponse.json({ orders })
  } catch (error) {
    console.error("Error fetching customer orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
