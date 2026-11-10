// CAMBIAR ARCHIVO COMPLETO
// app/components/admin/AdminLoginModal.tsx
// Ventana modal que solicita credenciales al activar el engranaje oculto.

"use client";
import React, { useState } from "react";

export default function AdminLoginModal({ onClose }: { onClose: () => void }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí conectaremos luego con el backend para validar
    if(user === "admin" && pass === "admin123") {
      alert("Acceso concedido al Panel (Fase de desarrollo)");
      onClose();
    } else {
      alert("Credenciales incorrectas");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-xl w-96 border border-gray-200 dark:border-gray-700 shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">Acceso Restringido</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="text" 
            placeholder="Usuario" 
            className="w-full p-3 rounded bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
            value={user} onChange={(e) => setUser(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            className="w-full p-3 rounded bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
            value={pass} onChange={(e) => setPass(e.target.value)}
          />
          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 p-3 rounded bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold transition">Cancelar</button>
            <button type="submit" className="flex-1 p-3 rounded bg-green-500 hover:bg-green-600 text-white font-semibold transition">Ingresar</button>
          </div>
        </form>
      </div>
    </div>
  );
}