import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="h-screen w-screen flex items-center justify-center relative pt-16 overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover min-w-full min-h-full" // Added min-w-full min-h-full for better coverage
          aria-label="NOSTRA 111 brand video showcasing minimalist fashion"
          poster="/placeholder.svg?height=1080&width=1920&text=NOSTRA+Background" // Static image fallback
        >
          {/*
            IMPORTANT: For optimal mobile performance and to avoid a "minimized" appearance,
            ensure your video files (MP4/WebM) have an aspect ratio suitable for mobile screens (e.g., 9:16 for portrait, 16:9 for landscape).
            If your original GIF was 1:1, converting it to a 1:1 video will result in cropping on non-1:1 screens when using object-cover.
            Upload these video files to your public directory (e.g., /videos/hero-background.mp4)
            and update the src paths below.
          */}
          <source src="/videos/hero-background.mp4" type="video/mp4" />
          <source src="/videos/hero-background.webm" type="video/webm" />
          {/* Fallback for browsers that don't support video or if video files are missing */}
          <img
            src="/placeholder.svg?height=1080&width=1920&text=NOSTRA+Background"
            alt="NOSTRA 111 brand video fallback"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </video>
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-black/50"></div> {/* Adjust opacity as needed */}
      </div>
      <div className="relative z-10 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-bold mb-4 tracking-tight">NOSTRA</h1>
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className="h-px bg-white w-16"></div>
              <span className="text-2xl font-light text-gray-300">١١١</span>
              <div className="h-px bg-white w-16"></div>
            </div>
            {/* Animated 111 with subtle color shift effect */}
            <div className="text-5xl md:text-6xl font-bold text-red-500 tracking-widest mb-8 animate-red-pulse font-mono">
              ١١١
            </div>
            <div className="text-3xl md:text-4xl font-semibold text-white mb-8 animate-pulse">marocaine 🇲🇦</div>
          </div>

          {/* New Italian text with glitch effect */}
          <p className="font-bold text-white tracking-wider mb-8 animate-glitch font-sans text-3xl">
            Unica goccia. Un solo simbolo. Mai più.
          </p>

          <div className="flex justify-center">
            <Button size="lg" className="bg-white hover:bg-gray-200 text-black px-8 py-4">
              Shop Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
