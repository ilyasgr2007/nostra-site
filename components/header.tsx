"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, Home, Shirt, Mail, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"

interface HeaderProps {
  onSearchClick: () => void
}

export function Header({ onSearchClick }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <header className="fixed top-0 w-full bg-white/90 dark:bg-black/90 backdrop-blur-md z-50 border-b border-gray-100 dark:border-neutral-800 transition-colors duration-300">
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
            <span className="text-xl font-bold tracking-wider dark:text-white">NOSTRA</span>
          </Link>

          {/* Desktop Navigation Links with Icons */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="flex items-center space-x-2 hover:text-gray-600 dark:text-white dark:hover:text-gray-300 transition-colors"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <Home className="h-5 w-5" />
              <span>Accueil</span>
            </Link>
            <Link
              href="/#collection"
              className="flex items-center space-x-2 hover:text-gray-600 dark:text-white dark:hover:text-gray-300 transition-colors"
            >
              <Shirt className="h-5 w-5" />
              <span>Collection</span>
            </Link>
            <Link
              href="/#contact"
              className="flex items-center space-x-2 hover:text-gray-600 dark:text-white dark:hover:text-gray-300 transition-colors"
            >
              <Mail className="h-5 w-5" />
              <span>Contact</span>
            </Link>
          </nav>

          {/* Desktop Icons (Search + Theme toggle) */}
          <div className="hidden md:flex items-center space-x-2">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="dark:text-white"
                aria-label="Basculer le mode sombre"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-1 md:hidden">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="dark:text-white"
                aria-label="Basculer le mode sombre"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            )}
            <Button variant="ghost" size="icon" className="dark:text-white" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-black border-t dark:border-neutral-800">
              {/* Mobile Navigation Links with Icons */}
              <Link
                href="/"
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-900"
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
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-900"
                onClick={() => setIsOpen(false)}
              >
                <Shirt className="h-6 w-6" />
                <span>Collection</span>
              </Link>
              <Link
                href="/#contact"
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-900"
                onClick={() => setIsOpen(false)}
              >
                <Mail className="h-6 w-6" />
                <span>Contact</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
