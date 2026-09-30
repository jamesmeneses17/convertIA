/**
 * ============================================================================
 *  ConvertIA :: video de presentador con Tavus
 * ----------------------------------------------------------------------------
 *  IMPORTANTE, para no llevarse sorpresas: Tavus NO genera escenas ni convierte
 *  una imagen en video. Lo que hace es grabar a una "replica" (una persona
 *  digital) diciendo el guion que le pases.
 *
 *  Para una landing eso encaja en un sitio concreto: el video de presentacion,
 *  donde alguien explica la oferta en 30-60 segundos. El plano de ambiente del
 *  hero sigue siendo cosa de otro servicio (Veo, Runway) o de la foto de poster.
 *
 *  Se activa con TAVUS_API_KEY. Sin clave, el panel no aparece.
 * ============================================================================
 */

const API = 'https://tavusapi.com/v2';

export function isTavusEnabled(): boolean {
  const clave = process.env.TAVUS_API_KEY?.trim();
  return typeof clave === 'string' && clave.length > 0;
}

/** Replica por defecto. Se puede fijar en el .env para no elegirla cada vez. */
export function getReplicaPorDefecto(): string {
  return process.env.TAVUS_REPLICA_ID?.trim() ?? '';
}

export class TavusError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'TavusError';
    this.status = status;
  }
}

async function pedir(ruta: string, init?: RequestInit): Promise<unknown> {
  const clave = process.env.TAVUS_API_KEY?.trim();
  if (!clave) throw new TavusError('No hay clave de Tavus configurada.', 401);

  const respuesta = await fetch(`${API}${ruta}`, {
    ...init,
    headers: { 'x-api-key': clave, 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    signal: AbortSignal.timeout(20_000),
  });

  const cuerpo = await respuesta.text();
  if (!respuesta.ok) {
    let detalle = cuerpo.slice(0, 300);
    try {
      const json = JSON.parse(cuerpo) as { message?: string; error?: string };
      detalle = json.message ?? json.error ?? detalle;
    } catch {
      /* no era JSON */
    }
    throw new TavusError(detalle, respuesta.status);
  }

  return cuerpo ? JSON.parse(cuerpo) : {};
}

export interface Replica {
  id: string;
  nombre: string;
  estado: string;
}

/** Lista las personas digitales disponibles en tu cuenta. */
export async function listarReplicas(): Promise<Replica[]> {
  const datos = (await pedir('/replicas')) as {
    data?: { replica_id?: string; replica_name?: string; status?: string }[];
  };

  return (datos.data ?? [])
    .filter((item) => item.replica_id)
    .map((item) => ({
      id: item.replica_id as string,
      nombre: item.replica_name ?? item.replica_id ?? 'sin nombre',
      estado: item.status ?? 'desconocido',
    }));
}

export interface VideoTavus {
  id: string;
  estado: string;
  hostedUrl: string | null;
  downloadUrl: string | null;
  streamUrl: string | null;
}

function aVideo(datos: Record<string, unknown>): VideoTavus {
  const texto = (clave: string) => {
    const valor = datos[clave];
    return typeof valor === 'string' && valor.length > 0 ? valor : null;
  };

  return {
    id: String(datos.video_id ?? ''),
    estado: String(datos.status ?? 'queued'),
    hostedUrl: texto('hosted_url'),
    downloadUrl: texto('download_url'),
    streamUrl: texto('stream_url'),
  };
}

export interface OpcionesVideo {
  guion: string;
  replicaId: string;
  nombre?: string;
  /** Fondo opcional: una imagen o pagina que se ve detras del presentador. */
  fondoUrl?: string;
  /** true quita el fondo, util para superponer al presentador en la landing. */
  fondoTransparente?: boolean;
}

/** Encarga el video. Devuelve el identificador para consultar el progreso. */
export async function crearVideo(opciones: OpcionesVideo): Promise<VideoTavus> {
  const cuerpo: Record<string, unknown> = {
    replica_id: opciones.replicaId,
    script: opciones.guion,
    video_name: (opciones.nombre ?? 'Presentador ConvertIA').slice(0, 120),
  };

  if (opciones.fondoUrl?.trim()) cuerpo.background_source_url = opciones.fondoUrl.trim();
  if (opciones.fondoTransparente) cuerpo.transparent_background = true;

  const datos = (await pedir('/videos', {
    method: 'POST',
    body: JSON.stringify(cuerpo),
  })) as Record<string, unknown>;

  return aVideo(datos);
}

/** Consulta como va. Cuando `estado` sea "ready" tendras las URLs. */
export async function consultarVideo(videoId: string): Promise<VideoTavus> {
  const datos = (await pedir(`/videos/${encodeURIComponent(videoId)}`)) as Record<string, unknown>;
  return aVideo(datos);
}

/** Eventos NDJSON que consume la interfaz mientras se genera. */
export type EventoTavus =
  | { tipo: 'inicio'; videoId: string; replica: string }
  | { tipo: 'progreso'; segundos: number; estado: string }
  | { tipo: 'listo'; url: string; hostedUrl: string | null; segundos: number; videoId: string }
  | { tipo: 'error'; mensaje: string; detalle?: string };
