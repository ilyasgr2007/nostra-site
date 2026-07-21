"use client"

import { useEffect, useState } from "react"
import { Loader2, Ticket, Plus, Trash2, Percent } from "lucide-react"

interface PromoCode {
  code: string
  discount_percent: number
  active: boolean
  created_at: string
}

export function PromoCodesTab() {
  const [codes, setCodes] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [newCode, setNewCode] = useState("")
  const [newDiscount, setNewDiscount] = useState("10")
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    loadCodes()
    window.addEventListener("nostra-dashboard-refresh", loadCodes)
    return () => window.removeEventListener("nostra-dashboard-refresh", loadCodes)
  }, [])

  function loadCodes() {
    fetch("/api/promo-codes")
      .then((res) => res.json())
      .then((data) => setCodes(data.promoCodes || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!newCode.trim() || !newDiscount) {
      setError("Le code et le pourcentage sont requis.")
      return
    }
    setCreating(true)
    try {
      const res = await fetch("/api/promo-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: newCode.trim(), discountPercent: Number.parseInt(newDiscount, 10) }),
      })
      const data = await res.json()
      if (res.ok) {
        setNewCode("")
        setNewDiscount("10")
        loadCodes()
      } else {
        setError(data.error || "Erreur lors de la création.")
      }
    } catch (err) {
      setError("Une erreur est survenue.")
    } finally {
      setCreating(false)
    }
  }

  async function handleToggle(code: string, active: boolean) {
    try {
      await fetch("/api/promo-codes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, active: !active }),
      })
      loadCodes()
    } catch (err) {
      console.error(err)
    }
  }

  async function handleDelete(code: string) {
    if (!confirm(`Supprimer le code "${code}" ?`)) return
    try {
      await fetch(`/api/promo-codes?code=${encodeURIComponent(code)}`, { method: "DELETE" })
      loadCodes()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-2">
        <Ticket className="w-5 h-5 text-neutral-400" />
        <h2 className="text-lg font-semibold">Codes promo</h2>
      </div>
      <p className="text-sm text-neutral-500">
        Créez des codes de réduction que vos clients peuvent utiliser lors du paiement dans le panier.
      </p>

      <form
        onSubmit={handleCreate}
        className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col sm:flex-row gap-3 items-end"
      >
        <div className="flex-1 w-full">
          <label className="text-xs text-neutral-500 block mb-1">Code</label>
          <input
            value={newCode}
            onChange={(e) => setNewCode(e.target.value.toUpperCase())}
            placeholder="NOSTRA10"
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neutral-500"
          />
        </div>
        <div className="w-full sm:w-32">
          <label className="text-xs text-neutral-500 block mb-1">Réduction %</label>
          <input
            type="number"
            min={1}
            max={100}
            value={newDiscount}
            onChange={(e) => setNewDiscount(e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neutral-500"
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="flex items-center gap-2 bg-white text-black rounded-lg px-4 py-2 text-sm font-medium hover:bg-neutral-200 transition disabled:opacity-50 whitespace-nowrap"
        >
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Créer
        </button>
      </form>
      {error && <p className="text-xs text-red-400">{error}</p>}

      {codes.length === 0 ? (
        <p className="text-neutral-500 text-center py-8">Aucun code promo pour le moment.</p>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden divide-y divide-neutral-800">
          {codes.map((c) => (
            <div key={c.code} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center">
                  <Percent className="w-4 h-4 text-neutral-400" />
                </div>
                <div>
                  <p className="text-sm font-mono font-semibold">{c.code}</p>
                  <p className="text-xs text-neutral-500">{c.discount_percent}% de réduction</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggle(c.code, c.active)}
                  className={`text-xs px-2.5 py-1 rounded-full transition ${
                    c.active
                      ? "bg-emerald-950 text-emerald-400 hover:bg-emerald-900"
                      : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                  }`}
                >
                  {c.active ? "Actif" : "Inactif"}
                </button>
                <button
                  onClick={() => handleDelete(c.code)}
                  className="text-neutral-500 hover:text-red-400 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
