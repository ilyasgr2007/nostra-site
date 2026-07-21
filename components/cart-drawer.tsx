"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { X, Minus, Plus, Trash2, MessageCircle, ShoppingBag, Loader2, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/lib/use-cart"
import { useToast } from "@/hooks/use-toast"
import { LocationPicker } from "@/components/location-picker"

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCart()
  const { toast } = useToast()
  const router = useRouter()
  const [showCheckoutForm, setShowCheckoutForm] = useState(false)
  const [customer, setCustomer] = useState({ name: "", phone: "", address: "" })
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [showMapPicker, setShowMapPicker] = useState(false)
  const [sending, setSending] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [whatsappNumber, setWhatsappNumber] = useState("212631809890")
  const [promoCode, setPromoCode] = useState("")
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPercent: number } | null>(null)
  const [checkingPromo, setCheckingPromo] = useState(false)
  const [promoError, setPromoError] = useState("")

  useEffect(() => {
    setMounted(true)
    fetch("/api/settings/public")
      .then((res) => res.json())
      .then((data) => {
        if (data.whatsappNumber) setWhatsappNumber(data.whatsappNumber)
      })
      .catch(() => {})
  }, [])

  const discountAmount = appliedPromo ? Math.round((totalPrice * appliedPromo.discountPercent) / 100) : 0
  const finalTotal = totalPrice - discountAmount

  async function handleApplyPromo() {
    if (!promoCode.trim()) return
    setPromoError("")
    setCheckingPromo(true)
    try {
      const res = await fetch(`/api/promo-codes/validate?code=${encodeURIComponent(promoCode.trim())}`)
      const data = await res.json()
      if (data.valid) {
        setAppliedPromo({ code: promoCode.trim().toUpperCase(), discountPercent: data.discountPercent })
        setPromoError("")
      } else {
        setAppliedPromo(null)
        setPromoError("Code promo invalide ou expiré.")
      }
    } catch (err) {
      setPromoError("Erreur lors de la vérification du code.")
    } finally {
      setCheckingPromo(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  if (!isOpen || !mounted) return null

  async function handleSendOrder(e: React.FormEvent) {
    e.preventDefault()
    if (!customer.name || !customer.phone || !customer.address) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs pour passer la commande.",
        variant: "destructive",
      })
      return
    }

    if (!location) {
      toast({
        title: "Localisation requise",
        description: "Veuillez choisir votre position sur la carte pour confirmer la livraison.",
        variant: "destructive",
      })
      setShowMapPicker(true)
      return
    }

    setSending(true)
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customer.name,
          customerPhone: customer.phone,
          customerAddress: customer.address,
          customerLat: location.lat,
          customerLng: location.lng,
          items: items.map((item) => ({
            name: item.name,
            colorLabel: item.colorLabel,
            size: item.size,
            quantity: item.quantity,
            price: item.price,
          })),
          total: finalTotal,
          promoCode: appliedPromo?.code || null,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast({
          title: "Erreur",
          description: data.error || "Impossible de créer la commande.",
          variant: "destructive",
        })
        return
      }

      const orderId = data.order.id
      const itemsList = items
        .map(
          (item, idx) =>
            `${idx + 1}. ${item.name} — ${item.colorLabel}, taille ${item.size} — Qté: ${item.quantity} — ${item.price * item.quantity} DH`,
        )
        .join("\n")

      const message = `
Bonjour, je souhaite passer une commande.

*Numéro de commande: ${orderId}*

*Détails du client:*
Nom: ${customer.name}
Téléphone: ${customer.phone}
Adresse: ${customer.address}

*Panier:*
${itemsList}
${appliedPromo ? `\nCode promo: ${appliedPromo.code} (-${appliedPromo.discountPercent}%)` : ""}
*Total: ${finalTotal} DH*

Merci!
      `.trim()

      const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
      window.open(whatsappLink, "_blank")
      clearCart()
      setShowCheckoutForm(false)
      setCustomer({ name: "", phone: "", address: "" })
      setLocation(null)
      setPromoCode("")
      setAppliedPromo(null)
      onClose()
      toast({
        title: `Commande ${orderId} envoyée !`,
        description: "Votre commande a été enregistrée et envoyée via WhatsApp.",
      })
      router.push(`/track?order=${orderId}`)
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de la commande.",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[110] flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-neutral-950 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-neutral-800">
          <h2 className="text-lg font-semibold flex items-center gap-2 dark:text-white">
            <ShoppingBag className="w-5 h-5" /> Mon Panier
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black dark:hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6">
            <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-neutral-700" />
            <p className="text-gray-500 dark:text-gray-400">Votre panier est vide</p>
          </div>
        ) : !showCheckoutForm ? (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 pb-4 border-b border-gray-100 dark:border-neutral-800">
                  <div className="relative w-20 h-20 bg-gray-50 dark:bg-neutral-900 flex-shrink-0 rounded overflow-hidden">
                    <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate dark:text-white">{item.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.colorLabel} · {item.size}
                    </p>
                    <p className="text-sm font-semibold mt-1 dark:text-white">{item.price} DH</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center border border-gray-300 dark:border-neutral-700 rounded"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm w-6 text-center dark:text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-6 h-6 flex items-center justify-center border border-gray-300 dark:border-neutral-700 rounded disabled:opacity-30"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto text-gray-400 hover:text-red-500"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-5 border-t border-gray-100 dark:border-neutral-800 space-y-3">
              {!appliedPromo ? (
                <div className="flex gap-2">
                  <Input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Code promo"
                    className="dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={checkingPromo}
                    onClick={handleApplyPromo}
                    className="whitespace-nowrap bg-transparent"
                  >
                    {checkingPromo ? <Loader2 className="w-4 h-4 animate-spin" /> : "Appliquer"}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between text-sm bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-md px-3 py-2">
                  <span>
                    Code <strong>{appliedPromo.code}</strong> appliqué (-{appliedPromo.discountPercent}%)
                  </span>
                  <button
                    onClick={() => {
                      setAppliedPromo(null)
                      setPromoCode("")
                    }}
                    className="text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    Retirer
                  </button>
                </div>
              )}
              {promoError && <p className="text-xs text-red-500">{promoError}</p>}

              {appliedPromo && (
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Sous-total</span>
                  <span>{totalPrice} DH</span>
                </div>
              )}
              {appliedPromo && (
                <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
                  <span>Réduction</span>
                  <span>-{discountAmount} DH</span>
                </div>
              )}
              <div className="flex justify-between text-base font-semibold dark:text-white">
                <span>Total</span>
                <span>{finalTotal} DH</span>
              </div>
              <Button
                className="w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                size="lg"
                onClick={() => setShowCheckoutForm(true)}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Commander via WhatsApp
              </Button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSendOrder} className="flex-1 flex flex-col px-6 py-4 space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Remplissez vos coordonnées pour finaliser la commande de {items.length} article(s).
            </p>
            <div>
              <label className="text-sm text-gray-700 dark:text-gray-300 block mb-1">Nom</label>
              <Input
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                className="dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700 dark:text-gray-300 block mb-1">Téléphone</label>
              <Input
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                className="dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700 dark:text-gray-300 block mb-1">Adresse</label>
              <Input
                value={customer.address}
                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                className="dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowMapPicker(true)}
                className={`mt-2 w-full flex items-center justify-center gap-1.5 text-sm rounded-md py-2 border transition ${
                  location
                    ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30"
                    : "border-dashed border-neutral-400 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 hover:border-black dark:hover:border-white"
                }`}
              >
                <MapPin className="w-4 h-4" />
                {location ? "Position confirmée · Modifier" : "Choisir ma position sur la carte (obligatoire)"}
              </button>
            </div>
            <div className="mt-auto space-y-2 pt-4">
              <Button
                type="submit"
                disabled={sending}
                className="w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                size="lg"
              >
                {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MessageCircle className="w-4 h-4 mr-2" />}
                {sending ? "Envoi en cours..." : "Envoyer la commande"}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setShowCheckoutForm(false)}>
                Retour au panier
              </Button>
            </div>
          </form>
        )}
      </div>
      <LocationPicker
        isOpen={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        onConfirm={({ address, lat, lng }) => {
          setCustomer((prev) => ({ ...prev, address }))
          setLocation({ lat, lng })
        }}
      />
    </div>,
    document.body,
  )
}
