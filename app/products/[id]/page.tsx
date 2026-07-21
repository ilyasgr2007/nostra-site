"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import { createPortal } from "react-dom"
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
  ShoppingBag,
  MapPin,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useProducts } from "@/lib/use-products"
import { useWishlist } from "@/lib/use-wishlist"
import { useCart } from "@/lib/use-cart"
import { useSession, signIn } from "next-auth/react"
import { LocationPicker } from "@/components/location-picker"
import { SizeCalculator } from "@/components/size-calculator"
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
  const [newReview, setNewReview] = useState({ rating: 0, comment: "" })
  const [liveReviews, setLiveReviews] = useState<
    { id: number; author: string; rating: number; comment: string; created_at: string }[]
  >([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [showSizeCalculator, setShowSizeCalculator] = useState(false)
  const [showOrderDialog, setShowOrderDialog] = useState(false)
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })

  const { products: allProducts, loading: productsLoading } = useProducts()
  const { isWishlisted, toggleWishlist } = useWishlist()
  const { addItem } = useCart()
  const { data: session } = useSession()
  const [showMapPicker, setShowMapPicker] = useState(false)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  useEffect(() => {
    let cancelled = false
    setReviewsLoading(true)
    fetch(`/api/products/${id}/reviews`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setLiveReviews(data.reviews || [])
      })
      .catch((err) => console.error("Failed to load reviews:", err))
      .finally(() => {
        if (!cancelled) setReviewsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  // Récupération des paramètres URL
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

  // Couleur sélectionnée : priorité au paramètre URL, sinon la première couleur réelle du produit
  // (on évite un "noir" codé en dur qui ne correspondait pas toujours à la casse exacte des noms de couleur)
  const urlColor = searchParams.get("color") || productData?.colors[0]?.name || ""

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
    productData.variants[0]?.images ||
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

  const handleAddToCart = () => {
    if (!currentVariant || !urlSize) {
      toast({
        title: "Sélection incomplète",
        description: "Veuillez sélectionner une taille et une couleur valides.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }
    const colorLabel = productData.colors.find((c) => c.name === urlColor)?.label || urlColor
    addItem({
      productId: productData.id,
      name: productData.name,
      image: currentImages[0] || "/placeholder.svg",
      color: urlColor,
      colorLabel,
      size: urlSize,
      price: currentVariant.price,
      quantity,
      sku: currentVariant.sku,
      stock: currentVariant.stock,
    })
    toast({
      title: "Ajouté au panier",
      description: `${productData.name} (${colorLabel}, ${urlSize}) a été ajouté à votre panier.`,
      duration: 3000,
    })
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

  const sendWhatsAppOrder = async () => {
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

    if (!location) {
      toast({
        title: "Localisation requise",
        description: "Veuillez choisir votre position sur la carte pour confirmer la livraison.",
        variant: "destructive",
        duration: 3000,
      })
      setShowMapPicker(true)
      return
    }

    const colorLabel = productData.colors.find((c) => c.name === urlColor)?.label || urlColor

    let orderId = ""
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          customerAddress: address,
          customerLat: location.lat,
          customerLng: location.lng,
          items: [
            {
              name: productData.name,
              colorLabel,
              size: urlSize,
              quantity,
              price: currentVariant.price,
            },
          ],
          total: currentVariant.price * quantity,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        orderId = data.order.id
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Impossible de créer la commande.",
          variant: "destructive",
          duration: 4000,
        })
        return
      }
    } catch (err) {
      console.error("Failed to save order:", err)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement de la commande.",
        variant: "destructive",
        duration: 4000,
      })
      return
    }

    const phoneNumber = "212631809890" // Your business WhatsApp number
    const formattedPhoneNumber = phoneNumber.startsWith("0") ? `212${phoneNumber.substring(1)}` : phoneNumber

    const message = `
Bonjour, je souhaite passer une commande.
${orderId ? `\n*Numéro de commande: ${orderId}*` : ""}

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
    setLocation(null)
    toast({
      title: "Commande envoyée !",
      description: orderId
        ? `Commande ${orderId} envoyée via WhatsApp. Suivez-la sur la page "Suivre ma commande".`
        : "Votre commande a été envoyée via WhatsApp. Nous vous contacterons bientôt.",
      duration: 6000,
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

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter avec Google pour laisser un avis.",
        variant: "destructive",
        duration: 4000,
      })
      return
    }

    if (!newReview.comment || newReview.rating === 0) {
      toast({
        title: "Erreur de soumission",
        description: "Veuillez remplir le commentaire et donner une note.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    setSubmittingReview(true)
    try {
      const res = await fetch(`/api/products/${id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: newReview.rating, comment: newReview.comment }),
      })
      const data = await res.json()
      if (res.ok) {
        setLiveReviews((prev) => [data.review, ...prev])
        setNewReview({ rating: 0, comment: "" })
        toast({
          title: "Avis soumis !",
          description: "Votre avis a été envoyé avec succès.",
          duration: 3000,
        })
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Une erreur est survenue.",
          variant: "destructive",
          duration: 3000,
        })
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de votre avis.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setSubmittingReview(false)
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

      {showOrderDialog &&
        typeof window !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-neutral-950 rounded-lg shadow-2xl w-full max-w-[425px] max-h-[90vh] overflow-y-auto p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold dark:text-white">Confirmer votre commande</h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  Veuillez remplir vos coordonnées pour finaliser la commande via WhatsApp.
                </p>
              </div>
              <div className="grid gap-4 py-2">
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
                  <div className="col-span-3 space-y-1.5">
                    <Textarea
                      id="address"
                      value={customerDetails.address}
                      onChange={(e) => setCustomerDetails({ ...customerDetails, address: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowMapPicker(true)}
                      className={`flex items-center justify-center gap-1.5 text-sm rounded-md py-2 px-3 border w-full transition ${
                        location
                          ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30"
                          : "border-dashed border-neutral-400 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 hover:border-black dark:hover:border-white"
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      {location ? "Position confirmée · Modifier" : "Choisir ma position sur la carte (obligatoire)"}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowOrderDialog(false)}>
                  Annuler
                </Button>
                <Button onClick={sendWhatsAppOrder}>Envoyer la commande</Button>
              </div>
            </div>
          </div>,
          document.body,
        )}

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
              <div className="text-2xl font-bold dark:text-white">١١١</div>
              <div className="text-2xl font-bold tracking-wider dark:text-white">NOSTRA</div>
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
              title={isWishlisted(id) ? "Retirer des favoris" : "Ajouter aux favoris"}
              onClick={() => toggleWishlist(id)}
            >
              <Heart className={`w-5 h-5 ${isWishlisted(id) ? "fill-red-500 text-red-500" : ""}`} />
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
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
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
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`Vue ${index + 1}`}
                      fill
                      sizes="150px"
                      className="object-cover"
                    />
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
                  {[...Array(5)].map((_, i) => {
                    const avgRating =
                      liveReviews.length > 0
                        ? liveReviews.reduce((sum, r) => sum + r.rating, 0) / liveReviews.length
                        : 0
                    return (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.round(avgRating)
                            ? "fill-black text-black dark:fill-white dark:text-white"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    )
                  })}
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                    {liveReviews.length > 0
                      ? `(${liveReviews.length} avis)`
                      : reviewsLoading
                        ? "..."
                        : "(Aucun avis pour le moment)"}
                  </span>
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
                variant="outline"
                className="w-full border-black text-black hover:bg-gray-50 dark:border-white dark:text-white dark:hover:bg-neutral-900 bg-transparent"
                disabled={!currentVariant || currentVariant.stock === 0 || !urlSize || isLoading}
                onClick={handleAddToCart}
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                {!urlSize
                  ? "SÉLECTIONNEZ UNE TAILLE"
                  : !currentVariant || currentVariant.stock === 0
                    ? "RUPTURE DE STOCK"
                    : "AJOUTER AU PANIER"}
              </Button>
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
                  onClick={() => toggleWishlist(id)}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isWishlisted(id) ? "fill-red-500 text-red-500" : ""}`} />
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
          {reviewsLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : liveReviews.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 mb-12">
              Aucun avis pour le moment. Soyez le premier à donner votre avis !
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {liveReviews.map((review) => (
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
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(review.created_at).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Submit New Review Form */}
          <div className="max-w-2xl mx-auto bg-gray-50 dark:bg-gray-900 p-8 shadow-lg">
            <h3 className="text-2xl font-bold mb-6 text-center">Laisser un avis</h3>
            {!session?.user ? (
              <div className="text-center space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Connectez-vous avec Google pour laisser un avis sur ce produit.
                </p>
                <Button
                  onClick={() => signIn("google")}
                  className="bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200"
                >
                  Se connecter avec Google
                </Button>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Connecté en tant que <strong>{session.user.name}</strong>
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Votre note
                  </label>
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
                  disabled={submittingReview}
                  className="w-full bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200 h-12"
                >
                  {submittingReview ? "Envoi en cours..." : "Soumettre l'avis"}
                </Button>
              </form>
            )}
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
      <LocationPicker
        isOpen={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        onConfirm={({ address, lat, lng }) => {
          setCustomerDetails((prev) => ({ ...prev, address }))
          setLocation({ lat, lng })
        }}
      />
    </div>
  )
}
