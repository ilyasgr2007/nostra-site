"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function AutoSliderBanner() {
  const images = [
    "https://64.media.tumblr.com/db8472cfbb89a155148003b053d5f3de/4d6d987e0cee7307-8e/s400x225/158142e8e876044a6191733a02f6ee5ac1643b58.gif",
    "https://i.pinimg.com/originals/14/f4/35/14f435eaaf8d107cca5055ce150eaf47.gif",
  ]

  const [currentIndex, setCurrentIndex] = useState(0)

  /* --- Helpers ---------------------------------------------------------- */
  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  const prev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  /* --- Auto-play --------------------------------------------------------- */
  useEffect(() => {
    const id = setInterval(next, 5000) // 5 s
    return () => clearInterval(id)
  }, [next])

  /* --- Scroll to “about / products” on CTA ------------------------------ */
  const handleShopClick = () => {
    document
      .getElementById("about") // adjust if the section id changes
      ?.scrollIntoView({ behavior: "smooth" })
  }

  /* --- Markup ----------------------------------------------------------- */
  return (
    <section className="relative w-full h-screen overflow-hidden pt-16">
      {/* Slides */}
      {images.map((src, index) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={src || "/placeholder.svg"}
            alt={`Banner ${index + 1}`}
            fill
            priority={index === 0}
            unoptimized
            style={{ objectFit: "cover" }}
          />
        </div>
      ))}

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 text-black-100">NOSTRA</h1>

        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className="h-px bg-white w-16" />
          <span className="text-3xl font-light">١١١</span>
          <div className="h-px bg-white w-16" />
        </div>

        <Button size="lg" className="bg-white text-black hover:bg-gray-200 px-8" onClick={handleShopClick}>
          Shop Now
        </Button>
      </div>
    </section>
  )
}
