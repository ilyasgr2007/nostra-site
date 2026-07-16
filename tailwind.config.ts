import type { Config } from "tailwindcss"

// all in fixtures is set to tailwind v3 as interims solutions

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom NOSTRA colors
        black: {
          DEFAULT: "#000000",
          100: "#1a1a1a", // Slightly lighter black for subtle variations
        },
        white: {
          DEFAULT: "#FFFFFF",
          100: "#f8f8f8", // Off-white for backgrounds
        },
        gray: {
          DEFAULT: "#808080", // Mid-grey for text/borders
          50: "#f9f9f9", // Very light grey for backgrounds
          100: "#f0f0f0", // Light grey
          200: "#e0e0e0", // Lighter grey for borders
          300: "#d0d0d0",
          400: "#a0a0a0",
          500: "#808080",
          600: "#606060",
          700: "#404040",
          800: "#202020",
          900: "#101010",
        },
        red: {
          // New red color definition
          DEFAULT: "#FF0000",
          500: "#FF0000",
          600: "#CC0000",
          700: "#990000",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // New subtle color shift animation
        "subtle-color-shift": {
          "0%": { color: "hsl(0, 0%, 100%)" }, // White
          "33%": { color: "hsl(200, 10%, 95%)" }, // Very light blue
          "66%": { color: "hsl(300, 10%, 95%)" }, // Very light purple
          "100%": { color: "hsl(0, 0%, 100%)" }, // Back to white
        },
        // New red pulse animation
        "red-pulse": {
          "0%, 100%": { color: "var(--red-500)" }, // Start and end with red-500
          "50%": { color: "var(--red-700)" }, // Pulse to a darker red
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "subtle-color-shift": "subtle-color-shift 4s ease-in-out infinite", // Smooth, looping color transition
        "red-pulse": "red-pulse 2s ease-in-out infinite", // Apply the new red pulse animation
      },
      // Ensure Inter is the primary font for all text
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["monospace"], // Add monospace font for the glitch effect
        serif: ["Georgia", "serif"], // Add a serif font for the Italian text
      },
      // Add custom letter spacing for titles
      letterSpacing: {
        tightest: "-.075em",
        tighter: "-.05em",
        tight: "-.025em",
        normal: "0",
        wide: ".025em",
        wider: ".05em",
        widest: ".1em",
        extraWide: ".15em", // Custom for NOSTRA titles
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
