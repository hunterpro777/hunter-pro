// app/api/settings/route.ts
// Endpoint Next.js para comunicar el panel Admin con SQLite.
// ====================================================================

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pythonUrl = process.env.PYTHON_ENGINE_URL || 'http://127.0.0.1:8000';
    const response = await fetch(`${pythonUrl}/api/settings`, { cache: 'no-store' });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({}, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const pythonUrl = process.env.PYTHON_ENGINE_URL || 'http://127.0.0.1:8000';
    
    const response = await fetch(`${pythonUrl}/api/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Fallo al guardar configuraciones' }, { status: 500 });
  }
}