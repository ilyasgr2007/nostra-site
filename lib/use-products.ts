"use client"

import { useState, useEffect } from "react"
import { mockProducts, type ProductData } from "./product-utils"

// Shared in-memory cache so every component that needs products doesn't
// re-trigger its own network request — the first one wins, others reuse it.
let cachedProducts: ProductData[] | null = null
let inFlightRequest: Promise<ProductData[]> | null = null

function fetchProducts(): Promise<ProductData[]> {
  if (cachedProducts) return Promise.resolve(cachedProducts)
  if (inFlightRequest) return inFlightRequest

  inFlightRequest = fetch("/api/products")
    .then((res) => res.json())
    .then((data) => {
      if (data.products && data.products.length > 0) {
        cachedProducts = data.products
        return data.products as ProductData[]
      }
      return mockProducts
    })
    .catch((err) => {
      console.error("Failed to load products, using fallback data:", err)
      return mockProducts
    })
    .finally(() => {
      inFlightRequest = null
    })

  return inFlightRequest
}

export function useProducts() {
  const [products, setProducts] = useState<ProductData[]>(cachedProducts || mockProducts)
  const [loading, setLoading] = useState(!cachedProducts)

  useEffect(() => {
    let cancelled = false
    fetchProducts().then((result) => {
      if (!cancelled) {
        setProducts(result)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  return { products, loading }
}
