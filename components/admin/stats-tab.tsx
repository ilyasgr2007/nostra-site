"use client"

import { useEffect, useState } from "react"
import { Loader2, TrendingUp, DollarSign, Package, Users, Clock, CheckCircle2 } from "lucide-react"

interface Stats {
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  deliveredOrders: number
  totalCustomers: number
  totalProducts: number
  topProducts: { name: string; quantity: number }[]
}

export function StatsTab() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    function loadStats() {
      fetch("/api/stats")
        .then((res) => res.json())
        .then((data) => setStats(data.stats))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false))
    }
    loadStats()
    window.addEventListener("nostra-dashboard-refresh", loadStats)
    return () => window.removeEventListener("nostra-dashboard-refresh", loadStats)
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
      </div>
    )
  }

  if (!stats) return null

  const cards = [
    { label: "Chiffre d'affaires", value: `${stats.totalRevenue} DH`, icon: DollarSign },
    { label: "Commandes totales", value: stats.totalOrders, icon: Package },
    { label: "En attente", value: stats.pendingOrders, icon: Clock },
    { label: "Livrées", value: stats.deliveredOrders, icon: CheckCircle2 },
    { label: "Clients inscrits", value: stats.totalCustomers, icon: Users },
    { label: "Produits actifs", value: stats.totalProducts, icon: TrendingUp },
  ]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-gradient-to-br from-neutral-900 to-neutral-900/50 border border-neutral-800 rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 text-neutral-500 text-xs mb-2">
              <card.icon className="w-3.5 h-3.5" /> {card.label}
            </div>
            <p className="text-2xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
        <h3 className="font-semibold mb-4">Produits les plus vendus</h3>
        {stats.topProducts.length === 0 ? (
          <p className="text-neutral-500 text-sm">Aucune vente pour le moment.</p>
        ) : (
          <div className="space-y-3">
            {stats.topProducts.map((product, idx) => (
              <div key={product.name} className="flex items-center gap-3">
                <span className="text-neutral-500 text-sm w-5">{idx + 1}.</span>
                <span className="flex-1 text-sm">{product.name}</span>
                <span className="text-sm font-medium bg-neutral-800 rounded-full px-3 py-1">
                  {product.quantity} vendu(s)
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
