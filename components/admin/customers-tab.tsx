"use client"

import { useEffect, useState } from "react"
import { Loader2, Users, Mail } from "lucide-react"

interface Customer {
  id: string
  email: string
  name: string | null
  image: string | null
  created_at: string
  last_login_at: string
}

interface Subscriber {
  email: string
  subscribed_at: string
}

export function CustomersTab() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"customers" | "newsletter">("customers")

  useEffect(() => {
    function loadData() {
      Promise.all([
        fetch("/api/customers").then((res) => res.json()),
        fetch("/api/newsletter").then((res) => res.json()),
      ])
        .then(([customersData, newsletterData]) => {
          setCustomers(customersData.customers || [])
          setSubscribers(newsletterData.subscribers || [])
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false))
    }
    loadData()
    window.addEventListener("nostra-dashboard-refresh", loadData)
    return () => window.removeEventListener("nostra-dashboard-refresh", loadData)
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
      <div className="flex gap-2">
        <button
          onClick={() => setTab("customers")}
          className={`px-4 py-2 text-sm rounded-full transition ${
            tab === "customers" ? "bg-white text-black" : "bg-neutral-800 text-neutral-300"
          }`}
        >
          <Users className="w-3.5 h-3.5 inline mr-1.5" />
          Comptes clients ({customers.length})
        </button>
        <button
          onClick={() => setTab("newsletter")}
          className={`px-4 py-2 text-sm rounded-full transition ${
            tab === "newsletter" ? "bg-white text-black" : "bg-neutral-800 text-neutral-300"
          }`}
        >
          <Mail className="w-3.5 h-3.5 inline mr-1.5" />
          Newsletter ({subscribers.length})
        </button>
      </div>

      {tab === "customers" ? (
        customers.length === 0 ? (
          <p className="text-neutral-500 text-center py-10">Aucun client inscrit pour le moment.</p>
        ) : (
          <div className="space-y-3">
            {customers.map((customer) => (
              <div
                key={customer.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center gap-4"
              >
                {customer.image ? (
                  <img
                    src={customer.image || "/placeholder.svg"}
                    alt={customer.name || customer.email}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-sm">
                    {(customer.name || customer.email)[0]?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{customer.name || "Sans nom"}</p>
                  <p className="text-xs text-neutral-500 truncate">{customer.email}</p>
                </div>
                <p className="text-xs text-neutral-500">
                  Inscrit le {new Date(customer.created_at).toLocaleDateString("fr-FR")}
                </p>
              </div>
            ))}
          </div>
        )
      ) : subscribers.length === 0 ? (
        <p className="text-neutral-500 text-center py-10">Aucun abonné à la newsletter pour le moment.</p>
      ) : (
        <div className="space-y-2">
          {subscribers.map((sub) => (
            <div
              key={sub.email}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex items-center justify-between"
            >
              <span className="text-sm">{sub.email}</span>
              <span className="text-xs text-neutral-500">
                {new Date(sub.subscribed_at).toLocaleDateString("fr-FR")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
