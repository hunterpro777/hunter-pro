// tailwind.config.ts
// Configuración de rutas y variables de Tailwind CSS
// CAMBIAR ARCHIVO COMPLETO

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class", // Activa el Modo Oscuro por clase (Regla 4)
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;