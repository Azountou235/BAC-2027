import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          50: "#f0fdf9",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
          950: "#042f2e",
          DEFAULT: "#0d9488",
        },
        tchad: {
          blue: "#002664",
          yellow: "#FECB00",
          red: "#C60C30",
        },
        graphite: {
          800: "#151b28",
          850: "#101622",
          900: "#0b0f19",
          950: "#070a10",
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      padding: {
        "safe-bottom": "env(safe-area-inset-bottom, 16px)",
        "safe-top": "env(safe-area-inset-top, 0px)",
      }
    },
  },
  plugins: [],
};
export default config;
