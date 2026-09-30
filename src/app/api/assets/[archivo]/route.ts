import { NextResponse, type NextRequest } from 'next/server';
import { leerVideo } from '@/lib/gemini-video';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ archivo: string }> };

/**
 * GET /api/assets/:archivo
 * Sirve los clips generados desde la carpeta compartida, para que la landing
 * pueda apuntar a ellos con una ruta propia de ConvertIA.
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  const { archivo } = await context.params;

  if (!/^[a-z0-9._-]+\.mp4$/i.test(archivo)) {
    return NextResponse.json({ error: 'Nombre de archivo no valido.' }, { status: 400 });
  }

  const datos = await leerVideo(archivo);
  if (!datos) {
    return NextResponse.json({ error: 'Ese clip no existe.' }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(datos), {
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Length': String(datos.length),
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
