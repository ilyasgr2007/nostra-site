"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, Home, Shirt, Mail, Sun, Moon, LogIn, LogOut, ShoppingBag, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { useSession, signIn, signOut } from "next-auth/react"
import { useCart } from "@/lib/use-cart"
import { CartDrawer } from "@/components/cart-drawer"

interface HeaderProps {
  onSearchClick: () => void
}

export function Header({ onSearchClick }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { data: session, status } = useSession()
  const { totalItems } = useCart()
  const [isCartOpen, setIsCartOpen] = useState(false)

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

          {/* Desktop Icons (Search + Theme toggle + Auth) */}
          <div className="hidden md:flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="dark:text-white" onClick={onSearchClick} aria-label="Rechercher">
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative dark:text-white"
              onClick={() => setIsCartOpen(true)}
              aria-label="Panier"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
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

            {status === "authenticated" && session?.user ? (
              <div className="flex items-center gap-2">
                <Link href="/account" className="flex items-center gap-2 hover:opacity-75 transition-opacity">
                  {session.user.image && (
                    <img
                      src={session.user.image || "/placeholder.svg"}
                      alt={session.user.name || "Profil"}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="text-sm dark:text-white max-w-[100px] truncate">
                    {session.user.name?.split(" ")[0]}
                  </span>
                </Link>
                <Button variant="ghost" size="icon" className="dark:text-white" onClick={() => signOut()} title="Se déconnecter">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 dark:text-white dark:border-neutral-700 bg-transparent"
                onClick={() => signIn("google")}
              >
                <LogIn className="h-4 w-4" /> Se connecter
              </Button>
            )}
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <Button variant="ghost" size="icon" className="dark:text-white" onClick={onSearchClick} aria-label="Rechercher">
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative dark:text-white"
              onClick={() => setIsCartOpen(true)}
              aria-label="Panier"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
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

              <div className="px-3 py-3 border-t dark:border-neutral-800 mt-2">
                {status === "authenticated" && session?.user ? (
                  <div className="flex items-center justify-between">
                    <Link
                      href="/account"
                      className="flex items-center gap-2"
                      onClick={() => setIsOpen(false)}
                    >
                      {session.user.image && (
                        <img
                          src={session.user.image || "/placeholder.svg"}
                          alt={session.user.name || "Profil"}
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <span className="text-sm dark:text-white truncate">{session.user.name}</span>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => signOut()} className="dark:text-white">
                      <LogOut className="h-4 w-4 mr-1" /> Sortir
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full flex items-center justify-center gap-2 dark:text-white dark:border-neutral-700 bg-transparent"
                    onClick={() => signIn("google")}
                  >
                    <LogIn className="h-4 w-4" /> Se connecter avec Google
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  )
}
