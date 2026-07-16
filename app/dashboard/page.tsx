import { cookies } from "next/headers"
import DashboardClient from "./dashboard-client"

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.get("admin_session")?.value === "authenticated"

  return <DashboardClient initialAuth={isAuthenticated} />
}
