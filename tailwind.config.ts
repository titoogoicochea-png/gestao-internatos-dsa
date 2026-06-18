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
        // Serif editorial para títulos grandes (da aire premium)
        display: ["Fraunces", "Georgia", "Cambria", "serif"],
      },
      colors: {
        // Paleta ejecutiva: Navy · Teal · Sky · Beige
        brand: {
          DEFAULT: "#2F4156", // Navy
          light: "#567C8D",   // Teal
          dark: "#22303F",
        },
        navy: "#2F4156",
        teal2: "#567C8D",
        mist: "#C8D9E6",  // Sky Blue
        sand: "#F5EFEB",  // Beige
      },
      boxShadow: {
        // Sombra suave y profunda con tinte navy — da "prestancia" a las tarjetas
        card: "0 8px 24px -12px rgba(47,65,86,0.22)",
        "card-hover": "0 20px 42px -16px rgba(47,65,86,0.42)",
      },
    },
  },
  plugins: [],
};

export default config;
