"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Loader2 } from "lucide-react"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setIsSubscribed(true)
        setEmail("")
        setTimeout(() => setIsSubscribed(false), 4000)
      } else {
        const data = await res.json()
        setError(data.error || "Une erreur est survenue")
      }
    } catch {
      setError("Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-24 bg-gray-50 dark:bg-neutral-950 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-black dark:bg-white flex items-center justify-center">
            <Mail className="h-8 w-8 text-white dark:text-black" />
          </div>
        </div>

        <h2 className="text-4xl md:text-5xl font-bold tracking-wide mb-6 dark:text-white">Restez Informé</h2>

        <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          Soyez les premiers à découvrir nos nouvelles collections, nos collaborations exclusives et l'univers NOSTRA
          111.
        </p>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              type="email"
              placeholder="Votre adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-14 px-6 text-lg border-2 border-gray-200 focus:border-black dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-white transition-colors"
              required
            />
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200 px-8 h-14 text-lg font-medium tracking-wide"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "S'abonner"}
            </Button>
          </div>
        </form>

        {error && <p className="text-sm text-red-500 mt-4">{error}</p>}

        {isSubscribed && (
          <div className="mt-6 p-4 bg-black dark:bg-white text-white dark:text-black rounded-lg max-w-md mx-auto">
            <p className="font-medium">Merci ! Vous êtes maintenant abonné à notre newsletter.</p>
          </div>
        )}

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
          Nous respectons votre vie privée. Désabonnement possible à tout moment.
        </p>

        {/* Decorative elements */}
        <div className="flex justify-center mt-16 space-x-8">
          <div className="w-12 h-px bg-black dark:bg-white"></div>
          <div className="w-3 h-3 bg-black transform rotate-45"></div>
          <div className="w-12 h-px bg-black"></div>
        </div>
      </div>
    </section>
  )
}
