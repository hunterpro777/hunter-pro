// CAMBIAR ARCHIVO COMPLETO
// app/layout.tsx
// Archivo raíz de Next.js que envuelve toda la aplicación e inyecta la Navbar.

import type { Metadata } from 'next'
import './globals.css'
import Navbar from './components/layout/Navbar'

export const metadata: Metadata = {
  title: 'Surebet Pro - Inversión Deportiva',
  description: 'Sistema de arbitraje deportivo avanzado',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <body className="bg-gray-50 dark:bg-black min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-200">
        <Navbar />
        <main className="container mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  )
}