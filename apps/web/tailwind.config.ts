import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: "#5BBFB0",
          dark:    "#2C5F5A",
          deeper:  "#1E4A45",
          mid:     "#A8DDD8",
          light:   "#E5F6F4",
        },
        purple: {
          DEFAULT: "#A97CC4",
          dark:    "#5A3A7A",
          mid:     "#E0D0F0",
          light:   "#F3EEF8",
        },
        orange: {
          DEFAULT: "#E07B39",
          light:   "#FEF0E7",
        },
        red: {
          DEFAULT: "#C75D5D",
          light:   "#FAEAEA",
        },
        blue: {
          DEFAULT: "#5B7EC9",
          light:   "#EEF2FC",
        },
        yellow:  "#F9C74F",
        ink:     "#5A3A7A",
        ink2:    "#666666",
        ink3:    "#999AAA",
        surface: "#FFFFFF",
        bg:      "#FDFBFF",
        bg2:     "#F3EEF8",
        border:  "#E0D0F0",
        border2: "#C8B8DC",
      },
      fontFamily: {
        sans:    ["var(--font-jakarta)", "Plus Jakarta Sans", "sans-serif"],
        serif:   ["var(--font-dm-serif)", "DM Serif Display", "serif"],
      },
      borderRadius: {
        sm:   "6px",
        md:   "10px",
        lg:   "16px",
        xl:   "24px",
        full: "9999px",
      },
      minHeight: {
        touch: "48px",
      },
    },
  },
  plugins: [],
}

export default config
