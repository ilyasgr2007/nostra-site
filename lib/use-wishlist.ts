"use client"

import { useState, useEffect, useCallback } from "react"

const STORAGE_KEY = "nostra_wishlist"

function readWishlist(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeWishlist(ids: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // ignore storage errors (private browsing, etc.)
  }
}

export function useWishlist() {
  const [wishlist, setWishlist] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setWishlist(readWishlist())
    setMounted(true)

    // Keep multiple tabs / components in sync
    function handleStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) setWishlist(readWishlist())
    }
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  const isWishlisted = useCallback((id: string) => wishlist.includes(id), [wishlist])

  const toggleWishlist = useCallback((id: string) => {
    setWishlist((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      writeWishlist(next)
      return next
    })
  }, [])

  return { wishlist, isWishlisted, toggleWishlist, mounted }
}
