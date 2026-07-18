"use client"

import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import { Heart, SlidersHorizontal } from "lucide-react"
import { useProducts } from "@/lib/use-products"
import { useWishlist } from "@/lib/use-wishlist"

export function About() {
  const [isVisible, setIsVisible] = useState(false)
  const [displayedProductCount, setDisplayedProductCount] = useState(6)
  const [activeCategory, setActiveCategory] = useState<string>("Tous")
  const [sortOrder, setSortOrder] = useState<"default" | "price-asc" | "price-desc">("default")
  const { products: allProducts } = useProducts()
  const { isWishlisted, toggleWishlist } = useWishlist()

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  const categories = useMemo(() => {
    const unique = Array.from(new Set(allProducts.map((p) => p.category).filter(Boolean)))
    return ["Tous", ...unique]
  }, [allProducts])

  const filteredProducts = useMemo(() => {
    let list =
      activeCategory === "Tous" ? allProducts : allProducts.filter((p) => p.category === activeCategory)

    if (sortOrder === "price-asc") {
      list = [...list].sort((a, b) => Number.parseFloat(a.price) - Number.parseFloat(b.price))
    } else if (sortOrder === "price-desc") {
      list = [...list].sort((a, b) => Number.parseFloat(b.price) - Number.parseFloat(a.price))
    }
    return list
  }, [allProducts, activeCategory, sortOrder])

  const products = filteredProducts.slice(0, displayedProductCount)

  const handleShowMore = () => {
    setDisplayedProductCount((prevCount) => prevCount + 4)
  }

  return (
    <section id="collection" className="py-20 bg-white dark:bg-black transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6 animate-fade-in-up">
            <div className="h-px bg-black dark:bg-white w-16"></div>
            <div className="h-px bg-black dark:bg-white w-16"></div>
          </div>
          <h2
            className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in-up dark:text-white"
            style={{ animationDelay: "0.2s" }}
          >
            Produits
          </h2>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat)
                  setDisplayedProductCount(6)
                }}
                className={cn(
                  "px-4 py-2 text-sm rounded-full border transition-colors",
                  activeCategory === cat
                    ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                    : "border-gray-300 text-gray-600 hover:border-black dark:border-neutral-700 dark:text-gray-300 dark:hover:border-white",
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-sm">
            <SlidersHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
              className="bg-transparent border border-gray-300 dark:border-neutral-700 dark:text-white rounded-full px-3 py-2 text-sm focus:outline-none"
            >
              <option value="default" className="text-black">
                Trier par
              </option>
              <option value="price-asc" className="text-black">
                Prix croissant
              </option>
              <option value="price-desc" className="text-black">
                Prix décroissant
              </option>
            </select>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400">Aucun produit dans cette catégorie.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product, index) => (
              <div
                key={product.id}
                className={cn(
                  "group relative block bg-white dark:bg-neutral-950 border border-gray-100 dark:border-neutral-800 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 transform",
                  isVisible ? "animate-fade-in-up opacity-100" : "opacity-0",
                )}
                style={{
                  animationDelay: `${0.6 + index * 0.1}s`,
                  animationFillMode: "both",
                }}
              >
                <Link href={`/products/${product.id}`} className="block cursor-pointer">
                  <div className="aspect-[3/4] overflow-hidden bg-gray-50 dark:bg-neutral-900 relative">
                    {/* Base image */}
                    <Image
                      src={product.images[0] || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 50vw, 33vw"
                      loading={index < 3 ? "eager" : "lazy"}
                      className={cn(
                        "object-cover transition-opacity duration-500",
                        product.images[1] ? "group-hover:opacity-0" : "group-hover:scale-110 duration-700",
                      )}
                    />
                    {/* Hover swap image (if a second photo exists) */}
                    {product.images[1] && (
                      <Image
                        src={product.images[1] || "/placeholder.svg"}
                        alt={`${product.name} - vue 2`}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 50vw, 33vw"
                        loading="lazy"
                        className="object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none"></div>
                    <div className="absolute top-4 right-4 w-8 h-8 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <span className="text-white text-xs font-bold">١١١</span>
                    </div>
                  </div>
                  <div className="p-3 sm:p-6 transform group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 sm:mb-2 group-hover:text-black dark:group-hover:text-white transition-colors duration-300">
                      {product.category}
                    </p>
                    <h3 className="font-semibold text-sm sm:text-lg mb-1 sm:mb-2 dark:text-white group-hover:text-black dark:group-hover:text-gray-200 transition-colors duration-300 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-base sm:text-xl font-bold dark:text-white group-hover:scale-105 transition-transform duration-300 origin-left">
                      {product.price} DH
                    </p>
                  </div>
                </Link>

                {/* Wishlist button */}
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    toggleWishlist(product.id)
                  }}
                  className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 dark:bg-black/70 backdrop-blur flex items-center justify-center shadow-sm hover:scale-110 transition-transform z-10"
                  aria-label="Ajouter aux favoris"
                >
                  <Heart
                    className={cn(
                      "w-4 h-4",
                      isWishlisted(product.id) ? "fill-red-500 text-red-500" : "text-gray-700 dark:text-gray-300",
                    )}
                  />
                </button>
              </div>
            ))}
          </div>
        )}

        {displayedProductCount < filteredProducts.length && (
          <div className="text-center mt-12">
            <button
              onClick={handleShowMore}
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 hover:scale-105 px-8 py-3 font-medium tracking-wide transition-all duration-300 transform animate-fade-in-up"
              style={{ animationDelay: "1.2s" }}
            >
              Voir toute la collection
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
