"use client"

import { useEffect, useState } from "react"
import { Loader2, Download, Package, MapPin } from "lucide-react"

interface OrderItem {
  name: string
  colorLabel: string
  size: string
  quantity: number
  price: number
}

interface Order {
  id: string
  customer_name: string
  customer_phone: string
  customer_address: string
  customer_email: string | null
  customer_lat: number | null
  customer_lng: number | null
  items: OrderItem[]
  total: number
  status: string
  created_at: string
}

const STATUS_OPTIONS = [
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Confirmée" },
  { value: "shipped", label: "Expédiée" },
  { value: "delivered", label: "Livrée" },
  { value: "cancelled", label: "Annulée" },
]

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  confirmed: "bg-blue-500/20 text-blue-400",
  shipped: "bg-purple-500/20 text-purple-400",
  delivered: "bg-green-500/20 text-green-400",
  cancelled: "bg-red-500/20 text-red-400",
}

export function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    loadOrders()
    window.addEventListener("nostra-dashboard-refresh", loadOrders)
    return () => window.removeEventListener("nostra-dashboard-refresh", loadOrders)
  }, [])

  async function loadOrders() {
    setLoading(true)
    try {
      const res = await fetch("/api/orders")
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(orderId: string, newStatus: string) {
    setUpdatingId(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20 space-y-3">
        <Package className="w-10 h-10 text-neutral-700 mx-auto" />
        <p className="text-neutral-500">Aucune commande pour le moment.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
          <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
            <div>
              <p className="font-semibold">{order.id}</p>
              <p className="text-xs text-neutral-500">
                {new Date(order.created_at).toLocaleString("fr-FR")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>
                {STATUS_OPTIONS.find((s) => s.value === order.status)?.label || order.status}
              </span>
              <select
                value={order.status}
                disabled={updatingId === order.id}
                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                className="bg-neutral-800 border border-neutral-700 rounded-lg text-xs px-2 py-1.5"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <a
                href={`/api/orders/${order.id}/invoice`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-white"
                title="Télécharger la facture"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mb-4">
            <div>
              <p className="text-neutral-500 text-xs">Client</p>
              <p>{order.customer_name}</p>
            </div>
            <div>
              <p className="text-neutral-500 text-xs">Téléphone</p>
              <p>{order.customer_phone}</p>
            </div>
            <div>
              <p className="text-neutral-500 text-xs">Adresse</p>
              <p className="truncate">{order.customer_address}</p>
              {order.customer_lat != null && order.customer_lng != null && (
                <a
                  href={`https://www.google.com/maps?q=${order.customer_lat},${order.customer_lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-1"
                >
                  <MapPin className="w-3 h-3" /> Voir sur Google Maps
                </a>
              )}
            </div>
          </div>

          <div className="border-t border-neutral-800 pt-3 space-y-1">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm text-neutral-300">
                <span>
                  {item.name} ({item.colorLabel}, {item.size}) × {item.quantity}
                </span>
                <span>{item.price * item.quantity} DH</span>
              </div>
            ))}
            <div className="flex justify-between font-semibold pt-2 border-t border-neutral-800 mt-2">
              <span>Total</span>
              <span>{order.total} DH</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
