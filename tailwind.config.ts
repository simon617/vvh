import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1B2A4A", // Deep Navy
          50: "#E8ECF3",
          100: "#C5CDDF",
          200: "#9EABBF",
          300: "#7788A0",
          400: "#4C6380",
          500: "#1B2A4A",
          600: "#162442",
          700: "#111D39",
          800: "#0C1630",
          900: "#070E27",
        },
        secondary: {
          DEFAULT: "#9B1B30", // Warm Red
          50: "#FCE8EB",
          100: "#F4C5CC",
          200: "#E89EAA",
          300: "#DB7788",
          400: "#CF5066",
          500: "#9B1B30",
          600: "#851628",
          700: "#6E1121",
          800: "#580C1A",
          900: "#410713",
        },
        accent: {
          DEFAULT: "#C9A94E", // Gold
          50: "#F9F3E3",
          100: "#F0E3BA",
          200: "#E5D08E",
          300: "#DABD62",
          400: "#CFAA36",
          500: "#C9A94E",
          600: "#A98B3F",
          700: "#896D30",
          800: "#694F21",
          900: "#493112",
        },
        background: {
          DEFAULT: "#FFFFFF",
          light: "#F5F6F8",
        },
        text: {
          DEFAULT: "#2D2D2D",
        },
        border: {
          DEFAULT: "#D1D5DB",
        },
        sidebar: {
          DEFAULT: "#4B6CB7", // Steel Blue (complements Deep Navy)
          50: "#EBF0F9",
          100: "#D6E0F3",
          500: "#4B6CB7",
          600: "#3D5A9E",
          700: "#2F4885",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;