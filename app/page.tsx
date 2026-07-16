"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { AutoSliderBanner } from "@/components/auto-slider-banner"
import { About } from "@/components/about" // Uncommented About import
import { Products } from "@/components/products"
import { Contact } from "@/components/contact"
import { Footer } from "@/components/footer"
import { BottomDecorImage } from "@/components/bottom-decor-image"
import { SearchOverlay } from "@/components/search-overlay"
import { mockProducts } from "@/lib/product-utils"
import { BrandAndQualitySection } from "@/components/brand-and-quality-section"

export default function HomePage() {
  const [showSearchOverlay, setShowSearchOverlay] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setShowSearchOverlay(false)
    const productsSection = document.getElementById("products-section")
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header onSearchClick={() => setShowSearchOverlay(true)} />
      <AutoSliderBanner />
      {searchQuery === "" && (
        <>
          <About /> {/* Uncommented About component */}
        </>
      )}
      <Products searchQuery={searchQuery} allProducts={mockProducts} />
      <Contact />
      {searchQuery === "" && ( // Only show if no search query
        <BrandAndQualitySection />
      )}
      <BottomDecorImage />
      <Footer />
      <SearchOverlay isOpen={showSearchOverlay} onClose={() => setShowSearchOverlay(false)} onSearch={handleSearch} />
    </div>
  )
}
