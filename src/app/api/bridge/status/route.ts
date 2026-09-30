import { NextResponse } from 'next/server';
import { ARCHIVO_ENCARGO, ARCHIVO_ENTREGA, BUZON_HOST_PATH, isBuzonEnabled } from '@/lib/buzon';

export const dynamic = 'force-dynamic';

/**
 * GET /api/bridge/status
 * Dice a la interfaz que modo de puente esta disponible, para mostrar las
 * instrucciones correctas: carpeta compartida o servidor MCP.
 */
export function GET() {
  return NextResponse.json({
    carpeta: isBuzonEnabled(),
    rutaCarpeta: isBuzonEnabled() ? BUZON_HOST_PATH : null,
    archivoEncargo: ARCHIVO_ENCARGO,
    archivoEntrega: ARCHIVO_ENTREGA,
  });
}
