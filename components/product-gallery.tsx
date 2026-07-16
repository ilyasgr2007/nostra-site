import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { mockProducts } from "@/lib/product-utils" // Import mockProducts

export function ProductGallery() {
  // Use a subset of mockProducts or define specific products for this section
  const products = mockProducts.slice(0, 6) // Example: show first 6 products

  return (
    <section id="collection" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-black flex items-center justify-center">
              <span className="text-white font-bold text-xl">١١١</span>
            </div>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold tracking-wide mb-6">Collection</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Chaque pièce est pensée pour durer, conçue pour sublimer. L'art du minimalisme au service de votre style.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <Link href={`/products/${product.id}`} key={product.id}>
              <Card
                className="group cursor-pointer border-0 shadow-none hover:shadow-2xl transition-all duration-500 overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-0">
                  <div className="aspect-[4/5] overflow-hidden bg-gray-50 relative">
                    <Image
                      src={product.images[0] || "/placeholder.svg"} // Use first image from product data
                      alt={product.name}
                      width={400}
                      height={500}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                  </div>
                  <div className="p-6 space-y-3">
                    <p className="text-sm text-gray-500 uppercase tracking-[0.2em] font-medium">{product.category}</p>
                    <h3 className="font-bold text-xl tracking-wide">{product.name}</h3>
                    <p className="text-2xl font-bold">{product.price} DH</p>
                    <Button className="w-full mt-4 bg-black hover:bg-gray-800 text-white font-medium tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Ajouter au panier
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-16">
          <Button
            variant="outline"
            size="lg"
            className="border-black text-black hover:bg-black hover:text-white px-12 py-4 text-lg font-medium tracking-wide bg-transparent"
          >
            Voir toute la collection
          </Button>
        </div>
      </div>
    </section>
  )
}
