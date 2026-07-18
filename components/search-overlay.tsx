"use client"
import { useEffect, useRef, useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import { useProducts } from "@/lib/use-products"

interface SearchOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const { products } = useProducts()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      inputRef.current?.focus()
    } else {
      document.body.style.overflow = ""
      setQuery("")
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.category || "").toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q),
      )
      .slice(0, 8)
  }, [query, products])

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-start justify-center p-4 sm:p-8 animate-in fade-in-0 duration-300"
      onClick={(e) => {
        if (overlayRef.current === e.target) onClose()
      }}
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 p-6 sm:p-8 rounded-lg shadow-2xl mt-16 animate-in slide-in-from-top-10 duration-300 max-h-[80vh] overflow-y-auto">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
          onClick={onClose}
          aria-label="Fermer la recherche"
        >
          <X className="h-6 w-6" />
        </Button>
        <h2 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">Rechercher un produit</h2>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Rechercher un produit, une catégorie..."
            className="w-full pl-12 pr-4 py-3 h-14 text-lg border-2 border-gray-200 focus:border-black dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:border-white"
            aria-label="Champ de recherche"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {query.trim() !== "" && (
          <div className="mt-6">
            {results.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                Aucun produit trouvé pour "{query}".
              </p>
            ) : (
              <div className="space-y-2">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    onClick={onClose}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <div className="relative w-14 h-14 flex-shrink-0 bg-gray-50 dark:bg-neutral-800 rounded overflow-hidden">
                      <Image
                        src={product.images?.[0] || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate dark:text-white">{product.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{product.category}</p>
                    </div>
                    <p className="text-sm font-semibold dark:text-white">{product.price} DH</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {query.trim() === "" && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
            Commencez à taper pour voir les résultats. Appuyez sur Échap pour fermer.
          </p>
        )}
      </div>
    </div>
  )
}
