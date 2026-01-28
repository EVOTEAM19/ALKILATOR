/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Colores principales de Alkilator
        primary: {
          DEFAULT: "#0066CC",
          50: "#E6F0FA",
          100: "#CCE0F5",
          200: "#99C2EB",
          300: "#66A3E0",
          400: "#3385D6",
          500: "#0066CC",
          600: "#0052A3",
          700: "#003D7A",
          800: "#002952",
          900: "#001429",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#00CC66",
          50: "#E6FAF0",
          100: "#CCF5E0",
          200: "#99EBC2",
          300: "#66E0A3",
          400: "#33D685",
          500: "#00CC66",
          600: "#00A352",
          700: "#007A3D",
          800: "#005229",
          900: "#002914",
          foreground: "#FFFFFF",
        },
        background: "#FFFFFF",
        foreground: "#1A1A1A",
        muted: {
          DEFAULT: "#F5F5F5",
          foreground: "#737373",
        },
        accent: {
          DEFAULT: "#F5F5F5",
          foreground: "#1A1A1A",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        border: "#E5E5E5",
        input: "#E5E5E5",
        ring: "#0066CC",
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1A1A1A",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#1A1A1A",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
