import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import {
  GeminiError,
  MODELO_POR_DEFECTO,
  consultarVideo,
  getGeminiKeys,
  guardarVideo,
  iniciarVideo,
  isVideoEnabled,
  listarModelosVideo,
  type EventoVideo,
} from '@/lib/gemini-video';
import { slugify } from '@/lib/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Veo tarda tipicamente entre 1 y 3 minutos. Cortamos a los 8. */
const TIMEOUT_MS = 8 * 60 * 1000;
const INTERVALO_MS = 10_000;

const bodySchema = z.object({
  prompt: z.string().trim().min(20, 'El prompt del video es demasiado corto.').max(5_000),
  modelo: z.string().trim().max(120).optional(),
  aspecto: z.string().trim().max(10).optional(),
  negativo: z.string().trim().max(1_000).optional(),
  // Se admite un nombre largo: lo recortamos nosotros al construir el archivo.
  nombre: z.string().trim().max(300).optional(),
});

/**
 * GET /api/assets/video
 * Estado del modulo. Con ?modelos=1 le pregunta a Google que modelos de video
 * acepta tu clave: sirve para acertar el identificador sin adivinarlo.
 */
export async function GET(request: NextRequest) {
  const activo = isVideoEnabled();
  const base = {
    activo,
    claves: getGeminiKeys().length,
    modelo: MODELO_POR_DEFECTO,
  };

  if (!activo || request.nextUrl.searchParams.get('modelos') !== '1') {
    return NextResponse.json(base);
  }

  try {
    return NextResponse.json({ ...base, modelosDisponibles: await listarModelosVideo() });
  } catch (error) {
    return NextResponse.json({
      ...base,
      modelosDisponibles: [],
      error: error instanceof Error ? error.message : 'No se pudo consultar la lista de modelos.',
    });
  }
}

function codificar(evento: EventoVideo): Uint8Array {
  return new TextEncoder().encode(`${JSON.stringify(evento)}\n`);
}

/**
 * POST /api/assets/video
 * Genera un clip con Veo y lo deja guardado en la app. Va informando del
 * progreso en NDJSON porque la operacion dura varios minutos.
 */
export async function POST(request: NextRequest) {
  if (!isVideoEnabled()) {
    return NextResponse.json(
      {
        error: 'Generacion de video no configurada.',
        detail:
          'Anade GEMINI_API_KEY_1 (y opcionalmente GEMINI_API_KEY_2) a tu .env y reinicia el contenedor.',
      },
      { status: 501 },
    );
  }

  let datos: z.infer<typeof bodySchema>;
  try {
    datos = bodySchema.parse(await request.json());
  } catch (error) {
    const problema = error instanceof z.ZodError ? error.issues[0] : null;
    return NextResponse.json(
      {
        error: 'La peticion no era valida.',
        detail: problema
          ? `Campo "${problema.path.join('.') || 'desconocido'}": ${problema.message}`
          : 'Revisa el prompt del clip.',
      },
      { status: 422 },
    );
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let cerrado = false;
      const enviar = (evento: EventoVideo) => {
        if (!cerrado) controller.enqueue(codificar(evento));
      };

      const arranque = Date.now();
      const transcurrido = () => Math.round((Date.now() - arranque) / 1000);

      try {
        const { operacion, clave, modelo } = await iniciarVideo(datos.prompt, {
          modelo: datos.modelo,
          aspecto: datos.aspecto,
          negativo: datos.negativo,
        });

        enviar({ tipo: 'inicio', modelo, claves: getGeminiKeys().length });

        for (;;) {
          if (Date.now() - arranque > TIMEOUT_MS) {
            enviar({
              tipo: 'error',
              mensaje: 'La generacion tardo demasiado y dejamos de esperar.',
              detalle: 'El clip puede seguir generandose en Google; reintenta en unos minutos.',
            });
            return;
          }

          await new Promise((listo) => setTimeout(listo, INTERVALO_MS));

          const estado = await consultarVideo(operacion, clave);

          if (!estado.listo) {
            enviar({ tipo: 'progreso', segundos: transcurrido(), mensaje: 'Veo esta generando el clip...' });
            continue;
          }
          if (estado.error) {
            enviar({ tipo: 'error', mensaje: 'Veo no pudo generar el clip.', detalle: estado.error });
            return;
          }

          enviar({ tipo: 'progreso', segundos: transcurrido(), mensaje: 'Descargando el clip...' });

          const archivo = await guardarVideo(
            estado.uri as string,
            clave,
            slugify(datos.nombre ?? 'hero').slice(0, 40) || 'hero',
          );

          enviar({
            tipo: 'listo',
            url: `/api/assets/${archivo}`,
            archivo,
            segundos: transcurrido(),
            modelo,
          });
          return;
        }
      } catch (error) {
        const esGemini = error instanceof GeminiError;
        enviar({
          tipo: 'error',
          mensaje: esGemini
            ? describir(error)
            : 'Error inesperado durante la generacion del video.',
          detalle: error instanceof Error ? error.message : undefined,
        });
        if (!esGemini) console.error('[ConvertIA][video]', error);
      } finally {
        cerrado = true;
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-store, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}

function describir(error: GeminiError): string {
  if (error.status === 401) return 'La clave de Gemini no es valida.';
  if (error.status === 403) return 'Tu clave no tiene permiso para este modelo de video.';
  if (error.status === 429) return 'Todas tus claves agotaron la cuota. Prueba mas tarde.';
  if (error.status === 404) {
    return 'Ese modelo de video no existe para tu clave. Consulta los disponibles con ?modelos=1.';
  }
  return `La API de Gemini respondio con un error (${error.status}).`;
}
