import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50: "#FFF0E6",
          100: "#FFE1CC",
          200: "#FFC299",
          300: "#FFA366",
          400: "#FF8433",
          500: "#FF6B00",
          600: "#E56000",
          700: "#CC5500",
          800: "#A34400",
          900: "#7A3300",
          DEFAULT: "#FF6B00",
          hover: "#E56000",
          active: "#CC5500",
          light: "#FFF0E6",
        },
        surface: {
          base: "#FFFFFF",
          hover: "#F8F9FA",
          subtle: "#F1F3F5",
          contrast: "#000000",
        },
        sub: {
          base: "#121212",
          muted: "#6C757D",
          border: "#DEE2E6",
          dark: "#000000",
        },
      },
      borderRadius: {
        small: "4px",
        medium: "8px",
        large: "12px",
        pill: "9999px",
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(0, 0, 0, 0.05)",
        medium: "0 4px 6px rgba(0, 0, 0, 0.07)",
        elevated: "0 10px 25px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [],
};
export default config;
