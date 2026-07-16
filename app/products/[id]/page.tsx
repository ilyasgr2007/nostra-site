"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Truck,
  RotateCcw,
  Shield,
  Star,
  Check,
  X,
  MessageCircle,
  Ruler,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useProducts } from "@/lib/use-products"
import { SizeCalculator } from "@/components/size-calculator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

// Types pour les variantes
interface ProductVariant {
  id: string
  color: string
  size: string
  price: number
  stock: number
  sku: string
  images: string[]
}

interface ProductReview {
  id: number
  author: string
  rating: number
  date: string
  comment: string
}

interface ProductData {
  id: string
  name: string
  description: string
  basePrice: number
  variants: ProductVariant[]
  colors: { name: string; hex: string; label: string }[]
  sizes: string[]
  reviews: ProductReview[]
}

// ↓ passthrough now that real product images (Vercel Blob URLs) must be shown as-is
function safeSrc(src: string, w = 800, h = 800) {
  return src
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [newReview, setNewReview] = useState({ author: "", rating: 0, comment: "" })
  const [showSizeCalculator, setShowSizeCalculator] = useState(false)
  const [showOrderDialog, setShowOrderDialog] = useState(false)
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })

  const { products: allProducts, loading: productsLoading } = useProducts()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  // Récupération des paramètres URL
  const urlColor = searchParams.get("color") || "noir"
  const urlSize = searchParams.get("size") || ""

  // Récupération des données produit basées sur l'ID
  const getProductData = (productId: string): ProductData | null => {
    const product = allProducts.find((p) => p.id === productId)

    if (!product) {
      return null
    }

    const variants: ProductVariant[] = product.variants.map((variant) => ({
      id: variant.sku,
      color: product.colors.find((c) => c.hex === variant.color)?.name || "noir",
      size: variant.size,
      price: variant.price,
      stock: variant.availability === "in_stock" ? Math.floor(Math.random() * 15) + 1 : 0,
      sku: variant.sku,
      images: product.colorImages?.[variant.color] || product.images,
    }))

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      basePrice: Number.parseFloat(product.price),
      variants,
      colors: product.colors,
      sizes: product.sizes,
      reviews: product.reviews,
    }
  }

  const productData = getProductData(id)

  if (productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="w-8 h-8 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!productData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black">
        <h1 className="text-4xl font-bold mb-4">Produit non trouvé</h1>
        <p className="text-gray-600 mb-8">Le produit que vous recherchez n'existe pas.</p>
        <Link href="/" className="bg-black text-white px-6 py-3 hover:bg-gray-800">
          Retour à l'accueil
        </Link>
      </div>
    )
  }

  const currentVariant = productData.variants.find((v) => v.color === urlColor && v.size === urlSize)

  const currentImages = (
    currentVariant?.images ||
    productData.variants.filter((v) => v.color === urlColor)[0]?.images ||
    productData.variants.filter((v) => v.color === "noir")[0]?.images ||
    []
  ).map((src) => safeSrc(src))

  const updateURL = (color: string, size: string) => {
    setIsLoading(true)
    const urlParams = new URLSearchParams()
    if (color) urlParams.set("color", color)
    if (size) urlParams.set("size", size)
    const newUrl = `/products/${id}?${urlParams.toString()}`
    router.push(newUrl, { scroll: false })
    setSelectedImage(0)
    setTimeout(() => setIsLoading(false), 500)
  }

  const handleColorChange = (color: string) => {
    updateURL(color, urlSize)
  }

  const handleSizeChange = (size: string) => {
    updateURL(urlColor, size)
  }

  const getSizeAvailability = (size: string) => {
    const variant = productData.variants.find((v) => v.color === urlColor && v.size === size)
    return {
      available: !!variant && variant.stock > 0,
      stock: variant?.stock || 0,
    }
  }

  const getColorAvailability = (color: string) => {
    const colorVariants = productData.variants.filter((v) => v.color === color)
    return colorVariants.some((v) => v.stock > 0)
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/products/${id}?color=${urlColor}&size=${urlSize}`
    const shareData = {
      title: `${productData.name} - ${productData.colors.find((c) => c.name === urlColor)?.label} ${urlSize}`,
      text: `Découvrez cette ${productData.name.toLowerCase()} sur NOSTRA`,
      url: shareUrl,
    }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        navigator.clipboard.writeText(shareUrl)
        toast({
          title: "Lien copié !",
          description: "Le lien du produit a été copié dans votre presse-papier.",
          duration: 2000,
        })
      }
    } else {
      navigator.clipboard.writeText(shareUrl)
      toast({
        title: "Lien copié !",
        description: "Le lien du produit a été copié dans votre presse-papier.",
        duration: 2000,
      })
    }
  }

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % currentImages.length)
  }
  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + currentImages.length) % currentImages.length)
  }

  const handleOrderViaWhatsApp = () => {
    if (!currentVariant) {
      toast({
        title: "Sélection incomplète",
        description: "Veuillez sélectionner une taille et une couleur valides.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }
    setShowOrderDialog(true) // Open the dialog
  }

  const sendWhatsAppOrder = () => {
    if (!currentVariant) return // Should not happen if dialog is opened correctly

    const { name, email, phone, address } = customerDetails
    if (!name || !email || !phone || !address) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs pour passer la commande.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    const phoneNumber = "212631809890" // Your business WhatsApp number
    const formattedPhoneNumber = phoneNumber.startsWith("0") ? `212${phoneNumber.substring(1)}` : phoneNumber
    const colorLabel = productData.colors.find((c) => c.name === urlColor)?.label || urlColor

    const message = `
Bonjour, je souhaite passer une commande.

*Détails du client:*
Nom: ${name}
Email: ${email}
Téléphone: ${phone}
Adresse: ${address}

*Détails du produit:*
Produit: ${productData.name}
Couleur: ${colorLabel}
Taille: ${urlSize}
Référence: ${currentVariant.sku}
Quantité: ${quantity}
Prix unitaire: ${currentVariant.price} DH
Prix total: ${currentVariant.price * quantity} DH

Merci!
  `.trim()

    const whatsappLink = `https://wa.me/${formattedPhoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappLink, "_blank")
    setShowOrderDialog(false) // Close the dialog after sending
    setCustomerDetails({ name: "", email: "", phone: "", address: "" }) // Clear form
    toast({
      title: "Commande envoyée !",
      description: "Votre commande a été envoyée via WhatsApp. Nous vous contacterons bientôt.",
      duration: 5000,
    })
  }

  const relatedProducts = [
    {
      id: "t-shirt-signature",
      name: "T-SHIRT SIGNATURE",
      price: "450",
      image: "/placeholder.svg?height=400&width=300&text=T-shirt",
    },
    {
      id: "pantalon-droit",
      name: "PANTALON DROIT",
      price: "1290",
      image: "/placeholder.svg?height=400&width=300&text=Pantalon",
    },
    {
      id: "veste-minimale",
      name: "VESTE MINIMALE",
      price: "1890",
      image: "/placeholder.svg?height=400&width=300&text=Veste",
    },
  ]

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newReview.author && newReview.comment && newReview.rating > 0) {
      const newId = productData.reviews.length > 0 ? Math.max(...productData.reviews.map((r) => r.id)) + 1 : 1
      const date = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
      const submittedReview = { ...newReview, id: newId, date }
      console.log("New review submitted:", submittedReview)
      toast({
        title: "Avis soumis !",
        description: "Votre avis a été envoyé avec succès.",
        duration: 3000,
      })
      setNewReview({ author: "", rating: 0, comment: "" })
    } else {
      toast({
        title: "Erreur de soumission",
        description: "Veuillez remplir tous les champs et donner une note.",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-300 relative">
      {/* Global Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/90 dark:bg-black/90 backdrop-blur-sm flex items-center justify-center z-[9999] transition-all duration-300">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-white"></div>
            <div className="text-2xl font-bold text-black dark:text-white">١١١</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Chargement...</p>
          </div>
        </div>
      )}

      {/* AI Assistant */}
      <SizeCalculator isOpen={showSizeCalculator} onClose={() => setShowSizeCalculator(false)} />
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer votre commande</DialogTitle>
            <DialogDescription>
              Veuillez remplir vos coordonnées pour finaliser la commande via WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nom
              </Label>
              <Input
                id="name"
                value={customerDetails.name}
                onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={customerDetails.email}
                onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Téléphone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={customerDetails.phone}
                onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Adresse
              </Label>
              <Textarea
                id="address"
                value={customerDetails.address}
                onChange={(e) => setCustomerDetails({ ...customerDetails, address: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOrderDialog(false)}>
              Annuler
            </Button>
            <Button onClick={sendWhatsAppOrder}>Envoyer la commande</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <header className="border-b border-black dark:border-white relative z-50 bg-white/90 dark:bg-black/90 backdrop-blur-md sticky top-0">
        <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="hover:bg-gray-100 dark:hover:bg-gray-900"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Link href="/" className="flex items-center space-x-4">
              <div className="text-2xl font-bold">١١١</div>
              <div className="text-2xl font-light tracking-wider">NOSTRA</div>
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="hover:underline">
              ACCUEIL
            </Link>
            <Link href="/collection" className="hover:underline">
              COLLECTION
            </Link>
          </nav>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="hover:bg-gray-100 dark:hover:bg-gray-900"
              title="Partager"
            >
              <Share2 className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-100 dark:hover:bg-gray-900"
              title="Ajouter aux favoris"
            >
              <Heart className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* AI Assistant Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setShowSizeCalculator(true)}
          className="bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300"
          size="icon"
        >
          <Ruler className="h-6 w-6" />
        </Button>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb avec variante */}
        <nav className="mb-8 text-sm text-gray-600 dark:text-gray-400">
          <Link href="/" className="hover:underline">
            Accueil
          </Link>
          <span className="mx-2">/</span>
          <Link href="#" className="hover:underline">
            Homme
          </Link>
          <span className="mx-2">/</span>
          <span>{productData.name}</span>
          {urlColor && urlSize && (
            <>
              <span className="mx-2">/</span>
              <span className="capitalize">
                {productData.colors.find((c) => c.name === urlColor)?.label} {urlSize}
              </span>
            </>
          )}
        </nav>
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4 relative">
            {/* Main Image */}
            <div className="relative aspect-[3/4] bg-gray-50 dark:bg-black">
              {currentImages.length > 0 && (
                <Image
                  src={currentImages[selectedImage] || "/placeholder.svg"}
                  alt={`${productData.name} - ${productData.colors.find((c) => c.name === urlColor)?.label} ${urlSize}`}
                  fill
                  className="object-cover transition-opacity duration-300"
                />
              )}
              {/* Navigation Arrows */}
              {currentImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-colors dark:bg-black/80 dark:hover:bg-gray-900"
                  >
                    <ChevronLeft className="w-5 h-5 text-black dark:text-white" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-colors dark:bg-black/80 dark:hover:bg-gray-900"
                  >
                    <ChevronRight className="w-5 h-5 text-black dark:text-white" />
                  </button>
                </>
              )}
              {/* Image Counter */}
              {currentImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  {selectedImage + 1} / {currentImages.length}
                </div>
              )}
              {/* Stock Badge */}
              {currentVariant && (
                <div className="absolute top-4 right-4">
                  {currentVariant.stock === 0 ? (
                    <Badge variant="destructive">Rupture de stock</Badge>
                  ) : currentVariant.stock <= 3 ? (
                    <Badge
                      variant="outline"
                      className="bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-600"
                    >
                      Plus que {currentVariant.stock} en stock
                    </Badge>
                  ) : null}
                </div>
              )}
            </div>
            {/* Thumbnail Gallery */}
            {currentImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {currentImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square border-2 transition-colors ${
                      selectedImage === index
                        ? "border-black dark:border-white"
                        : "border-gray-200 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-500"
                    }`}
                  >
                    <Image src={image || "/placeholder.svg"} alt={`Vue ${index + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <Badge variant="outline" className="mb-2 dark:border-gray-700 dark:text-gray-300">
                NOUVELLE COLLECTION
              </Badge>
              <h1 className="text-3xl font-light tracking-wider mb-2">{productData.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-2xl font-light">{currentVariant?.price || productData.basePrice} DH</span>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-black dark:fill-white" />
                  ))}
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">(24 avis)</span>
                </div>
              </div>
              {/* SKU et disponibilité */}
              {currentVariant && (
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>Référence: {currentVariant.sku}</p>
                  <p className="flex items-center space-x-2">
                    {currentVariant.stock > 0 ? (
                      <>
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-green-600">
                          En stock ({currentVariant.stock} disponible{currentVariant.stock > 1 ? "s" : ""})
                        </span>
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4 text-red-600" />
                        <span className="text-red-600">Rupture de stock</span>
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>
            <Separator className="bg-gray-200 dark:bg-gray-700" />
            <div>
              <h3 className="text-lg font-medium mb-3">Description</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{productData.description}</p>
            </div>

            {/* Size Calculator Help Button */}
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center">
                    <Ruler className="h-5 w-5 text-white dark:text-black" />
                  </div>
                  <div>
                    <h4 className="font-medium">Besoin d'aide ?</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Utilisez notre calculateur pour trouver votre taille
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowSizeCalculator(true)}
                  className="border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                >
                  Calculer ma taille
                </Button>
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="text-lg font-medium mb-3">
                Couleur: {productData.colors.find((c) => c.name === urlColor)?.label}
              </h3>
              <div className="flex space-x-3">
                {productData.colors.map((color) => {
                  const isAvailable = getColorAvailability(color.name)
                  const isSelected = urlColor === color.name
                  return (
                    <button
                      key={color.name}
                      onClick={() => isAvailable && handleColorChange(color.name)}
                      disabled={!isAvailable || isLoading}
                      className={`relative w-12 h-12 rounded-full border-2 transition-all ${
                        isSelected ? "border-black dark:border-white scale-110" : "border-gray-300 dark:border-gray-600"
                      } ${!isAvailable || isLoading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
                      style={{ backgroundColor: color.hex }}
                      title={`${color.label}${!isAvailable ? " - Non disponible" : ""}`}
                    >
                      {color.name === "blanc" && (
                        <div className="w-full h-full rounded-full border border-gray-200 dark:border-gray-700"></div>
                      )}
                      {!isAvailable && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-black rounded-full flex items-center justify-center dark:bg-white">
                          <Check className="w-2 h-2 text-white dark:text-black" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
            {/* Size Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium">Taille</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSizeCalculator(true)}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                >
                  <Ruler className="h-4 w-4 mr-1" />
                  Calculateur
                </Button>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {productData.sizes.map((size) => {
                  const sizeInfo = getSizeAvailability(size)
                  const isSelected = urlSize === size
                  return (
                    <button
                      key={size}
                      onClick={() => sizeInfo.available && !isLoading && handleSizeChange(size)}
                      disabled={!sizeInfo.available || isLoading}
                      className={`py-2 border transition-all relative ${
                        isSelected
                          ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                          : sizeInfo.available && !isLoading
                            ? "border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500"
                            : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed dark:border-gray-700 dark:bg-gray-900 dark:text-gray-500"
                      }`}
                    >
                      {size}
                      {!sizeInfo.available && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-px bg-gray-400 dark:bg-gray-500 rotate-45"></div>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
              <Link href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:underline mt-2 inline-block">
                Guide des tailles
              </Link>
            </div>
            {/* Quantity */}
            <div>
              <h3 className="text-lg font-medium mb-3">Quantité</h3>
              <div className="flex items-center space-x-4">
                <div className="flex border border-gray-300 dark:border-gray-600">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                    disabled={isLoading}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300 dark:border-gray-600">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(currentVariant?.stock || 1, quantity + 1))}
                    className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                    disabled={!currentVariant || quantity >= currentVariant.stock || isLoading}
                  >
                    +
                  </button>
                </div>
                {currentVariant && quantity >= currentVariant.stock && (
                  <span className="text-sm text-orange-600 dark:text-orange-400">Stock maximum atteint</span>
                )}
              </div>
            </div>
            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                disabled={!currentVariant || currentVariant.stock === 0 || !urlSize || isLoading}
                onClick={handleOrderViaWhatsApp}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                {!urlSize
                  ? "SÉLECTIONNEZ UNE TAILLE"
                  : !currentVariant || currentVariant.stock === 0
                    ? "RUPTURE DE STOCK"
                    : "COMMANDER VIA WHATSAPP"}
              </Button>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 bg-transparent border-gray-300 text-black hover:bg-gray-50 dark:border-gray-700 dark:text-white dark:hover:bg-gray-900"
                  disabled={isLoading}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  FAVORIS
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 bg-transparent border-gray-300 text-black hover:bg-gray-50 dark:border-gray-700 dark:text-white dark:hover:bg-gray-900"
                  onClick={handleShare}
                  disabled={isLoading}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  PARTAGER
                </Button>
              </div>
            </div>
            <Separator className="bg-gray-200 dark:bg-gray-700" />
            {/* Product Features */}
            <div className="space-y-4 text-black dark:text-white">
              <div className="flex items-center space-x-3">
                <Truck className="w-5 h-5" />
                <span className="text-sm">Livraison gratuite dès 100€</span>
              </div>
              <div className="flex items-center space-x-3">
                <RotateCcw className="w-5 h-5" />
                <span className="text-sm">Retours gratuits sous 30 jours</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5" />
                <span className="text-sm">Garantie qualité 2 ans</span>
              </div>
            </div>
            {/* Product Details */}
            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <strong>Composition:</strong> 100% Coton biologique
              </div>
              <div>
                <strong>Entretien:</strong> Lavage machine 30°C, séchage à plat
              </div>
              <div>
                <strong>Origine:</strong> Confectionné en France
              </div>
              {currentVariant && (
                <div>
                  <strong>Référence:</strong> {currentVariant.sku}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="mt-20 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light tracking-wider mb-4">AVIS CLIENTS</h2>
            <div className="w-20 h-px bg-black dark:bg-white mx-auto"></div>
          </div>

          {/* Existing Reviews */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {productData.reviews.map((review) => (
              <Card key={review.id} className="bg-gray-50 dark:bg-gray-900 border-none shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? "fill-black text-black dark:fill-white dark:text-white"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{review.comment}</p>
                  <p className="text-sm font-semibold text-black dark:text-white">{review.author}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{review.date}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Submit New Review Form */}
          <div className="max-w-2xl mx-auto bg-gray-50 dark:bg-gray-900 p-8 shadow-lg">
            <h3 className="text-2xl font-bold mb-6 text-center">Laisser un avis</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="review-author"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Votre nom
                </label>
                <Input
                  id="review-author"
                  type="text"
                  value={newReview.author}
                  onChange={(e) => setNewReview({ ...newReview, author: e.target.value })}
                  placeholder="Votre nom"
                  className="h-12 border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Votre note</label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-8 h-8 cursor-pointer ${
                        star <= newReview.rating
                          ? "fill-black text-black dark:fill-white dark:text-white"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label
                  htmlFor="review-comment"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Votre commentaire
                </label>
                <Textarea
                  id="review-comment"
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder="Écrivez votre commentaire ici..."
                  className="min-h-[120px] border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200 h-12"
              >
                Soumettre l'avis
              </Button>
            </form>
          </div>
        </section>

        {/* Related Products */}
        <section className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light tracking-wider mb-4">VOUS AIMEREZ AUSSI</h2>
            <div className="w-20 h-px bg-black dark:bg-white mx-auto"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {relatedProducts.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <Card className="border-0 shadow-none group cursor-pointer bg-transparent dark:bg-transparent">
                  <CardContent className="p-0">
                    <div className="relative aspect-[3/4] mb-4 overflow-hidden">
                      <Image
                        src={safeSrc(product.image) || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        unoptimized // prevent Next-Lite from proxying the image
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-medium mb-2">{product.name}</h3>
                      <p className="text-xl font-light">{product.price} DH</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
