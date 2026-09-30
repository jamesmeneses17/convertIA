import type { HandoffDTO, HandoffWithCodeDTO } from '@/lib/bridge';

/**
 * Cliente del puente con Claude Escritorio.
 * La pantalla deja el encargo, y despues pregunta cada pocos segundos
 * si Claude ya devolvio la landing.
 */

export class BridgeError extends Error {
  readonly detail?: string;
  readonly dbUnavailable: boolean;

  constructor(message: string, detail?: string, dbUnavailable = false) {
    super(message);
    this.name = 'BridgeError';
    this.detail = detail;
    this.dbUnavailable = dbUnavailable;
  }
}

async function readError(response: Response): Promise<BridgeError> {
  const payload = (await response.json().catch(() => null)) as
    | { error?: string; detail?: string; dbUnavailable?: boolean }
    | null;
  return new BridgeError(
    payload?.error ?? `Error HTTP ${response.status}`,
    payload?.detail,
    Boolean(payload?.dbUnavailable),
  );
}

/** Deja el Prompt Maestro en el buzon y devuelve el codigo para dictarselo a Claude. */
export async function createHandoff(name: string, prompt: string): Promise<HandoffDTO> {
  const response = await fetch('/api/bridge/handoffs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, prompt }),
  });
  if (!response.ok) throw await readError(response);
  const payload = (await response.json()) as { handoff: HandoffDTO };
  return payload.handoff;
}

export interface BridgeMode {
  /** true cuando el servidor tiene carpeta compartida montada. */
  carpeta: boolean;
  /** Ruta que debe conectar el usuario en Claude Escritorio. */
  rutaCarpeta: string | null;
  archivoEncargo: string;
  archivoEntrega: string;
}

/** Averigua si el puente va por carpeta compartida o por servidor MCP. */
export async function fetchBridgeMode(): Promise<BridgeMode> {
  try {
    const response = await fetch('/api/bridge/status', { cache: 'no-store' });
    if (!response.ok) throw new Error('sin estado');
    return (await response.json()) as BridgeMode;
  } catch {
    return {
      carpeta: false,
      rutaCarpeta: null,
      archivoEncargo: 'ENCARGO-PENDIENTE.md',
      archivoEntrega: 'ENTREGA.html',
    };
  }
}

/** Encargos pendientes, para recuperar la espera despues de recargar la pagina. */
export async function listPendingHandoffs(): Promise<HandoffDTO[]> {
  const response = await fetch('/api/bridge/handoffs?status=pendiente&take=1', { cache: 'no-store' });
  if (!response.ok) throw await readError(response);
  const payload = (await response.json()) as { handoffs: HandoffDTO[] };
  return payload.handoffs;
}

/** Consulta el estado del encargo (y el codigo, si ya llego). */
export async function fetchHandoff(code: string): Promise<HandoffWithCodeDTO> {
  const response = await fetch(`/api/bridge/handoffs/${encodeURIComponent(code)}`, {
    cache: 'no-store',
  });
  if (!response.ok) throw await readError(response);
  const payload = (await response.json()) as { handoff: HandoffWithCodeDTO };
  return payload.handoff;
}

/** Cancela un encargo pendiente. */
export async function cancelHandoff(code: string): Promise<void> {
  const response = await fetch(`/api/bridge/handoffs/${encodeURIComponent(code)}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw await readError(response);
}
