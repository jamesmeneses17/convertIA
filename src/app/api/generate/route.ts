import Anthropic from '@anthropic-ai/sdk';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import {
  MAX_OUTPUT_TOKENS,
  SYSTEM_PROMPT,
  getModel,
  isGenerationEnabled,
  type GenerationEvent,
} from '@/lib/ai-config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  prompt: z.string().trim().min(50, 'El prompt esta vacio o es demasiado corto.').max(200_000),
});

/**
 * GET /api/generate
 * Le dice a la interfaz si el modo de generacion integrada esta disponible.
 * Nunca devuelve la clave: solo si existe.
 */
export function GET() {
  return NextResponse.json({
    enabled: isGenerationEnabled(),
    model: isGenerationEnabled() ? getModel() : null,
  });
}

function encodeEvent(event: GenerationEvent): Uint8Array {
  return new TextEncoder().encode(`${JSON.stringify(event)}\n`);
}

/**
 * POST /api/generate
 * Envia el Prompt Maestro a Claude y devuelve la respuesta en streaming
 * (NDJSON: un evento JSON por linea) para que la landing aparezca
 * escribiendose dentro del Visor de Codigo.
 */
export async function POST(request: NextRequest) {
  if (!isGenerationEnabled()) {
    return NextResponse.json(
      {
        error: 'Generacion integrada no configurada.',
        detail:
          'Anade ANTHROPIC_API_KEY a tu .env y reinicia el contenedor. Mientras tanto puedes copiar el Prompt Maestro y pegarlo en cualquier IA.',
      },
      { status: 501 },
    );
  }

  let prompt: string;
  try {
    prompt = bodySchema.parse(await request.json()).prompt;
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Peticion invalida.',
        detail: error instanceof z.ZodError ? error.issues[0]?.message : undefined,
      },
      { status: 422 },
    );
  }

  const model = getModel();
  const client = new Anthropic();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const send = (event: GenerationEvent) => {
        if (!closed) controller.enqueue(encodeEvent(event));
      };

      try {
        send({ type: 'start', model });

        const message = client.beta.messages.stream({
          model,
          max_tokens: MAX_OUTPUT_TOKENS,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: prompt }],
          // Pensamiento adaptativo: el encargo es complejo (estrategia + diseno + codigo).
          thinking: { type: 'adaptive' },
          // Si los clasificadores de seguridad rechazan la peticion, el servidor
          // la reintenta solo en un modelo de respaldo en la misma llamada.
          betas: ['server-side-fallback-2026-07-01'],
          fallbacks: 'default',
        });

        // Si el usuario cancela desde la interfaz, cortamos la generacion.
        request.signal.addEventListener('abort', () => stream_abort(message));

        for await (const event of message) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            send({ type: 'delta', text: event.delta.text });
          }
        }

        const final = await message.finalMessage();

        if (final.stop_reason === 'refusal') {
          send({
            type: 'error',
            message: 'El modelo declino esta peticion.',
            detail:
              final.stop_details && 'explanation' in final.stop_details
                ? String(final.stop_details.explanation ?? '')
                : 'Revisa el brief y vuelve a intentarlo.',
          });
        } else {
          send({
            type: 'done',
            stopReason: final.stop_reason,
            inputTokens: final.usage.input_tokens,
            outputTokens: final.usage.output_tokens,
            model: final.model,
          });
        }
      } catch (error) {
        send({
          type: 'error',
          message: describeError(error),
          detail: error instanceof Error ? error.message : undefined,
        });
      } finally {
        closed = true;
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-store, no-transform',
      // Evita que un proxy intermedio acumule el stream en un buffer.
      'X-Accel-Buffering': 'no',
    },
  });
}

/** Cancela el stream del SDK sin romper el handler si ya termino. */
function stream_abort(message: { abort: () => void }): void {
  try {
    message.abort();
  } catch {
    /* el stream ya estaba cerrado */
  }
}

/** Traduce los errores tipados del SDK a un mensaje util en la interfaz. */
function describeError(error: unknown): string {
  if (error instanceof Anthropic.AuthenticationError) {
    return 'La ANTHROPIC_API_KEY no es valida.';
  }
  if (error instanceof Anthropic.PermissionDeniedError) {
    return 'Tu clave no tiene permiso para este modelo.';
  }
  if (error instanceof Anthropic.NotFoundError) {
    return 'El modelo configurado no existe. Revisa ANTHROPIC_MODEL.';
  }
  if (error instanceof Anthropic.RateLimitError) {
    return 'Limite de peticiones alcanzado. Espera unos segundos y reintenta.';
  }
  if (error instanceof Anthropic.APIConnectionError) {
    return 'No se pudo conectar con la API de Anthropic.';
  }
  if (error instanceof Anthropic.APIError) {
    return `Error de la API (${error.status ?? 'sin codigo'}).`;
  }
  console.error('[ConvertIA][generate]', error);
  return 'Error inesperado durante la generacion.';
}
