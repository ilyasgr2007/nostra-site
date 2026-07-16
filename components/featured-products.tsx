import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function FeaturedProducts() {
  const products = [
    {
      id: 1,
      name: "Essential Tee",
      price: "$45",
      image: "/placeholder.svg?height=400&width=400",
      category: "Basics",
    },
    {
      id: 2,
      name: "Oversized Hoodie",
      price: "$85",
      image: "/placeholder.svg?height=400&width=400",
      category: "Outerwear",
    },
    {
      id: 3,
      name: "Cargo Pants",
      price: "$95",
      image: "/placeholder.svg?height=400&width=400",
      category: "Bottoms",
    },
    {
      id: 4,
      name: "Logo Cap",
      price: "$35",
      image: "/placeholder.svg?height=400&width=400",
      category: "Accessories",
    },
  ]

  return (
    <section id="shop" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Featured</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our latest drops. Each piece crafted with attention to detail and modern aesthetics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <Card
              key={product.id}
              className="group cursor-pointer border-0 shadow-none hover:shadow-lg transition-all duration-300"
            >
              <CardContent className="p-0">
                <div className="aspect-square overflow-hidden bg-gray-50 mb-4">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 uppercase tracking-wide">{product.category}</p>
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-xl font-bold">{product.price}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            variant="outline"
            size="lg"
            className="border-black text-black hover:bg-black hover:text-white px-8 bg-transparent"
          >
            View All Products
          </Button>
        </div>
      </div>
    </section>
  )
}
