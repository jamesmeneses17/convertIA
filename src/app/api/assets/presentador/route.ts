import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import {
  TavusError,
  consultarVideo,
  crearVideo,
  getReplicaPorDefecto,
  isTavusEnabled,
  listarReplicas,
  type EventoTavus,
} from '@/lib/tavus';
import { repararAcentos } from '@/lib/locucion';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Tavus suele tardar entre 2 y 6 minutos. Cortamos a los 12. */
const TIMEOUT_MS = 12 * 60 * 1000;
const INTERVALO_MS = 10_000;

const bodySchema = z.object({
  guion: z
    .string()
    .trim()
    .min(40, 'El guion es demasiado corto para un video de presentacion.')
    .max(5_000, 'El guion es demasiado largo: recortalo a menos de 5.000 caracteres.'),
  replicaId: z.string().trim().min(1, 'Elige una persona digital.'),
  nombre: z.string().trim().max(300).optional(),
  fondoUrl: z.string().trim().url().max(500).optional(),
  fondoTransparente: z.boolean().optional(),
});

/**
 * GET /api/assets/presentador
 * Estado del modulo. Con ?replicas=1 lista las personas digitales de tu cuenta.
 */
export async function GET(request: NextRequest) {
  const activo = isTavusEnabled();
  const base = { activo, replicaPorDefecto: getReplicaPorDefecto() };

  if (!activo || request.nextUrl.searchParams.get('replicas') !== '1') {
    return NextResponse.json(base);
  }

  try {
    return NextResponse.json({ ...base, replicas: await listarReplicas() });
  } catch (error) {
    return NextResponse.json({
      ...base,
      replicas: [],
      error: error instanceof Error ? error.message : 'No se pudo consultar la lista de replicas.',
    });
  }
}

function codificar(evento: EventoTavus): Uint8Array {
  return new TextEncoder().encode(`${JSON.stringify(evento)}\n`);
}

/**
 * POST /api/assets/presentador
 * Encarga a Tavus un video de la persona digital diciendo el guion, y va
 * informando del progreso en NDJSON porque tarda varios minutos.
 */
export async function POST(request: NextRequest) {
  if (!isTavusEnabled()) {
    return NextResponse.json(
      {
        error: 'Video de presentador no configurado.',
        detail: 'Anade TAVUS_API_KEY a tu .env y reinicia el contenedor.',
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
        detail: problema ? problema.message : 'Revisa el guion y la persona digital.',
      },
      { status: 422 },
    );
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let cerrado = false;
      const enviar = (evento: EventoTavus) => {
        if (!cerrado) controller.enqueue(codificar(evento));
      };

      const arranque = Date.now();
      const transcurrido = () => Math.round((Date.now() - arranque) / 1000);

      try {
        const creado = await crearVideo({
          // Tavus LEE el texto en voz alta: sin tildes ni enies diria "anos".
          guion: repararAcentos(datos.guion),
          replicaId: datos.replicaId,
          nombre: datos.nombre,
          fondoUrl: datos.fondoUrl,
          fondoTransparente: datos.fondoTransparente,
        });

        enviar({ tipo: 'inicio', videoId: creado.id, replica: datos.replicaId });

        for (;;) {
          if (Date.now() - arranque > TIMEOUT_MS) {
            enviar({
              tipo: 'error',
              mensaje: 'Tavus tardo demasiado y dejamos de esperar.',
              detalle: `El video ${creado.id} puede seguir generandose en tu cuenta de Tavus.`,
            });
            return;
          }

          await new Promise((listo) => setTimeout(listo, INTERVALO_MS));
          const estado = await consultarVideo(creado.id);

          if (estado.estado === 'error') {
            enviar({
              tipo: 'error',
              mensaje: 'Tavus no pudo generar el video.',
              detalle: 'Revisa el guion y el estado de la persona digital en tu cuenta.',
            });
            return;
          }

          if (estado.estado !== 'ready') {
            enviar({ tipo: 'progreso', segundos: transcurrido(), estado: estado.estado });
            continue;
          }

          const url = estado.downloadUrl ?? estado.streamUrl ?? estado.hostedUrl;
          if (!url) {
            enviar({
              tipo: 'error',
              mensaje: 'El video esta listo pero Tavus no devolvio ninguna URL.',
            });
            return;
          }

          enviar({
            tipo: 'listo',
            url,
            hostedUrl: estado.hostedUrl,
            segundos: transcurrido(),
            videoId: estado.id,
          });
          return;
        }
      } catch (error) {
        enviar({
          tipo: 'error',
          mensaje: error instanceof TavusError ? describir(error) : 'Error inesperado con Tavus.',
          detalle: error instanceof Error ? error.message : undefined,
        });
        if (!(error instanceof TavusError)) console.error('[ConvertIA][tavus]', error);
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

function describir(error: TavusError): string {
  if (error.status === 401) return 'La clave de Tavus no es valida.';
  if (error.status === 402) return 'Tu cuenta de Tavus se quedo sin minutos.';
  if (error.status === 404) return 'Esa persona digital no existe en tu cuenta.';
  if (error.status === 429) return 'Demasiadas peticiones a Tavus. Espera un poco.';
  return `Tavus respondio con un error (${error.status}).`;
}
