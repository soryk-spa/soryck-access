import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware para proteger endpoints de debug
 * Solo permite acceso en desarrollo o con una API key específica
 */
export function debugMiddleware(req: NextRequest) {
  // Permitir en desarrollo
  if (process.env.NODE_ENV !== 'production') {
    return null; // Continuar
  }

  // En producción, requerir API key
  const apiKey = req.headers.get('x-debug-api-key');
  const validKey = process.env.DEBUG_API_KEY;

  if (validKey && apiKey === validKey) {
    return null; // Continuar
  }

  // Bloquear acceso
  return NextResponse.json(
    { error: 'Debug endpoints are disabled in production' },
    { status: 403 }
  );
}

/**
 * Helper para usar en rutas de debug
 */
export function protectDebugEndpoint(req: NextRequest) {
  return debugMiddleware(req);
}