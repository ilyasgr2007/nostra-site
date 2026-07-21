import { NextResponse } from "next/server"
import { createOrder, getAllOrders } from "@/lib/db"
import { cookies } from "next/headers"
import { auth } from "@/lib/auth"

async function isAdmin() {
  const cookieStore = await cookies()
  return cookieStore.get("admin_session")?.value === "authenticated"
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const orders = await getAllOrders()
    return NextResponse.json({ orders })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { customerName, customerPhone, customerAddress, customerLat, customerLng, items, total } = body

    if (!customerName || !customerPhone || !customerAddress || !items || !items.length) {
      return NextResponse.json({ error: "Informations manquantes" }, { status: 400 })
    }

    if (typeof customerLat !== "number" || typeof customerLng !== "number") {
      return NextResponse.json(
        { error: "Veuillez choisir votre localisation sur la carte." },
        { status: 400 },
      )
    }

    const session = await auth()
    const customerEmail = session?.user?.email || null

    const order = await createOrder({
      customerEmail,
      customerName,
      customerPhone,
      customerAddress,
      customerLat,
      customerLng,
      items,
      total,
    })

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
