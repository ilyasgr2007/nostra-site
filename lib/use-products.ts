"use client"

import { useState, useEffect } from "react"
import { mockProducts, type ProductData } from "./product-utils"

export function useProducts() {
  const [products, setProducts] = useState<ProductData[]>(mockProducts)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.products && data.products.length > 0) {
          setProducts(data.products)
        }
      })
      .catch((err) => {
        console.error("Failed to load products, using fallback data:", err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { products, loading }
}
