"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { AutoSliderBanner } from "@/components/auto-slider-banner"
import { About } from "@/components/about"
import { Contact } from "@/components/contact"
import { Footer } from "@/components/footer"
import { BottomDecorImage } from "@/components/bottom-decor-image"
import { SearchOverlay } from "@/components/search-overlay"
import { BrandAndQualitySection } from "@/components/brand-and-quality-section"

export default function HomePage() {
  const [showSearchOverlay, setShowSearchOverlay] = useState(false)

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      <Header onSearchClick={() => setShowSearchOverlay(true)} />
      <AutoSliderBanner />
      <About />
      <Contact />
      <BrandAndQualitySection />
      <BottomDecorImage />
      <Footer />
      <SearchOverlay isOpen={showSearchOverlay} onClose={() => setShowSearchOverlay(false)} />
    </div>
  )
}
