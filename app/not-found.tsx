"use client"

import Link from "next/link"
import { Home, Search, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center px-4 transition-colors duration-300">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-2">
          <p className="text-8xl font-bold tracking-tighter text-black dark:text-white">404</p>
          <div className="flex items-center justify-center gap-3">
            <div className="h-px bg-black dark:bg-white w-12"></div>
            <span className="text-sm uppercase tracking-widest text-gray-500 dark:text-gray-400">NOSTRA</span>
            <div className="h-px bg-black dark:bg-white w-12"></div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-black dark:text-white">Page introuvable</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Désolé, la page que vous cherchez n'existe pas ou a été déplacée.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-black text-white dark:bg-white dark:text-black px-6 py-3 font-medium hover:opacity-90 transition-opacity"
          >
            <Home className="w-4 h-4" />
            Retour à l'accueil
          </Link>
          <Link
            href="/#collection"
            className="flex items-center justify-center gap-2 border border-gray-300 dark:border-neutral-700 text-black dark:text-white px-6 py-3 font-medium hover:bg-gray-50 dark:hover:bg-neutral-900 transition-colors"
          >
            <Search className="w-4 h-4" />
            Voir la collection
          </Link>
        </div>

        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-black dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Page précédente
        </button>
      </div>
    </div>
  )
}
