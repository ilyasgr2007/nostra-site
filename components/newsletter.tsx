"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail } from "lucide-react"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setIsSubscribed(true)
      setEmail("")
      setTimeout(() => setIsSubscribed(false), 3000)
    }
  }

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-black flex items-center justify-center">
            <Mail className="h-8 w-8 text-white" />
          </div>
        </div>

        <h2 className="text-4xl md:text-5xl font-bold tracking-wide mb-6">Restez Informé</h2>

        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
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
              className="flex-1 h-14 px-6 text-lg border-2 border-gray-200 focus:border-black transition-colors"
              required
            />
            <Button
              type="submit"
              size="lg"
              className="bg-black hover:bg-gray-800 text-white px-8 h-14 text-lg font-medium tracking-wide"
            >
              S'abonner
            </Button>
          </div>
        </form>

        {isSubscribed && (
          <div className="mt-6 p-4 bg-black text-white rounded-lg max-w-md mx-auto">
            <p className="font-medium">Merci ! Vous êtes maintenant abonné à notre newsletter.</p>
          </div>
        )}

        <p className="text-sm text-gray-500 mt-6">
          Nous respectons votre vie privée. Désabonnement possible à tout moment.
        </p>

        {/* Decorative elements */}
        <div className="flex justify-center mt-16 space-x-8">
          <div className="w-12 h-px bg-black"></div>
          <div className="w-3 h-3 bg-black transform rotate-45"></div>
          <div className="w-12 h-px bg-black"></div>
        </div>
      </div>
    </section>
  )
}
