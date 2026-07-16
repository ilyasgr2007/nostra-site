import Image from "next/image"
import Link from "next/link"

export function BrandAndQualitySection() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Brand logos section - now the only content */}
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
          {/* Nike Logo as Image */}
          <Link href="https://www.nike.com" target="_blank" rel="noopener noreferrer">
            <Image
              src="/images/nike.png"
              alt="Nike Logo"
              width={120}
              height={60}
              className="h-12 w-auto grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer"
            />
          </Link>
          {/* Adidas Logo as Image */}
          <Link href="https://www.adidas.com" target="_blank" rel="noopener noreferrer">
            <Image
              src="/images/adidas-logo.png"
              alt="Adidas Logo"
              width={120}
              height={60}
              className="h-12 w-auto grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer"
            />
          </Link>
          {/* Under Armour Logo as Image */}
          <Link href="https://www.underarmour.com" target="_blank" rel="noopener noreferrer">
            <Image
              src="/images/under-armour-logo.png"
              alt="Under Armour Logo"
              width={120}
              height={60}
              className="h-12 w-auto grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer"
            />
          </Link>
          {/* Vans Logo as Image */}
          <Link href="https://www.vans.com" target="_blank" rel="noopener noreferrer">
            <Image
              src="/images/vans-logo.png"
              alt="Vans Logo"
              width={120}
              height={60}
              className="h-12 w-auto grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer"
            />
          </Link>
          {/* Fila Logo as Image */}
          <Link href="https://fila.com" target="_blank" rel="noopener noreferrer">
            <Image
              src="/images/fila-seeklogo.png"
              alt="Fila Logo"
              width={120}
              height={60}
              className="h-12 w-auto grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer"
            />
          </Link>
          {/* Lacoste Logo as Image */}
          <Link href="https://www.lacoste.com" target="_blank" rel="noopener noreferrer">
            <Image
              src="/images/lacoste-seeklogo.png"
              alt="Lacoste Logo"
              width={120}
              height={60}
              className="h-12 w-auto grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer"
            />
          </Link>
        </div>
      </div>
    </section>
  )
}
