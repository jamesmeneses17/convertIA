/**
 * Puente con la sesion activa de Claude (Escritorio o Web).
 * ConvertIA no consume ninguna API de pago: reutiliza la sesion que el usuario
 * ya tiene abierta. Por eso el prompt se copia SIEMPRE al portapapeles y,
 * adicionalmente, se intenta precargar en la ventana de conversacion.
 */
import { copyToClipboard } from '@/lib/utils';

const CLAUDE_WEB_URL = process.env.NEXT_PUBLIC_CLAUDE_WEB_URL ?? 'https://claude.ai/new';

/** Limite prudente para no romper la URL en navegadores/proxies. */
const MAX_QUERY_LENGTH = 6000;

export type ClaudeLaunchResult =
  | { status: 'prefilled'; copied: boolean }
  | { status: 'copied-open'; copied: boolean }
  | { status: 'failed'; copied: boolean };

/**
 * Abre Claude en una pestana nueva.
 * - Si el prompt es corto, lo precarga en el campo de mensaje (?q=).
 * - Si es largo, abre la conversacion en blanco: el prompt ya quedo copiado
 *   y basta con pegarlo (Ctrl+V / Cmd+V).
 */
export async function openInClaude(prompt: string): Promise<ClaudeLaunchResult> {
  const copied = await copyToClipboard(prompt);
  const encoded = encodeURIComponent(prompt);
  const canPrefill = encoded.length <= MAX_QUERY_LENGTH;
  const url = canPrefill ? `${CLAUDE_WEB_URL}?q=${encoded}` : CLAUDE_WEB_URL;

  const win = window.open(url, '_blank', 'noopener,noreferrer');
  if (!win) return { status: 'failed', copied };

  return { status: canPrefill ? 'prefilled' : 'copied-open', copied };
}
