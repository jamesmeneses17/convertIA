/**
 * ============================================================================
 *  ConvertIA :: configuracion del modo de generacion integrada (opcional)
 * ----------------------------------------------------------------------------
 *  ConvertIA funciona sin ninguna API: compila el Prompt Maestro y tu lo pegas
 *  en la IA que quieras. Este modulo activa un modo EXTRA y opcional en el que
 *  la propia app llama a Claude y trae la landing sin salir de la pantalla.
 *
 *  Se activa solo si existe ANTHROPIC_API_KEY en el entorno del servidor.
 *  La clave nunca sale del servidor: no se expone con NEXT_PUBLIC_.
 * ============================================================================
 */

/** Modelo por defecto. Se puede cambiar con ANTHROPIC_MODEL. */
export const DEFAULT_MODEL = 'claude-opus-5';

/** Streaming: damos margen amplio porque una landing completa es larga. */
export const MAX_OUTPUT_TOKENS = 64_000;

export function getModel(): string {
  const model = process.env.ANTHROPIC_MODEL?.trim();
  return model && model.length > 0 ? model : DEFAULT_MODEL;
}

/** true cuando hay clave configurada y, por tanto, el boton debe aparecer. */
export function isGenerationEnabled(): boolean {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  return typeof key === 'string' && key.length > 0;
}

/**
 * Instruccion de sistema. El Prompt Maestro ya lleva todo el encargo;
 * esto solo blinda el formato de salida para que el Visor de Codigo pueda
 * separar HTML, CSS y JS de forma fiable.
 */
export const SYSTEM_PROMPT = [
  'Eres un director de arte digital y desarrollador front-end senior.',
  'Entregas landing pages completas, listas para publicar, sin dependencias externas.',
  '',
  'REGLAS DE FORMATO DE RESPUESTA (obligatorias):',
  '- Empieza directamente por el codigo. Nada de preambulos ni de "aqui tienes".',
  '- Devuelve el documento completo en UN bloque cercado con ```html.',
  '- Si separas hojas de estilo o scripts, usa bloques ```css y ```js adicionales.',
  '- Despues del codigo puedes anadir las secciones de apoyo que pida el encargo.',
  '- Nunca dejes TODO, lorem ipsum ni secciones a medias.',
].join('\n');

/** Eventos del stream NDJSON que consume el cliente. */
export type GenerationEvent =
  | { type: 'start'; model: string }
  | { type: 'delta'; text: string }
  | { type: 'done'; stopReason: string | null; inputTokens: number; outputTokens: number; model: string }
  | { type: 'error'; message: string; detail?: string };
