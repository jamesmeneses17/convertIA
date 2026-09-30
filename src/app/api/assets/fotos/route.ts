import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { cambiarPorFotosReales, isFotosEnabled } from '@/lib/fotos';

export const runtime = 'nodejs';

/**
 * ============================================================================
 *  GET  /api/assets/fotos   -> dice si hay clave de Unsplash configurada
 *  POST /api/assets/fotos   -> cambia las imagenes del HTML por fotos reales
 * ----------------------------------------------------------------------------
 *  Se hace en el servidor y no en el navegador porque la clave de Unsplash no
 *  puede viajar al cliente: quedaria a la vista de cualquiera.
 * ============================================================================
 */

export async function GET() {
  return NextResponse.json({ activo: isFotosEnabled() });
}

const cuerpo = z.object({
  html: z.string().min(1).max(400_000),
});

export async function POST(request: NextRequest) {
  if (!isFotosEnabled()) {
    return NextResponse.json(
      {
        error: 'Unsplash no esta configurado.',
        detail: 'Pon UNSPLASH_ACCESS_KEY en el archivo .env y reinicia el contenedor.',
      },
      { status: 503 },
    );
  }

  let datos: z.infer<typeof cuerpo>;
  try {
    datos = cuerpo.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Falta el HTML de la landing.' }, { status: 400 });
  }

  const resultado = await cambiarPorFotosReales(datos.html, true, { respaldo: true });

  if (resultado.intentadas === 0) {
    return NextResponse.json(
      {
        error: 'No hay imagenes sustituibles.',
        detail: 'La landing no usa Pollinations ni Picsum, asi que no hay nada que cambiar.',
      },
      { status: 422 },
    );
  }

  return NextResponse.json({
    html: resultado.html,
    cambiadas: resultado.cambiadas,
    intentadas: resultado.intentadas,
    restantes: resultado.restantes,
    avisos: resultado.avisos,
  });
}
