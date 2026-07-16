"use client"

import { useState, useEffect } from "react"
import type { ProductData, ProductColor } from "@/lib/product-utils"
import { Loader2, Plus, Trash2, Pencil, LogOut, Upload, X } from "lucide-react"

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

  const [products, setProducts] = useState<ProductData[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
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

  async function loadProducts() {
    setLoadingProducts(true)
    try {
      const res = await fetch("/api/products")
      const data = await res.json()
      setProducts(data.products || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingProducts(false)
    }
  }

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

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append("file", file)
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

  // ---------- LOGIN SCREEN ----------
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black px-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-lg p-8 space-y-5"
        >
          <h1 className="text-xl font-semibold text-white text-center">Espace Administrateur</h1>
          <div>
            <label className="text-sm text-neutral-400 block mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-800 text-white rounded px-3 py-2 border border-neutral-700 focus:outline-none focus:border-neutral-500"
              autoFocus
            />
          </div>
          {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
          <button
            type="submit"
            disabled={loginLoading}
            className="w-full bg-white text-black rounded py-2 font-medium hover:bg-neutral-200 transition disabled:opacity-50 flex items-center justify-center gap-2"
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
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-neutral-800 sticky top-0 bg-black/95 backdrop-blur z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Gestion des produits</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={openNewForm}
              className="flex items-center gap-2 bg-white text-black rounded px-4 py-2 text-sm font-medium hover:bg-neutral-200 transition"
            >
              <Plus className="w-4 h-4" /> Ajouter un produit
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-neutral-400 hover:text-white text-sm px-3 py-2"
            >
              <LogOut className="w-4 h-4" /> Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {loadingProducts ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
          </div>
        ) : products.length === 0 ? (
          <p className="text-neutral-500 text-center py-20">ماكاين حتى منتج. زيد واحد جديد.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden group"
              >
                <div className="aspect-square bg-neutral-800 relative overflow-hidden">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0] || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-600 text-sm">
                      Pas d'image
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-medium text-sm truncate">{product.name}</h3>
                  <p className="text-neutral-400 text-sm">{product.price} MAD</p>
                  {product.category && (
                    <span className="inline-block text-xs bg-neutral-800 text-neutral-400 rounded px-2 py-0.5">
                      {product.category}
                    </span>
                  )}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => openEditForm(product)}
                      className="flex-1 flex items-center justify-center gap-1 bg-neutral-800 hover:bg-neutral-700 rounded py-1.5 text-xs transition"
                    >
                      <Pencil className="w-3 h-3" /> Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 flex items-center justify-center gap-1 bg-red-950 hover:bg-red-900 text-red-400 rounded py-1.5 text-xs transition"
                    >
                      <Trash2 className="w-3 h-3" /> Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ---------- ADD/EDIT MODAL ---------- */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg w-full max-w-2xl my-8">
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
