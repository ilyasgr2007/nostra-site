"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useProducts } from "@/lib/use-products"

export function About() {
  const [isVisible, setIsVisible] = useState(false)
  const [displayedProductCount, setDisplayedProductCount] = useState(6) // State to manage displayed product count
  const { products: allProducts } = useProducts()

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  // Use a subset of allProducts or define specific products for this section
  const products = allProducts.slice(0, displayedProductCount) // Use displayedProductCount

  const handleShowMore = () => {
    setDisplayedProductCount((prevCount) => prevCount + 4) // Increase by 4 products
  }

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6 animate-fade-in-up">
            <div className="h-px bg-black w-16"></div>

            <div className="h-px bg-black w-16"></div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Produits
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <Link
              href={`/products/${product.id}`}
              key={product.id}
              className={cn(
                "group block cursor-pointer bg-white border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 transform",
                isVisible ? "animate-fade-in-up opacity-100" : "opacity-0",
              )}
              style={{
                animationDelay: `${0.6 + index * 0.1}s`,
                animationFillMode: "both",
              }}
            >
              <div className="group cursor-pointer">
                <div className="aspect-[3/4] overflow-hidden bg-gray-50 relative">
                  <img
                    src={product.images[0] || "/placeholder.svg"} // Use first image from product data
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                  <div className="absolute top-4 right-4 w-8 h-8 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-white text-xs font-bold">١١١</span>
                  </div>
                </div>
                <div className="p-6 transform group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-sm text-gray-500 uppercase tracking-wide mb-2 group-hover:text-black transition-colors duration-300">
                    {product.category}
                  </p>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-black transition-colors duration-300">
                    {product.name}
                  </h3>
                  <p className="text-xl font-bold group-hover:scale-105 transition-transform duration-300">
                    {product.price} DH
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {displayedProductCount < allProducts.length && ( // Conditionally render the button
          <div className="text-center mt-12">
            <button
              onClick={handleShowMore} // Add onClick handler
              className="bg-black text-white hover:bg-gray-800 hover:scale-105 px-8 py-3 font-medium tracking-wide transition-all duration-300 transform animate-fade-in-up"
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
