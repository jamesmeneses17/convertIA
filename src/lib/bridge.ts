import { z } from 'zod';
import type { Handoff } from '@prisma/client';

/**
 * ============================================================================
 *  ConvertIA :: puente con Claude Escritorio (MCP)
 * ----------------------------------------------------------------------------
 *  No hay ninguna API de pago por medio. ConvertIA deja el Prompt Maestro en un
 *  buzon; Claude Escritorio lo recoge a traves del servidor MCP (mcp/server.mjs)
 *  usando TU suscripcion, genera la landing y la devuelve al mismo buzon.
 *  La pantalla esta escuchando y la renderiza sola.
 * ============================================================================
 */

/** Alfabeto sin caracteres ambiguos (nada de O/0, I/1) porque el codigo se dicta. */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Genera un codigo corto y legible tipo LP-7K2Q. */
export function generateHandoffCode(): string {
  let body = '';
  for (let index = 0; index < 4; index += 1) {
    body += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `LP-${body}`;
}

export type HandoffStatus = 'pendiente' | 'entregado' | 'cancelado';

/** landing = pide una pagina · prompt = pide que la IA escriba el Prompt Maestro */
export type HandoffTipo = 'landing' | 'prompt';

export interface HandoffDTO {
  code: string;
  name: string;
  tipo: HandoffTipo;
  status: HandoffStatus;
  createdAt: string;
  deliveredAt: string | null;
  notes: string | null;
  hasCode: boolean;
}

export interface HandoffWithCodeDTO extends HandoffDTO {
  prompt: string;
  html: string;
  css: string;
  js: string;
  /** Texto devuelto cuando el encargo era de tipo prompt. */
  resultado: string;
}

function toStatus(value: string): HandoffStatus {
  return value === 'entregado' || value === 'cancelado' ? value : 'pendiente';
}

function toTipo(value: string): HandoffTipo {
  return value === 'prompt' ? 'prompt' : 'landing';
}

export function serializeHandoff(handoff: Handoff): HandoffDTO {
  return {
    code: handoff.code,
    name: handoff.name,
    tipo: toTipo(handoff.tipo),
    status: toStatus(handoff.status),
    createdAt: handoff.createdAt.toISOString(),
    deliveredAt: handoff.deliveredAt?.toISOString() ?? null,
    notes: handoff.notes,
    hasCode: Boolean(handoff.html || handoff.css || handoff.js),
  };
}

export function serializeHandoffWithCode(handoff: Handoff): HandoffWithCodeDTO {
  return {
    ...serializeHandoff(handoff),
    prompt: handoff.prompt,
    html: handoff.html ?? '',
    css: handoff.css ?? '',
    js: handoff.js ?? '',
    resultado: handoff.resultado ?? '',
  };
}

// ---------------------------------------------------------------------------
//  Esquemas de entrada
// ---------------------------------------------------------------------------

export const createHandoffSchema = z.object({
  name: z.string().trim().min(1).max(120),
  prompt: z.string().trim().min(50, 'El prompt esta vacio o es demasiado corto.').max(200_000),
  tipo: z.enum(['landing', 'prompt']).default('landing'),
});

/** Entrega de un encargo de tipo prompt: la IA devuelve el Prompt Maestro. */
export const deliverPromptSchema = z.object({
  prompt_maestro: z
    .string()
    .trim()
    .min(500, 'El Prompt Maestro es demasiado corto para ser util.')
    .max(200_000),
  notes: z.string().max(500).optional(),
});

export const deliverHandoffSchema = z
  .object({
    html: z.string().max(400_000).optional(),
    css: z.string().max(200_000).optional(),
    js: z.string().max(200_000).optional(),
    /** Alternativa: la respuesta completa en markdown, ConvertIA la trocea. */
    respuesta: z.string().max(800_000).optional(),
    notes: z.string().max(500).optional(),
  })
  .refine(
    (value) =>
      Boolean(value.html?.trim() || value.css?.trim() || value.js?.trim() || value.respuesta?.trim()),
    { message: 'Envia html/css/js o el campo respuesta con el codigo.' },
  );

export type CreateHandoffInput = z.infer<typeof createHandoffSchema>;
export type DeliverHandoffInput = z.infer<typeof deliverHandoffSchema>;
export type DeliverPromptInput = z.infer<typeof deliverPromptSchema>;
