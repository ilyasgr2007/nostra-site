"use client"
import { useEffect, useRef, useState } from "react"
import type React from "react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

interface SearchOverlayProps {
  isOpen: boolean
  onClose: () => void
  onSearch: (query: string) => void // New prop to send search query
}

export function SearchOverlay({ isOpen, onClose, onSearch }: SearchOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = useState("") // State for input value

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden" // Prevent scrolling when overlay is open
      inputRef.current?.focus() // Focus the input when opened
    } else {
      document.body.style.overflow = "" // Restore scrolling
      setInputValue("") // Clear input when closed
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])

  const handleSearchSubmit = () => {
    onSearch(inputValue)
    onClose() // Close the overlay after search
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearchSubmit()
    }
  }

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-start justify-center p-4 sm:p-8 animate-in fade-in-0 duration-300"
      onClick={(e) => {
        if (overlayRef.current === e.target) {
          onClose()
        }
      }}
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-lg shadow-2xl mt-16 animate-in slide-in-from-top-10 duration-300">
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
            placeholder="Rechercher..."
            className="w-full pl-12 pr-4 py-3 h-14 text-lg border-2 border-gray-200 focus:border-black dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-white"
            aria-label="Champ de recherche"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200 px-6 h-10"
            onClick={handleSearchSubmit}
          >
            Rechercher
          </Button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">Appuyez sur Échap pour fermer.</p>
      </div>
    </div>
  )
}
