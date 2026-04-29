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
        navy: {
          900: "#0a0f1e",
          800: "#111827",
          700: "#1f2937",
          600: "#374151",
        },
        teal: {
          400: "#2dd4bf",
          500: "#00d4aa",
          600: "#00b894",
        },
        amber: {
          400: "#fbbf24",
          500: "#f59e0b",
        },
      },
      fontFamily: {
        sora: ["Sora", "sans-serif"],
        dm: ["DM Sans", "sans-serif"],
      },
      backgroundImage: {
        "grid-pattern": "linear-gradient(rgba(0,212,170,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,170,0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid": "40px 40px",
      },
    },
  },
  plugins: [],
};

export default config;
