"use client"

import { useEffect, useState } from "react"
import { Loader2, ShieldCheck, LogIn, LogOut, Monitor } from "lucide-react"

interface ActivityEntry {
  id: number
  action: "login" | "logout"
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

function parseDevice(userAgent: string | null) {
  if (!userAgent) return "Appareil inconnu"
  if (/android/i.test(userAgent)) return "Android"
  if (/iphone|ipad/i.test(userAgent)) return "iOS"
  if (/windows/i.test(userAgent)) return "Windows"
  if (/mac/i.test(userAgent)) return "Mac"
  if (/linux/i.test(userAgent)) return "Linux"
  return "Autre appareil"
}

export function SecurityTab() {
  const [activity, setActivity] = useState<ActivityEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/activity")
      .then((res) => res.json())
      .then((data) => setActivity(data.activity || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-neutral-400" />
        <h2 className="text-lg font-semibold">Historique de connexion Admin</h2>
      </div>
      <p className="text-sm text-neutral-500">
        Historique des connexions et déconnexions à l'espace administrateur (50 dernières entrées).
      </p>

      {activity.length === 0 ? (
        <p className="text-neutral-500 text-center py-12">Aucune activité enregistrée pour le moment.</p>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="divide-y divide-neutral-800">
            {activity.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      entry.action === "login" ? "bg-emerald-950 text-emerald-400" : "bg-neutral-800 text-neutral-400"
                    }`}
                  >
                    {entry.action === "login" ? <LogIn className="w-4 h-4" /> : <LogOut className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {entry.action === "login" ? "Connexion" : "Déconnexion"}
                    </p>
                    <p className="text-xs text-neutral-500 flex items-center gap-1">
                      <Monitor className="w-3 h-3" /> {parseDevice(entry.user_agent)}
                      {entry.ip_address && entry.ip_address !== "unknown" ? ` · ${entry.ip_address}` : ""}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-neutral-500 text-right whitespace-nowrap">
                  {new Date(entry.created_at).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                  <br />
                  {new Date(entry.created_at).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
