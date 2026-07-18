"use client"

import { useState, useEffect, useCallback } from "react"

export interface CartItem {
  id: string // unique line id: productId-color-size
  productId: string
  name: string
  image: string
  color: string
  colorLabel: string
  size: string
  price: number
  quantity: number
  sku: string
  stock: number
}

const STORAGE_KEY = "nostra_cart"
const CART_UPDATED_EVENT = "nostra_cart_updated"

function readCart(): CartItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeCart(items: CartItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT))
  } catch {
    // ignore storage errors
  }
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    setItems(readCart())

    function handleUpdate() {
      setItems(readCart())
    }
    window.addEventListener(CART_UPDATED_EVENT, handleUpdate)
    window.addEventListener("storage", handleUpdate)
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, handleUpdate)
      window.removeEventListener("storage", handleUpdate)
    }
  }, [])

  const addItem = useCallback((newItem: Omit<CartItem, "id">) => {
    const id = `${newItem.productId}-${newItem.color}-${newItem.size}`
    const current = readCart()
    const existingIndex = current.findIndex((i) => i.id === id)
    let updated: CartItem[]
    if (existingIndex >= 0) {
      updated = current.map((i, idx) =>
        idx === existingIndex
          ? { ...i, quantity: Math.min(i.quantity + newItem.quantity, newItem.stock) }
          : i,
      )
    } else {
      updated = [...current, { ...newItem, id }]
    }
    writeCart(updated)
    setItems(updated)
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    const current = readCart()
    const updated = current
      .map((i) => (i.id === id ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) } : i))
      .filter((i) => i.quantity > 0)
    writeCart(updated)
    setItems(updated)
  }, [])

  const removeItem = useCallback((id: string) => {
    const current = readCart()
    const updated = current.filter((i) => i.id !== id)
    writeCart(updated)
    setItems(updated)
  }, [])

  const clearCart = useCallback(() => {
    writeCart([])
    setItems([])
  }, [])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.quantity * i.price, 0)

  return { items, addItem, updateQuantity, removeItem, clearCart, totalItems, totalPrice }
}
