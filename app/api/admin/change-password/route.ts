import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getSetting, setSetting } from "@/lib/db"

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.get("admin_session")?.value === "authenticated"
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Le nouveau mot de passe doit contenir au moins 6 caractères" },
        { status: 400 },
      )
    }

    const actualPassword = await getSetting("admin_password")
    if (currentPassword !== actualPassword) {
      return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 401 })
    }

    await setSetting("admin_password", newPassword)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error changing password:", error)
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 })
  }
}
