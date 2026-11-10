// app/components/layout/Navbar.tsx
// Barra de navegación minimalista que incluye el toggle de tema y el trigger oculto para el administrador.

"use client";
import React, { useState, useRef, useEffect } from "react";
import AdminLoginModal from "../admin/AdminLoginModal";

export default function Navbar() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [showGear, setShowGear] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [clicks, setClicks] = useState(0);
  
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);

  // Alternar Tema (Regla 4)
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  // Lógica Admin Oculto (Regla 5)
  const handleMouseEnter = () => {
    hoverTimer.current = setTimeout(() => setShowGear(true), 5000);
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  };

  const handleHiddenClick = () => {
    setClicks((prev) => prev + 1);
    if (clicks + 1 >= 5) {
      setShowGear(true);
      setClicks(0);
    }
  };

  return (
    <>
      <nav className="flex justify-between items-center p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors duration-200">
        <div className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
          SURE<span className="text-green-500">BET</span> PRO
        </div>

        <div className="flex items-center space-x-4">
          {/* Botón Sol/Luna */}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-800 dark:text-yellow-400"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {/* Área Oculta Admin */}
          <div 
            className="w-12 h-12 flex items-center justify-center cursor-default"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleHiddenClick}
          >
            {showGear && (
              <button 
                onClick={() => setShowModal(true)}
                className="text-gray-400 hover:text-white transition animate-pulse"
                title="Ajustes de Sistema"
              >
                ⚙️
              </button>
            )}
          </div>
        </div>
      </nav>

      {showModal && <AdminLoginModal onClose={() => setShowModal(false)} />}
    </>
  );
}