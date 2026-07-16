"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Home, Shirt, Mail } from "lucide-react" // Removed ShoppingBag
import { Button } from "@/components/ui/button"

interface HeaderProps {
  onSearchClick: () => void
}

export function Header({ onSearchClick }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div
              className="w-10 h-10 flex items-center justify-center rounded-sm bg-cover bg-center relative overflow-hidden"
              style={{ backgroundImage: `url('/images/kratz.jpeg')` }}
            >
              <div className="absolute inset-0 bg-black/50"></div> {/* Overlay for text readability */}
              <span className="relative z-10 text-white font-bold text-lg">١١١</span>
            </div>
            <span className="text-xl font-bold tracking-wider">NOSTRA</span>
          </Link>

          {/* Desktop Navigation Links with Icons */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="flex items-center space-x-2 hover:text-gray-600 transition-colors"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <Home className="h-5 w-5" />
              <span>Accueil</span>
            </Link>
            <Link href="/#collection" className="flex items-center space-x-2 hover:text-gray-600 transition-colors">
              <Shirt className="h-5 w-5" />
              <span>Collection</span>
            </Link>
            <Link href="/#contact" className="flex items-center space-x-2 hover:text-gray-600 transition-colors">
              <Mail className="h-5 w-5" />
              <span>Contact</span>
            </Link>
          </nav>

          {/* Desktop Icons (Search) */}
          <div className="hidden md:flex items-center space-x-6">{/* Removed ShoppingBag button */}</div>

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
              {/* Mobile Navigation Links with Icons */}
              <Link
                href="/"
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  setIsOpen(false)
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }}
              >
                <Home className="h-6 w-6" />
                <span>Accueil</span>
              </Link>
              <Link
                href="/#collection"
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                <Shirt className="h-6 w-6" />
                <span>Collection</span>
              </Link>
              <Link
                href="/#contact"
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                <Mail className="h-6 w-6" />
                <span>Contact</span>
              </Link>
              {/* Mobile Icons (Search) */}
              <div className="flex justify-center space-x-8 py-4 border-t mt-2">
                {/* Removed ShoppingBag button for mobile */}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
