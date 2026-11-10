// app/api/surebets/route.ts
// Endpoint de Next.js que consume la API de Python y la envía al Frontend.
// ====================================================================
// CAMBIAR ARCHIVO COMPLETO

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Conectamos con el motor de Python (por defecto FastAPI corre en el puerto 8000)
    const pythonEngineUrl = process.env.PYTHON_ENGINE_URL || 'https://hunter-engine.onrender.com';
    
    const response = await fetch(`${pythonEngineUrl}/api/surebets/live`, {
      cache: 'no-store' // Evitar caché para tener datos en tiempo real
    });

    if (!response.ok) {
      throw new Error('Fallo al conectar con el motor Python');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error obteniendo surebets:", error);
    return NextResponse.json(
      { error: "Motor de análisis temporalmente fuera de servicio" },
      { status: 500 }
    );
  }
}