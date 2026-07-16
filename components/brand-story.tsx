export function BrandStory() {
  return (
    <section id="histoire" className="py-24 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-white flex items-center justify-center mr-4">
                <span className="text-black font-bold text-lg">١١١</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-bold tracking-wide">Notre Histoire</h2>
            </div>

            <div className="space-y-8 text-lg leading-relaxed">
              <p className="text-gray-300">
                NOSTRA 111 est née d'une vision simple : créer des vêtements qui transcendent les tendances. Dans un
                monde saturé de bruit visuel, nous avons choisi le silence éloquent du minimalisme.
              </p>

              <p className="text-gray-300">
                Chaque pièce est le résultat d'une réflexion approfondie sur l'essentiel. Nous croyons que la vraie
                élégance réside dans la simplicité, que le luxe se trouve dans la qualité des matières et la perfection
                des coupes.
              </p>

              <p className="text-gray-300">
                Le chiffre 111 symbolise l'alignement parfait : entre forme et fonction, entre tradition et modernité,
                entre l'individu et son style. C'est notre signature, notre promesse d'authenticité.
              </p>

              <div className="pt-8">
                <div className="flex items-center space-x-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold">2024</div>
                    <div className="text-sm text-gray-400 tracking-wide">Fondation</div>
                  </div>
                  <div className="w-px h-12 bg-gray-600"></div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">١١١</div>
                    <div className="text-sm text-gray-400 tracking-wide">Pièces</div>
                  </div>
                  <div className="w-px h-12 bg-gray-600"></div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">∞</div>
                    <div className="text-sm text-gray-400 tracking-wide">Possibilités</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 relative">
            <div className="aspect-square bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 bg-white flex items-center justify-center mb-8 mx-auto">
                  <span className="text-black font-bold text-4xl">١١١</span>
                </div>
                <div className="text-2xl font-light tracking-[0.3em]">MINIMALISME</div>
                <div className="text-lg tracking-[0.2em] text-gray-400 mt-2">ÉLÉGANCE</div>
                <div className="text-lg tracking-[0.2em] text-gray-400">AUTHENTICITÉ</div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -left-4 w-8 h-8 border-l-2 border-t-2 border-white/30"></div>
            <div className="absolute -bottom-4 -right-4 w-8 h-8 border-r-2 border-b-2 border-white/30"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
