import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "Arial", "sans-serif"],
      },
      colors: {
        brand: {
          DEFAULT: "#1F4E79",
          light: "#2E75B6",
          dark: "#163A5A",
        },
      },
    },
  },
  plugins: [],
};

export default config;
