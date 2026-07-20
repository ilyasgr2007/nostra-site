import { Crown } from "lucide-react"

export function ClientKingBanner() {
  return (
    <section className="py-16 bg-black dark:bg-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex items-center justify-center mb-6 animate-fade-in-up">
          <div className="h-px bg-white dark:bg-black w-16"></div>
          <Crown
            className="w-8 h-8 mx-4 text-white dark:text-black animate-crown-float animate-crown-glow"
            strokeWidth={1.5}
          />
          <div className="h-px bg-white dark:bg-black w-16"></div>
        </div>
        <h2
          className="text-3xl md:text-5xl font-bold tracking-wide uppercase text-white dark:text-black animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          Le Client Est Le Roi
        </h2>
      </div>
    </section>
  )
}
