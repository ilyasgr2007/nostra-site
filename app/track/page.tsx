"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SearchOverlay } from "@/components/search-overlay"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Package, CheckCircle2, Clock, Truck, XCircle, Download, Search } from "lucide-react"

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
  items: OrderItem[]
  total: number
  status: string
  created_at: string
}

const STATUS_STEPS = [
  { key: "pending", label: "Commande reçue", icon: Clock },
  { key: "confirmed", label: "Confirmée", icon: CheckCircle2 },
  { key: "shipped", label: "Expédiée", icon: Truck },
  { key: "delivered", label: "Livrée", icon: Package },
]

function TrackContent() {
  const searchParams = useSearchParams()
  const [orderNumber, setOrderNumber] = useState(searchParams.get("order") || "")
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showSearchOverlay, setShowSearchOverlay] = useState(false)

  async function handleSearch(e?: React.FormEvent) {
    e?.preventDefault()
    if (!orderNumber.trim()) return
    setLoading(true)
    setError("")
    setOrder(null)
    try {
      const res = await fetch(`/api/orders/${orderNumber.trim()}`)
      const data = await res.json()
      if (res.ok) {
        setOrder(data.order)
      } else {
        setError(data.error || "Commande introuvable")
      }
    } catch {
      setError("Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (searchParams.get("order")) {
      handleSearch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isCancelled = order?.status === "cancelled"
  const currentStepIndex = order ? STATUS_STEPS.findIndex((s) => s.key === order.status) : -1

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      <Header onSearchClick={() => setShowSearchOverlay(true)} />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-3 dark:text-white">Suivre ma commande</h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-10">
          Entrez votre numéro de commande pour voir son statut.
        </p>

        <form onSubmit={handleSearch} className="flex gap-3 max-w-md mx-auto mb-12">
          <Input
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="ex: NOS-260718-A1B2"
            className="h-12 dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
          />
          <Button type="submit" disabled={loading} className="h-12 bg-black text-white dark:bg-white dark:text-black">
            <Search className="w-4 h-4" />
          </Button>
        </form>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && <p className="text-center text-red-500">{error}</p>}

        {order && (
          <div className="bg-gray-50 dark:bg-neutral-900 rounded-2xl p-6 sm:p-8 space-y-8">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Commande</p>
                <p className="text-lg font-semibold dark:text-white">{order.id}</p>
              </div>
              <a
                href={`/api/orders/${order.id}/invoice`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-lg hover:opacity-90 transition"
              >
                <Download className="w-4 h-4" /> Facture PDF
              </a>
            </div>

            {isCancelled ? (
              <div className="flex items-center gap-3 text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg p-4">
                <XCircle className="w-6 h-6" />
                <span className="font-medium">Cette commande a été annulée.</span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                {STATUS_STEPS.map((step, idx) => {
                  const Icon = step.icon
                  const isActive = idx <= currentStepIndex
                  return (
                    <div key={step.key} className="flex-1 flex flex-col items-center relative">
                      {idx > 0 && (
                        <div
                          className={`absolute top-5 right-1/2 w-full h-0.5 -z-10 ${
                            isActive ? "bg-black dark:bg-white" : "bg-gray-200 dark:bg-neutral-700"
                          }`}
                        />
                      )}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isActive
                            ? "bg-black text-white dark:bg-white dark:text-black"
                            : "bg-gray-200 text-gray-400 dark:bg-neutral-700 dark:text-neutral-500"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <p className="text-xs mt-2 text-center dark:text-gray-300">{step.label}</p>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="border-t border-gray-200 dark:border-neutral-700 pt-6 space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm dark:text-gray-300">
                  <span>
                    {item.name} ({item.colorLabel}, {item.size}) × {item.quantity}
                  </span>
                  <span>{item.price * item.quantity} DH</span>
                </div>
              ))}
              <div className="flex justify-between font-semibold pt-3 border-t border-gray-200 dark:border-neutral-700 dark:text-white">
                <span>Total</span>
                <span>{order.total} DH</span>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mt-10">
          <Link href="/" className="text-sm text-gray-500 dark:text-gray-400 hover:underline">
            ← Retour à la boutique
          </Link>
        </div>
      </main>
      <Footer />
      <SearchOverlay isOpen={showSearchOverlay} onClose={() => setShowSearchOverlay(false)} />
    </div>
  )
}

export default function TrackPage() {
  return (
    <Suspense fallback={null}>
      <TrackContent />
    </Suspense>
  )
}
