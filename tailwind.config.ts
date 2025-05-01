import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-oswald)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // Specific color palette
        jetblack: "#0B0B0B", // Background
        charcoal: "#1F1F1F", // Cards / Sections
        offwhite: "#F5F5F5", // Main Text
        gold: {
          DEFAULT: "#D4AF37", // Accent Text & Labels (Metallic Gold)
          soft: "#E5C558", // CTA Button (Soft Gold)
          deep: "#B8860B", // Hover Text / Labels (Deep Gold)
          warm: "#FFBF00", // Price Tags (Warm Gold / Orange Gold)
          50: "#FBF6E3",
          100: "#F7EDC8",
          200: "#EFDB91",
          300: "#E7C95A",
          400: "#DFB723",
          500: "#D4AF37",
          600: "#B8860B",
          700: "#8B6914",
          800: "#5E4C0D",
          900: "#312706",
        },
        primary: {
          DEFAULT: "#E5C558", // Soft Gold for primary buttons
          foreground: "#0B0B0B", // Jet black text on gold
        },
        secondary: {
          DEFAULT: "#0B0B0B", // Jet black
          foreground: "#D4AF37", // Gold text on black
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
          DEFAULT: "#B8860B", // Deep Gold accent
          foreground: "#0B0B0B", // Jet black text on deep gold
        },
        popover: {
          DEFAULT: "#1F1F1F", // Charcoal Grey
          foreground: "#F5F5F5", // Off-White
        },
        card: {
          DEFAULT: "#1F1F1F", // Charcoal Grey
          foreground: "#F5F5F5", // Off-White
        },
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(to right, #D4AF37, #E5C558, #D4AF37)",
        "gold-gradient-vertical": "linear-gradient(to bottom, #D4AF37, #B8860B)",
        "gold-radial": "radial-gradient(circle, #E5C558, #D4AF37)",
        "gold-shine": "linear-gradient(45deg, #B8860B, #D4AF37, #E5C558, #D4AF37, #B8860B)",
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
        "gold-shimmer": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        flip: {
          "0%": { transform: "rotateY(0deg)" },
          "100%": { transform: "rotateY(180deg)" },
        },
        "flip-back": {
          "0%": { transform: "rotateY(180deg)" },
          "100%": { transform: "rotateY(0deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "gold-shimmer": "gold-shimmer 3s ease infinite",
        flip: "flip 0.5s ease-out forwards",
        "flip-back": "flip-back 0.5s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
