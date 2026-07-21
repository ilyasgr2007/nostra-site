"use client"

import { useState, useEffect, useMemo } from "react"
import type { ProductData, ProductColor } from "@/lib/product-utils"
import {
  Loader2,
  Plus,
  Trash2,
  Pencil,
  LogOut,
  Upload,
  X,
  Search,
  Copy,
  Package,
  Tag,
  ShieldCheck,
  BarChart3,
  ClipboardList,
  Users,
  Shield,
  Eye,
  EyeOff,
  ExternalLink,
  RefreshCw,
  Settings,
  Ticket,
} from "lucide-react"
import { StatsTab } from "@/components/admin/stats-tab"
import { OrdersTab } from "@/components/admin/orders-tab"
import { CustomersTab } from "@/components/admin/customers-tab"
import { SecurityTab } from "@/components/admin/security-tab"
import { SettingsTab } from "@/components/admin/settings-tab"
import { PromoCodesTab } from "@/components/admin/promo-codes-tab"

type ColorRow = { name: string; hex: string; label: string }

const emptyForm = {
  id: "",
  name: "",
  price: "",
  category: "",
  shortDescription: "",
  description: "",
  sizes: "S,M,L,XL",
  composition: "",
  care: "",
  origin: "",
}

export default function DashboardClient({ initialAuth }: { initialAuth: boolean }) {
  const [authed, setAuthed] = useState(initialAuth)
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [products, setProducts] = useState<ProductData[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<
    "products" | "orders" | "customers" | "stats" | "security" | "settings" | "promo"
  >("products")
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [colors, setColors] = useState<ColorRow[]>([{ name: "noir", hex: "#000000", label: "Noir" }])
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")

  useEffect(() => {
    if (authed) loadProducts()
  }, [authed])

  useEffect(() => {
    if (!authed) return

    function loadPendingCount() {
      fetch("/api/stats")
        .then((res) => res.json())
        .then((data) => setPendingOrdersCount(data.stats?.pendingOrders || 0))
        .catch((err) => console.error("Failed to load pending orders count:", err))
    }

    loadPendingCount()
    const interval = setInterval(loadPendingCount, 60000) // refresh every minute
    return () => clearInterval(interval)
  }, [authed])

  async function loadProducts() {
    setLoadingProducts(true)
    try {
      const res = await fetch("/api/products")
      if (!res.ok) {
        console.error("Failed to load products, keeping previous list")
        return
      }
      const data = await res.json()
      setProducts(data.products || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingProducts(false)
    }
  }

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products
    const q = searchQuery.toLowerCase()
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.category || "").toLowerCase().includes(q),
    )
  }, [products, searchQuery])

  const categoryCount = useMemo(() => new Set(products.map((p) => p.category).filter(Boolean)).size, [products])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError("")
    setLoginLoading(true)
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        setAuthed(true)
      } else {
        const data = await res.json()
        setLoginError(data.error || "Mot de passe incorrect")
      }
    } catch (e) {
      setLoginError("Une erreur est survenue")
    } finally {
      setLoginLoading(false)
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" })
    setAuthed(false)
    setPassword("")
  }

  function resetForm() {
    setForm(emptyForm)
    setColors([{ name: "noir", hex: "#000000", label: "Noir" }])
    setImages([])
    setEditingId(null)
    setFormError("")
  }

  function openNewForm() {
    resetForm()
    setShowForm(true)
  }

  function openEditForm(product: ProductData) {
    setEditingId(product.id)
    setForm({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category || "",
      shortDescription: product.shortDescription || "",
      description: product.description || "",
      sizes: (product.sizes || []).join(","),
      composition: product.composition || "",
      care: product.care || "",
      origin: product.origin || "",
    })
    setColors(
      product.colors && product.colors.length > 0
        ? product.colors.map((c) => ({ name: c.name, hex: c.hex, label: c.label }))
        : [{ name: "noir", hex: "#000000", label: "Noir" }],
    )
    setImages(product.images || [])
    setFormError("")
    setShowForm(true)
  }

  // Redimensionne/compresse une image côté navigateur avant l'envoi,
  // pour que le site reste rapide même avec des photos prises au téléphone.
  function compressImage(file: File, maxWidth = 1600, quality = 0.82): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new window.Image()
      const reader = new FileReader()
      reader.onload = () => {
        img.onload = () => {
          const scale = Math.min(1, maxWidth / img.width)
          const canvas = document.createElement("canvas")
          canvas.width = img.width * scale
          canvas.height = img.height * scale
          const ctx = canvas.getContext("2d")
          if (!ctx) return reject(new Error("Canvas not supported"))
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Compression failed"))), "image/jpeg", quality)
        }
        img.onerror = reject
        img.src = reader.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        let uploadBlob: Blob = file
        try {
          uploadBlob = await compressImage(file)
        } catch {
          // If compression fails for any reason, fall back to the original file
          uploadBlob = file
        }
        const formData = new FormData()
        formData.append("file", uploadBlob, file.name.replace(/\.[^/.]+$/, ".jpg"))
        const res = await fetch("/api/upload", { method: "POST", body: formData })
        if (res.ok) {
          const data = await res.json()
          setImages((prev) => [...prev, data.url])
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((i) => i !== url))
  }

  function updateColorRow(index: number, field: keyof ColorRow, value: string) {
    setColors((prev) => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)))
  }

  function addColorRow() {
    setColors((prev) => [...prev, { name: "", hex: "#000000", label: "" }])
  }

  function removeColorRow(index: number) {
    setColors((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError("")

    if (!form.name || !form.price) {
      setFormError("الاسم والثمن خاصهم يكونو معمرين")
      return
    }
    if (images.length === 0) {
      setFormError("زيد على الأقل صورة وحدة")
      return
    }

    setSaving(true)
    try {
      const sizesArr = form.sizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)

      const productColors: ProductColor[] = colors
        .filter((c) => c.name && c.label)
        .map((c) => ({ name: c.name, hex: c.hex, label: c.label }))

      const id = editingId || form.id || Date.now().toString()

      const variants = productColors.flatMap((color) =>
        sizesArr.map((size) => ({
          color: color.hex,
          size,
          sku: `${id}-${color.name}-${size}`.toUpperCase(),
          price: Number.parseFloat(form.price) || 0,
          availability: "in_stock" as const,
        })),
      )

      const existing = editingId ? products.find((p) => p.id === editingId) : null

      const productData: ProductData = {
        id,
        name: form.name,
        price: form.price,
        images,
        description: form.description,
        shortDescription: form.shortDescription,
        category: form.category,
        sizes: sizesArr,
        colors: productColors,
        composition: form.composition,
        care: form.care,
        origin: form.origin,
        reviews: existing?.reviews || [],
        relatedProducts: existing?.relatedProducts || [],
        variants,
      }

      const url = editingId ? `/api/products/${editingId}` : "/api/products"
      const method = editingId ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      })

      if (res.ok) {
        setShowForm(false)
        resetForm()
        await loadProducts()
      } else {
        const data = await res.json()
        setFormError(data.error || "خطأ فالتسجيل")
      }
    } catch (err) {
      console.error(err)
      setFormError("خطأ فالتسجيل")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("واش متأكد بغيتي تمسح هاد المنتج؟")) return
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
      if (res.ok) {
        await loadProducts()
      }
    } catch (err) {
      console.error(err)
    }
  }

  async function handleDuplicate(product: ProductData) {
    const newId = Date.now().toString()
    const duplicated: ProductData = {
      ...product,
      id: newId,
      name: `${product.name} (copie)`,
      variants: product.variants.map((v) => ({ ...v, sku: `${v.sku}-COPY` })),
    }
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(duplicated),
      })
      if (res.ok) {
        await loadProducts()
      }
    } catch (err) {
      console.error(err)
    }
  }

  // ---------- LOGIN SCREEN ----------
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black px-4 relative overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />

        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm bg-neutral-900/70 backdrop-blur-xl border border-neutral-800 rounded-2xl p-8 space-y-6 shadow-2xl relative z-10"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white to-neutral-400 flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-7 h-7 text-black" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-semibold text-white tracking-tight">NOSTRA Admin</h1>
              <p className="text-sm text-neutral-500 mt-1">Connectez-vous pour gérer votre boutique</p>
            </div>
          </div>

          <div>
            <label className="text-sm text-neutral-400 block mb-1.5">Mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-neutral-800/80 text-white rounded-xl px-4 py-3 pr-11 border border-neutral-700 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/10 transition"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {loginError && (
            <p className="text-red-400 text-sm bg-red-950/50 border border-red-900/50 rounded-lg px-3 py-2">
              {loginError}
            </p>
          )}

          <button
            type="submit"
            disabled={loginLoading}
            className="w-full bg-white text-black rounded-xl py-3 font-medium hover:bg-neutral-200 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
          >
            {loginLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Se connecter
          </button>
        </form>
      </div>
    )
  }

  // ---------- DASHBOARD ----------
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="border-b border-neutral-800/80 sticky top-0 bg-neutral-950/90 backdrop-blur-xl z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white to-neutral-400 flex items-center justify-center">
              <Package className="w-4.5 h-4.5 text-black" />
            </div>
            <div>
              <h1 className="text-base font-semibold leading-tight">NOSTRA · Dashboard</h1>
              <p className="text-xs text-neutral-500">Gestion des produits</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (activeTab === "products") loadProducts()
                window.dispatchEvent(new Event("nostra-dashboard-refresh"))
              }}
              className="flex items-center gap-2 text-neutral-400 hover:text-white text-sm px-3 py-2.5 rounded-xl hover:bg-neutral-900 transition"
              title="Actualiser"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Actualiser</span>
            </button>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 text-neutral-400 hover:text-white text-sm px-3 py-2.5 rounded-xl hover:bg-neutral-900 transition"
            >
              <ExternalLink className="w-4 h-4" />
              Voir le site
            </a>
            {activeTab === "products" && (
              <button
                onClick={openNewForm}
                className="flex items-center gap-2 bg-white text-black rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-neutral-200 transition shadow-lg"
              >
                <Plus className="w-4 h-4" /> Ajouter
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-neutral-400 hover:text-white text-sm px-3 py-2.5 rounded-xl hover:bg-neutral-900 transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 pb-3 flex items-center gap-2 overflow-x-auto">
          {[
            { key: "products", label: "Produits", icon: Package },
            { key: "orders", label: "Commandes", icon: ClipboardList },
            { key: "customers", label: "Clients", icon: Users },
            { key: "promo", label: "Codes Promo", icon: Ticket },
            { key: "stats", label: "Statistiques", icon: BarChart3 },
            { key: "security", label: "Sécurité", icon: Shield },
            { key: "settings", label: "Paramètres", icon: Settings },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition ${
                activeTab === tab.key
                  ? "bg-white text-black font-medium"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.key === "orders" && pendingOrdersCount > 0 && (
                <span
                  className={`ml-0.5 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center ${
                    activeTab === "orders" ? "bg-black text-white" : "bg-red-500 text-white"
                  }`}
                >
                  {pendingOrdersCount > 9 ? "9+" : pendingOrdersCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {activeTab === "orders" && <OrdersTab />}
        {activeTab === "customers" && <CustomersTab />}
        {activeTab === "promo" && <PromoCodesTab />}
        {activeTab === "stats" && <StatsTab />}
        {activeTab === "security" && <SecurityTab />}
        {activeTab === "settings" && <SettingsTab />}

        {activeTab === "products" && (
          <>
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-900/50 border border-neutral-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-neutral-500 text-xs mb-2">
              <Package className="w-3.5 h-3.5" /> Produits
            </div>
            <p className="text-2xl font-semibold">{products.length}</p>
          </div>
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-900/50 border border-neutral-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-neutral-500 text-xs mb-2">
              <Tag className="w-3.5 h-3.5" /> Catégories
            </div>
            <p className="text-2xl font-semibold">{categoryCount}</p>
          </div>
          <div className="hidden sm:block bg-gradient-to-br from-neutral-900 to-neutral-900/50 border border-neutral-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-neutral-500 text-xs mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Statut
            </div>
            <p className="text-2xl font-semibold text-emerald-400">En ligne</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un produit ou une catégorie..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-neutral-600 focus:ring-2 focus:ring-white/5 transition"
          />
        </div>

        {loadingProducts ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <Package className="w-10 h-10 text-neutral-700 mx-auto" />
            <p className="text-neutral-500">
              {products.length === 0 ? "ماكاين حتى منتج. زيد واحد جديد." : "ماكاين حتى نتيجة."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden group hover:border-neutral-700 transition-colors"
              >
                <div className="aspect-square bg-neutral-800 relative overflow-hidden">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0] || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-600 text-sm">
                      Pas d'image
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-4 space-y-2.5">
                  <div>
                    <h3 className="font-medium text-sm truncate">{product.name}</h3>
                    <p className="text-neutral-400 text-sm font-medium mt-0.5">{product.price} MAD</p>
                  </div>
                  {product.category && (
                    <span className="inline-block text-xs bg-neutral-800 text-neutral-300 rounded-full px-2.5 py-1">
                      {product.category}
                    </span>
                  )}
                  <div className="flex gap-1.5 pt-1">
                    <button
                      onClick={() => openEditForm(product)}
                      title="Modifier"
                      className="flex-1 flex items-center justify-center gap-1 bg-neutral-800 hover:bg-neutral-700 rounded-lg py-2 text-xs transition"
                    >
                      <Pencil className="w-3 h-3" /> Modifier
                    </button>
                    <button
                      onClick={() => handleDuplicate(product)}
                      title="Dupliquer"
                      className="flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 rounded-lg py-2 px-2.5 text-xs transition"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      title="Supprimer"
                      className="flex items-center justify-center bg-red-950 hover:bg-red-900 text-red-400 rounded-lg py-2 px-2.5 text-xs transition"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
          </>
        )}
      </main>

      {/* ---------- ADD/EDIT MODAL ---------- */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl my-8 shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-neutral-800">
              <h2 className="font-semibold">{editingId ? "Modifier le produit" : "Nouveau produit"}</h2>
              <button
                onClick={() => {
                  setShowForm(false)
                  resetForm()
                }}
                className="text-neutral-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-neutral-400 block mb-1">Nom du produit</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-neutral-800 rounded px-3 py-2 text-sm border border-neutral-700"
                  />
                </div>
                <div>
                  <label className="text-sm text-neutral-400 block mb-1">Prix (MAD)</label>
                  <input
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full bg-neutral-800 rounded px-3 py-2 text-sm border border-neutral-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-neutral-400 block mb-1">Groupe / Catégorie</label>
                <input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="ex: T-Shirts, Vestes, Accessoires..."
                  className="w-full bg-neutral-800 rounded px-3 py-2 text-sm border border-neutral-700"
                />
              </div>

              <div>
                <label className="text-sm text-neutral-400 block mb-1">Description courte</label>
                <input
                  value={form.shortDescription}
                  onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                  className="w-full bg-neutral-800 rounded px-3 py-2 text-sm border border-neutral-700"
                />
              </div>

              <div>
                <label className="text-sm text-neutral-400 block mb-1">Description complète</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full bg-neutral-800 rounded px-3 py-2 text-sm border border-neutral-700"
                />
              </div>

              <div>
                <label className="text-sm text-neutral-400 block mb-1">Tailles (séparées par des virgules)</label>
                <input
                  value={form.sizes}
                  onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                  placeholder="S,M,L,XL"
                  className="w-full bg-neutral-800 rounded px-3 py-2 text-sm border border-neutral-700"
                />
              </div>

              {/* Colors */}
              <div>
                <label className="text-sm text-neutral-400 block mb-2">Couleurs disponibles</label>
                <div className="space-y-2">
                  {colors.map((c, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={c.hex}
                        onChange={(e) => updateColorRow(i, "hex", e.target.value)}
                        className="w-9 h-9 rounded bg-neutral-800 border border-neutral-700"
                      />
                      <input
                        value={c.name}
                        onChange={(e) => updateColorRow(i, "name", e.target.value)}
                        placeholder="nom (noir)"
                        className="flex-1 bg-neutral-800 rounded px-3 py-2 text-sm border border-neutral-700"
                      />
                      <input
                        value={c.label}
                        onChange={(e) => updateColorRow(i, "label", e.target.value)}
                        placeholder="affichage (Noir)"
                        className="flex-1 bg-neutral-800 rounded px-3 py-2 text-sm border border-neutral-700"
                      />
                      <button
                        type="button"
                        onClick={() => removeColorRow(i)}
                        className="text-neutral-500 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addColorRow}
                    className="text-xs text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Ajouter une couleur
                  </button>
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="text-sm text-neutral-400 block mb-2">Photos du produit</label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {images.map((url) => (
                    <div key={url} className="relative w-20 h-20">
                      <img
                        src={url || "/placeholder.svg"}
                        alt="produit"
                        className="w-full h-full object-cover rounded border border-neutral-700"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(url)}
                        className="absolute -top-2 -right-2 bg-red-600 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <label className="flex items-center gap-2 text-sm bg-neutral-800 hover:bg-neutral-700 transition rounded px-3 py-2 cursor-pointer w-fit border border-neutral-700">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Ajouter des photos
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                </label>
              </div>

              {formError && <p className="text-red-500 text-sm">{formError}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex-1 bg-white text-black rounded py-2.5 font-medium hover:bg-neutral-200 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? "Enregistrer les modifications" : "Créer le produit"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    resetForm()
                  }}
                  className="px-5 bg-neutral-800 hover:bg-neutral-700 rounded py-2.5 text-sm transition"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
