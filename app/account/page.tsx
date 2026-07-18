"use client"

import { useEffect, useState } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SearchOverlay } from "@/components/search-overlay"
import { Button } from "@/components/ui/button"
import { Package, LogOut, Download, ExternalLink } from "lucide-react"

interface OrderItem {
  name: string
  colorLabel: string
  size: string
  quantity: number
  price: number
}

interface Order {
  id: string
  items: OrderItem[]
  total: number
  status: string
  created_at: string
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "En attente", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300" },
  confirmed: { label: "Confirmée", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300" },
  shipped: { label: "Expédiée", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300" },
  delivered: { label: "Livrée", color: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300" },
  cancelled: { label: "Annulée", color: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300" },
}

export default function AccountPage() {
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [showSearchOverlay, setShowSearchOverlay] = useState(false)

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/orders/mine")
        .then((res) => res.json())
        .then((data) => setOrders(data.orders || []))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false))
    } else if (status === "unauthenticated") {
      setLoading(false)
    }
  }, [status])

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      <Header onSearchClick={() => setShowSearchOverlay(true)} />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        {status === "loading" ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !session?.user ? (
          <div className="text-center space-y-6 py-16">
            <h1 className="text-2xl font-bold dark:text-white">Mon Compte</h1>
            <p className="text-gray-500 dark:text-gray-400">Connectez-vous pour voir vos commandes et votre profil.</p>
            <Button
              onClick={() => signIn("google")}
              className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              Se connecter avec Google
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-10">
              {session.user.image && (
                <img
                  src={session.user.image || "/placeholder.svg"}
                  alt={session.user.name || "Profil"}
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div className="flex-1">
                <h1 className="text-xl font-bold dark:text-white">{session.user.name}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{session.user.email}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => signOut()} className="dark:text-white dark:border-neutral-700">
                <LogOut className="w-4 h-4 mr-2" /> Déconnexion
              </Button>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <Package className="w-5 h-5 dark:text-white" />
              <h2 className="text-lg font-semibold dark:text-white">Mes commandes</h2>
            </div>

            {loading ? (
              <div className="flex justify-center py-10">
                <div className="w-6 h-6 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-10">
                Vous n'avez pas encore passé de commande.{" "}
                <Link href="/" className="underline">
                  Découvrir la collection
                </Link>
              </p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const statusInfo = STATUS_LABELS[order.status] || STATUS_LABELS.pending
                  return (
                    <div
                      key={order.id}
                      className="bg-gray-50 dark:bg-neutral-900 rounded-xl p-5 flex items-center justify-between flex-wrap gap-3"
                    >
                      <div>
                        <p className="font-medium dark:text-white">{order.id}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(order.created_at).toLocaleDateString("fr-FR")} · {order.items.length} article(s)
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                        <span className="font-semibold dark:text-white">{order.total} DH</span>
                        <Link
                          href={`/track?order=${order.id}`}
                          className="text-gray-400 hover:text-black dark:hover:text-white"
                          title="Suivre la commande"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <a
                          href={`/api/orders/${order.id}/invoice`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-black dark:hover:text-white"
                          title="Télécharger la facture"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
      <SearchOverlay isOpen={showSearchOverlay} onClose={() => setShowSearchOverlay(false)} />
    </div>
  )
}
