// app/api/surebets/route.ts
// Endpoint de Next.js que consume la API de Python sin caché.
// CAMBIAR ARCHIVO COMPLETO

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Evita el caché estático en Next.js

export async function GET() {
  try {
    const pythonEngineUrl = 'http://127.0.0.1:8000';
    const response = await fetch(`${pythonEngineUrl}/api/surebets/live`, {
      cache: 'no-store',
      headers: {
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) throw new Error('Fallo al conectar con el motor Python');

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error API:", error);
    return NextResponse.json([], { status: 200 }); // Retorna array vacío para que el map no falle
  }
}