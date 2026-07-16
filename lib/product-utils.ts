// lib/product-utils.ts

export interface ProductColor {
  name: string
  hex: string
  label: string
}

export interface ProductVariant {
  color: string // Hex code of the color
  size: string
  sku: string
  price: number
  availability: "in_stock" | "out_of_stock" | "preorder"
}

export interface ProductData {
  id: string
  name: string
  price: string // Base price as string for display
  images: string[]
  colorImages?: { [key: string]: string[] } // Optional: images specific to a color
  description: string
  shortDescription: string // Added for the new layout
  category: string
  sizes: string[]
  colors: ProductColor[]
  composition: string
  care: string
  origin: string
  reviews: {
    id: number
    author: string
    rating: number
    date: string
    comment: string
  }[]
  relatedProducts: string[]
  variants: ProductVariant[] // Detailed variants with price, SKU, availability
  symbolism?: string // Added for the new layout
}

/**
 * Génère les métadonnées SEO pour une variante de produit spécifique.
 * @param product Le produit de base.
 * @param selectedColorHex Le code hexadécimal de la couleur sélectionnée.
 * @param selectedSize La taille sélectionnée.
 * @returns Les métadonnées de la variante.
 */
export function getVariantMetadata(
  product: ProductData,
  selectedColorHex?: string,
  selectedSize?: string,
): {
  title: string
  description: string
  price: number
  availability: "in_stock" | "out_of_stock" | "preorder"
  sku?: string
} {
  let title = product.name
  let description = product.description
  let price = Number.parseFloat(product.price) // Use base price from product data
  let availability: "in_stock" | "out_of_stock" | "preorder" = "out_of_stock" // Default to out of stock
  let sku: string | undefined

  const selectedColor = product.colors.find((c) => c.hex === selectedColorHex)

  // Trouver la variante correspondante
  const matchingVariant = product.variants.find(
    (v) => (!selectedColorHex || v.color === selectedColorHex) && (!selectedSize || v.size === selectedSize),
  )

  if (matchingVariant) {
    price = matchingVariant.price
    availability = matchingVariant.availability
    sku = matchingVariant.sku

    // Mettre à jour le titre et la description avec les détails de la variante
    if (selectedColor) {
      title = `${product.name} - ${selectedColor.label}`
      description = `${product.description} Couleur: ${selectedColor.label}.`
    }
    if (selectedSize) {
      title = `${title} Taille: ${selectedSize}`
      description = `${description} Taille: ${selectedSize}.`
    }
  } else {
    // Fallback si aucune combinaison spécifique n'est trouvée
    availability = "out_of_stock" // Si la combinaison n'existe pas, elle est hors stock
    sku = undefined
  }

  return {
    title,
    description,
    price,
    availability,
    sku,
  }
}

// Define a common T-shirt image to be used across products
const commonTshirtImage = "/placeholder.svg?height=800&width=800"

// Données de produits simulées centralisées
export const mockProducts: ProductData[] = [
  {
    id: "1",
    name: "T-Shirt Essential",
    price: "450",
    images: [
      commonTshirtImage, // Added common T-shirt image
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&h=800&fit=crop",
    ],
    colorImages: {
      "#000000": [
        commonTshirtImage, // Added common T-shirt image for black variant
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&h=800&fit=crop",
      ],
      "#FFFFFF": [
        commonTshirtImage, // Added common T-shirt image for white variant
        "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=800&fit=crop",
      ],
      "#808080": [
        commonTshirtImage, // Added common T-shirt image for grey variant
        "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=800&fit=crop",
      ],
    },
    description:
      "Notre T-Shirt Essential est conçu pour le confort et le style minimaliste. Fabriqué à partir de coton biologique doux, il est parfait pour un usage quotidien. Sa coupe intemporelle et sa texture agréable en font un indispensable de votre garde-robe.",
    shortDescription: "Un basique intemporel, conçu pour le confort et la durabilité.",
    category: "Basics",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Noir", hex: "#000000", label: "Noir" },
      { name: "Blanc", hex: "#FFFFFF", label: "Blanc" },
      { name: "Gris", hex: "#808080", label: "Gris" },
    ],
    composition: "100% Coton Biologique certifié GOTS",
    care: "Lavage en machine à 30°C, ne pas blanchir, sécher à plat, repassage doux.",
    origin: "Fabriqué au Portugal",
    reviews: [
      {
        id: 1,
        author: "Marie D.",
        rating: 5,
        date: "12/07/2024",
        comment: "Très confortable et la coupe est parfaite. Un basique à avoir !",
      },
      {
        id: 2,
        author: "Jean L.",
        rating: 4,
        date: "01/07/2024",
        comment: "Bonne qualité, mais un peu cher. Je recommande quand même.",
      },
    ],
    relatedProducts: ["2", "3", "4"],
    variants: [
      { color: "#000000", size: "XS", sku: "TSHIRT-ESS-BLK-XS", price: 450, availability: "in_stock" },
      { color: "#000000", size: "S", sku: "TSHIRT-ESS-BLK-S", price: 450, availability: "in_stock" },
      { color: "#000000", size: "M", sku: "TSHIRT-ESS-BLK-M", price: 450, availability: "in_stock" },
      { color: "#000000", size: "L", sku: "TSHIRT-ESS-BLK-L", price: 450, availability: "in_stock" },
      { color: "#000000", size: "XL", sku: "TSHIRT-ESS-BLK-XL", price: 450, availability: "in_stock" },
      { color: "#000000", size: "XXL", sku: "TSHIRT-ESS-BLK-XXL", price: 500, availability: "in_stock" },
      { color: "#FFFFFF", size: "XS", sku: "TSHIRT-ESS-WHT-XS", price: 450, availability: "in_stock" },
      { color: "#FFFFFF", size: "S", sku: "TSHIRT-ESS-WHT-S", price: 450, availability: "in_stock" },
      { color: "#FFFFFF", size: "M", sku: "TSHIRT-ESS-WHT-M", price: 450, availability: "in_stock" },
      { color: "#FFFFFF", size: "L", sku: "TSHIRT-ESS-WHT-L", price: 450, availability: "in_stock" },
      { color: "#FFFFFF", size: "XL", sku: "TSHIRT-ESS-WHT-XL", price: 450, availability: "in_stock" },
      { color: "#FFFFFF", size: "XXL", sku: "TSHIRT-ESS-WHT-XXL", price: 500, availability: "in_stock" },
      { color: "#808080", size: "S", sku: "TSHIRT-ESS-GRY-S", price: 450, availability: "in_stock" },
      { color: "#808080", size: "M", sku: "TSHIRT-ESS-GRY-M", price: 450, availability: "in_stock" },
      { color: "#808080", size: "L", sku: "TSHIRT-ESS-GRY-L", price: 450, availability: "in_stock" },
    ],
    symbolism:
      "Le chiffre 111 symbolise l'alignement parfait : entre forme et fonction, entre tradition et modernité, entre l'individu et son style. C'est notre signature, notre promesse d'authenticité.",
  },
  {
    id: "2",
    name: "Hoodie Minimal",
    price: "850",
    images: [
      commonTshirtImage, // Added common T-shirt image
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&h=800&fit=crop",
    ],
    description:
      "Le Hoodie Minimal offre une chaleur et un confort inégalés. Son design épuré et sa coupe oversize en font un incontournable de votre garde-robe. Idéal pour les journées fraîches ou pour un look décontracté et stylé.",
    shortDescription: "Confort et style épuré pour toutes les saisons.",
    category: "Sweatwear",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Noir", hex: "#000000", label: "Noir" },
      { name: "Gris Chiné", hex: "#A0A0A0", label: "Gris Chiné" },
      { name: "Bleu Marine", hex: "#000080", label: "Bleu Marine" },
    ],
    composition: "80% Coton, 20% Polyester recyclé",
    care: "Lavage en machine à 30°C, ne pas sécher en machine.",
    origin: "Fabriqué en France",
    reviews: [
      { id: 3, author: "Sophie M.", rating: 5, date: "05/07/2024", comment: "Mon hoodie préféré ! Doux et stylé." },
    ],
    relatedProducts: ["1", "3", "5"],
    variants: [
      { color: "#000000", size: "S", sku: "HOODIE-MIN-BLK-S", price: 850, availability: "in_stock" },
      { color: "#000000", size: "M", sku: "HOODIE-MIN-BLK-M", price: 850, availability: "in_stock" },
      { color: "#000000", size: "L", sku: "HOODIE-MIN-BLK-L", price: 850, availability: "in_stock" },
      { color: "#000000", size: "XL", sku: "HOODIE-MIN-BLK-XL", price: 850, availability: "in_stock" },
      { color: "#A0A0A0", size: "S", sku: "HOODIE-MIN-GRY-S", price: 850, availability: "in_stock" },
      { color: "#A0A0A0", size: "M", sku: "HOODIE-MIN-GRY-M", price: 850, availability: "in_stock" },
      { color: "#000080", size: "L", sku: "HOODIE-MIN-BLU-L", price: 850, availability: "in_stock" },
    ],
    symbolism:
      "Le chiffre 111 symbolise l'alignement parfait : entre forme et fonction, entre tradition et modernité, entre l'individu et son style. C'est notre signature, notre promesse d'authenticité.",
  },
  {
    id: "3",
    name: "Pantalon Droit",
    price: "750",
    images: [
      commonTshirtImage, // Added common T-shirt image
      "https://images.unsplash.com/photo-1585336129630-ef589921c89a?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1618767754343-f979691f754e?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1543508282-86b24e62aa9d?w=800&h=800&fit=crop",
    ],
    description:
      "Ce pantalon à coupe droite allie élégance et décontraction. Idéal pour un look moderne et confortable en toute occasion. Sa matière fluide et sa finition impeccable vous garantissent un style irréprochable.",
    shortDescription: "Élégance et confort pour un look moderne.",
    category: "Bottoms",
    sizes: ["28", "30", "32", "34", "36"],
    colors: [
      { name: "Noir", hex: "#000000", label: "Noir" },
      { name: "Beige", hex: "#F5F5DC", label: "Beige" },
      { name: "Kaki", hex: "#73734C", label: "Kaki" },
    ],
    composition: "98% Coton, 2% Élasthanne",
    care: "Lavage en machine à 40°C, repassage à fer moyen.",
    origin: "Fabriqué en Italie",
    reviews: [],
    relatedProducts: ["1", "2", "4"],
    variants: [
      { color: "#000000", size: "30", sku: "PANT-DRT-BLK-30", price: 750, availability: "in_stock" },
      { color: "#000000", size: "32", sku: "PANT-DRT-BLK-32", price: 750, availability: "in_stock" },
      { color: "#F5F5DC", size: "30", sku: "PANT-DRT-BEI-30", price: 750, availability: "in_stock" },
      { color: "#000000", size: "28", sku: "PANT-DRT-BLK-28", price: 750, availability: "in_stock" },
      { color: "#000000", size: "34", sku: "PANT-DRT-BLK-34", price: 750, availability: "in_stock" },
      { color: "#000000", size: "36", sku: "PANT-DRT-BLK-36", price: 750, availability: "in_stock" },
      { color: "#F5F5DC", size: "28", sku: "PANT-DRT-BEI-28", price: 750, availability: "in_stock" },
      { color: "#F5F5DC", size: "32", sku: "PANT-DRT-BEI-32", price: 750, availability: "in_stock" },
      { color: "#F5F5DC", size: "34", sku: "PANT-DRT-BEI-34", price: 750, availability: "in_stock" },
      { color: "#F5F5DC", size: "36", sku: "PANT-DRT-BEI-36", price: 750, availability: "in_stock" },
      { color: "#73734C", size: "28", sku: "PANT-DRT-KAK-28", price: 750, availability: "in_stock" },
      { color: "#73734C", size: "30", sku: "PANT-DRT-KAK-30", price: 750, availability: "in_stock" },
      { color: "#73734C", size: "32", sku: "PANT-DRT-KAK-32", price: 750, availability: "in_stock" },
      { color: "#73734C", size: "34", sku: "PANT-DRT-KAK-34", price: 750, availability: "in_stock" },
      { color: "#73734C", size: "36", sku: "PANT-DRT-KAK-36", price: 750, availability: "in_stock" },
    ],
    symbolism:
      "Le chiffre 111 symbolise l'alignement parfait : entre forme et fonction, entre tradition et modernité, entre l'individu et son style. C'est notre signature, notre promesse d'authenticité.",
  },
  {
    id: "4",
    name: "Veste Structure",
    price: "1200",
    images: [
      commonTshirtImage, // Added common T-shirt image
      "https://images.unsplash.com/photo-1612225453534-d4610f0e4cb1?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1583470771444-22389014a9da?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1585336129630-ef589921c89a?w=800&h=800&fit=crop",
    ],
    description:
      "La Veste Structure est une pièce maîtresse pour un style affirmé. Sa coupe structurée et son tissu de qualité supérieure en font un choix audacieux pour compléter vos tenues.",
    shortDescription: "Une pièce forte pour un style affirmé et moderne.",
    category: "Outerwear",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Noir", hex: "#000000", label: "Noir" },
      { name: "Anthracite", hex: "#36454F", label: "Anthracite" },
    ],
    composition: "70% Laine, 30% Polyester",
    care: "Nettoyage à sec recommandé.",
    origin: "Fabriqué en Roumanie",
    reviews: [],
    relatedProducts: ["1", "2", "3"],
    variants: [
      { color: "#000000", size: "M", sku: "VESTE-STR-BLK-M", price: 1200, availability: "in_stock" },
      { color: "#36454F", size: "L", sku: "VESTE-STR-ANT-L", price: 1200, availability: "in_stock" },
      { color: "#000000", size: "S", sku: "VESTE-STR-BLK-S", price: 1200, availability: "in_stock" },
      { color: "#000000", size: "L", sku: "VESTE-STR-BLK-L", price: 1200, availability: "in_stock" },
      { color: "#000000", size: "XL", sku: "VESTE-STR-BLK-XL", price: 1200, availability: "in_stock" },
      { color: "#36454F", size: "S", sku: "VESTE-STR-ANT-S", price: 1200, availability: "in_stock" },
      { color: "#36454F", size: "M", sku: "VESTE-STR-ANT-M", price: 1200, availability: "in_stock" },
      { color: "#36454F", size: "XL", sku: "VESTE-STR-ANT-XL", price: 1200, availability: "in_stock" },
    ],
    symbolism:
      "Le chiffre 111 symbolise l'alignement parfait : entre forme et fonction, entre tradition et modernité, entre l'individu et son style. C'est notre signature, notre promesse d'authenticité.",
  },
  {
    id: "5",
    name: "Chemise Pure",
    price: "950",
    images: [
      commonTshirtImage, // Added common T-shirt image
      "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1585336129630-ef589921c89a?w=800&h=800&fit=crop",
    ],
    description:
      "La Chemise Pure est un classique intemporel. Son tissu léger et sa coupe impeccable garantissent une élégance discrète pour toutes les occasions, du bureau aux sorties décontractées.",
    shortDescription: "Un classique intemporel, élégance discrète assurée.",
    category: "Shirts",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Blanc", hex: "#FFFFFF", label: "Blanc" },
      { name: "Bleu Ciel", hex: "#87CEEB", label: "Bleu Ciel" },
    ],
    composition: "100% Lin",
    care: "Lavage en machine à 30°C, séchage à l'air libre.",
    origin: "Fabriqué en Lituanie",
    reviews: [],
    relatedProducts: ["1", "2", "6"],
    variants: [
      { color: "#FFFFFF", size: "M", sku: "CHEM-PURE-WHT-M", price: 950, availability: "in_stock" },
      { color: "#87CEEB", size: "L", sku: "CHEM-PURE-BLU-L", price: 950, availability: "in_stock" },
      { color: "#FFFFFF", size: "S", sku: "CHEM-PURE-WHT-S", price: 950, availability: "in_stock" },
      { color: "#FFFFFF", size: "L", sku: "CHEM-PURE-WHT-L", price: 950, availability: "in_stock" },
      { color: "#FFFFFF", size: "XL", sku: "CHEM-PURE-WHT-XL", price: 950, availability: "in_stock" },
      { color: "#87CEEB", size: "S", sku: "CHEM-PURE-BLU-S", price: 950, availability: "in_stock" },
      { color: "#87CEEB", size: "M", sku: "CHEM-PURE-BLU-M", price: 950, availability: "in_stock" },
      { color: "#87CEEB", size: "XL", sku: "CHEM-PURE-BLU-XL", price: 950, availability: "in_stock" },
    ],
    symbolism:
      "Le chiffre 111 symbolise l'alignement parfait : entre forme et fonction, entre tradition et modernité, entre l'individu et son style. C'est notre signature, notre promesse d'authenticité.",
  },
  {
    id: "6",
    name: "Accessoire ١١١",
    price: "350",
    images: [
      commonTshirtImage, // Added common T-shirt image
      "https://images.unsplash.com/photo-1585336129630-ef589921c89a?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1612225453534-d4610f0e4cb1?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1583470771444-22389014a9da?w=800&h=800&fit=crop",
    ],
    description:
      "L'Accessoire ١١١ est la touche finale parfaite pour votre tenue. Un design minimaliste qui complète chaque look avec subtilité et originalité.",
    shortDescription: "La touche finale minimaliste pour un style unique.",
    category: "Accessories",
    sizes: ["Unique"],
    colors: [
      { name: "Noir", hex: "#000000", label: "Noir" },
      { name: "Blanc", hex: "#FFFFFF", label: "Blanc" },
    ],
    composition: "100% Cuir Véritable",
    care: "Nettoyer avec un chiffon doux et sec.",
    origin: "Fabriqué en Espagne",
    reviews: [],
    relatedProducts: ["1", "2", "5"],
    variants: [
      { color: "#000000", size: "Unique", sku: "ACC-111-BLK-UNI", price: 350, availability: "in_stock" },
      { color: "#FFFFFF", size: "Unique", sku: "ACC-111-WHT-UNI", price: 350, availability: "in_stock" },
    ],
    symbolism:
      "Le chiffre 111 symbolise l'alignement parfait : entre forme et fonction, entre tradition et modernité, entre l'individu et son style. C'est notre signature, notre promesse d'authenticité.",
  },
  {
    id: "7",
    name: "Sweat Minimal",
    price: "750",
    images: [
      commonTshirtImage, // Added common T-shirt image
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop",
    ],
    colorImages: {
      "#000000": [
        commonTshirtImage, // Added common T-shirt image for black variant
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&h=800&fit=crop",
      ],
      "#808080": [
        commonTshirtImage, // Added common T-shirt image for grey variant
        "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800&h=800&fit=crop",
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=800&fit=crop",
      ],
    },
    description:
      "Sweat-shirt minimaliste en coton bio, parfait pour un style décontracté et moderne. Coupe droite confortable avec finitions soignées.",
    shortDescription: "Confort moderne et style minimaliste.",
    category: "Sweatwear",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "noir", hex: "#000000", label: "Noir" },
      { name: "gris", hex: "#808080", label: "Gris" },
    ],
    composition: "100% Coton Biologique",
    care: "Lavage machine 30°C, séchage à plat",
    origin: "Fabriqué au Portugal",
    reviews: [
      {
        id: 4,
        author: "Alex M.",
        rating: 5,
        date: "15/07/2024",
        comment: "Très confortable et la qualité est au rendez-vous !",
      },
    ],
    relatedProducts: ["1", "2", "8"],
    variants: [
      { color: "#000000", size: "S", sku: "SWEAT-MIN-BLK-S", price: 750, availability: "in_stock" },
      { color: "#000000", size: "M", sku: "SWEAT-MIN-BLK-M", price: 750, availability: "in_stock" },
      { color: "#000000", size: "L", sku: "SWEAT-MIN-BLK-L", price: 750, availability: "in_stock" },
      { color: "#000000", size: "XL", sku: "SWEAT-MIN-BLK-XL", price: 750, availability: "in_stock" },
      { color: "#808080", size: "S", sku: "SWEAT-MIN-GRY-S", price: 750, availability: "in_stock" },
      { color: "#808080", size: "M", sku: "SWEAT-MIN-GRY-M", price: 750, availability: "in_stock" },
      { color: "#808080", size: "L", sku: "SWEAT-MIN-GRY-L", price: 750, availability: "in_stock" },
    ],
    symbolism:
      "Le chiffre 111 symbolise l'alignement parfait : entre forme et fonction, entre tradition et modernité, entre l'individu et son style. C'est notre signature, notre promesse d'authenticité.",
  },
  {
    id: "8",
    name: "Jean Droit",
    price: "950",
    images: [
      commonTshirtImage, // Added common T-shirt image
      "https://images.unsplash.com/photo-1543508282-86b24e62aa9d?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1585336129630-ef589921c89a?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1618767754343-f979691f754e?w=800&h=800&fit=crop",
    ],
    description:
      "Jean à coupe droite classique, confectionné dans un denim de qualité supérieure. Parfait pour un look casual-chic au quotidien.",
    shortDescription: "Classique intemporel en denim premium.",
    category: "Bottoms",
    sizes: ["28", "30", "32", "34", "36", "38"],
    colors: [
      { name: "bleu", hex: "#1E3A8A", label: "Bleu Denim" },
      { name: "noir", hex: "#000000", label: "Noir" },
    ],
    composition: "98% Coton, 2% Élasthanne",
    care: "Lavage machine 30°C, séchage à l'air libre",
    origin: "Fabriqué en Italie",
    reviews: [
      {
        id: 5,
        author: "Thomas R.",
        rating: 4,
        date: "20/07/2024",
        comment: "Bonne coupe, très confortable. La qualité du denim est excellente.",
      },
    ],
    relatedProducts: ["1", "3", "7"],
    variants: [
      { color: "#1E3A8A", size: "30", sku: "JEAN-DRT-BLU-30", price: 950, availability: "in_stock" },
      { color: "#1E3A8A", size: "32", sku: "JEAN-DRT-BLU-32", price: 950, availability: "in_stock" },
      { color: "#1E3A8A", size: "34", sku: "JEAN-DRT-BLU-34", price: 950, availability: "in_stock" },
      { color: "#000000", size: "30", sku: "JEAN-DRT-BLK-30", price: 950, availability: "in_stock" },
      { color: "#000000", size: "32", sku: "JEAN-DRT-BLK-32", price: 950, availability: "in_stock" },
      { color: "#1E3A8A", size: "28", sku: "JEAN-DRT-BLU-28", price: 950, availability: "in_stock" },
      { color: "#1E3A8A", size: "36", sku: "JEAN-DRT-BLU-36", price: 950, availability: "in_stock" },
      { color: "#1E3A8A", size: "38", sku: "JEAN-DRT-BLU-38", price: 950, availability: "in_stock" },
      { color: "#000000", size: "28", sku: "JEAN-DRT-BLK-28", price: 950, availability: "in_stock" },
      { color: "#000000", size: "34", sku: "JEAN-DRT-BLK-34", price: 950, availability: "in_stock" },
      { color: "#000000", size: "36", sku: "JEAN-DRT-BLK-36", price: 950, availability: "in_stock" },
      { color: "#000000", size: "38", sku: "JEAN-DRT-BLK-38", price: 950, availability: "in_stock" },
    ],
    symbolism:
      "Le chiffre 111 symbolise l'alignement parfait : entre forme et fonction, entre tradition et modernité, entre l'individu et son style. C'est notre signature, notre promesse d'authenticité.",
  },
]
