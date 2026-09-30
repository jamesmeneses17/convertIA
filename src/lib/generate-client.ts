import type { GenerationEvent } from '@/lib/ai-config';

/**
 * ============================================================================
 *  ConvertIA :: cliente del modo de generacion integrada
 * ----------------------------------------------------------------------------
 *  Consume el stream NDJSON de /api/generate y va entregando el texto conforme
 *  llega, para que la landing se vea escribiendose en el Visor de Codigo.
 * ============================================================================
 */

export interface GenerationStatus {
  enabled: boolean;
  model: string | null;
}

/** Consulta si el servidor tiene configurada la clave (el boton se muestra o no). */
export async function fetchGenerationStatus(): Promise<GenerationStatus> {
  try {
    const response = await fetch('/api/generate', { method: 'GET' });
    if (!response.ok) return { enabled: false, model: null };
    return (await response.json()) as GenerationStatus;
  } catch {
    return { enabled: false, model: null };
  }
}

export interface GenerationResult {
  text: string;
  stopReason: string | null;
  inputTokens: number;
  outputTokens: number;
  model: string;
}

export interface StreamOptions {
  onDelta: (fullText: string, chunk: string) => void;
  signal?: AbortSignal;
}

export class GenerationError extends Error {
  readonly detail?: string;

  constructor(message: string, detail?: string) {
    super(message);
    this.name = 'GenerationError';
    this.detail = detail;
  }
}

/** Lanza la generacion y resuelve con el texto completo cuando termina. */
export async function streamGeneration(
  prompt: string,
  { onDelta, signal }: StreamOptions,
): Promise<GenerationResult> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
    signal,
  });

  if (!response.ok || !response.body) {
    const payload = (await response.json().catch(() => null)) as
      | { error?: string; detail?: string }
      | null;
    throw new GenerationError(
      payload?.error ?? 'No se pudo iniciar la generacion.',
      payload?.detail,
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = '';
  let text = '';
  let result: GenerationResult | null = null;

  const handleLine = (line: string) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    let event: GenerationEvent;
    try {
      event = JSON.parse(trimmed) as GenerationEvent;
    } catch {
      return; // linea partida por el transporte: se ignora
    }

    if (event.type === 'delta') {
      text += event.text;
      onDelta(text, event.text);
      return;
    }
    if (event.type === 'error') {
      throw new GenerationError(event.message, event.detail);
    }
    if (event.type === 'done') {
      result = {
        text,
        stopReason: event.stopReason,
        inputTokens: event.inputTokens,
        outputTokens: event.outputTokens,
        model: event.model,
      };
    }
  };

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) handleLine(line);
    }
    if (buffer) handleLine(buffer);
  } finally {
    reader.releaseLock();
  }

  if (!result) {
    if (text.trim()) {
      // El stream se corto pero hay codigo utilizable: lo damos por bueno.
      return { text, stopReason: 'incomplete', inputTokens: 0, outputTokens: 0, model: '' };
    }
    throw new GenerationError('La generacion termino sin devolver contenido.');
  }

  return result;
}
