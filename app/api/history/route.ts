// app/api/history/route.ts
// Endpoint de Next.js para obtener el historial de surebets desde la base de datos Python.
// ====================================================================
// CAMBIAR ARCHIVO COMPLETO

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pythonEngineUrl = process.env.PYTHON_ENGINE_URL || 'http://127.0.0.1:8000';
    const response = await fetch(`${pythonEngineUrl}/api/surebets/history`, {
      cache: 'no-store'
    });

    if (!response.ok) throw new Error('Fallo al conectar con el historial de Python');

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error API Historial:", error);
    return NextResponse.json([], { status: 200 });
  }
}