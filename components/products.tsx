import type { ProductData } from "@/lib/product-utils" // Import ProductData type

interface ProductsProps {
  searchQuery?: string
  allProducts: ProductData[] // Receive all products as a prop - now required
}

export function Products({ searchQuery = "", allProducts }: ProductsProps) {
  const filteredProducts = allProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const displayTitle = searchQuery ? `Résultats pour "${searchQuery}"` : "Nos Produits"
  const displayDescription = searchQuery
    ? `Découvrez les articles correspondant à votre recherche.`
    : `Découvrez notre sélection de produits phares.`

  return (
    <section id="products-section" className="relative">
      <div className="h-px bg-black w-full my-4" /> {/* Added black line */}
      {filteredProducts.length === 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">
          <h3 className="text-2xl font-bold text-gray-700">Aucun produit trouvé.</h3>
          <p className="text-gray-500 mt-2">Veuillez essayer une autre recherche.</p>
        </div>
      )}
    </section>
  )
}
