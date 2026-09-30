import { promises as fs } from 'node:fs';
import path from 'node:path';

/**
 * ============================================================================
 *  ConvertIA :: generacion de video con Veo (API de Gemini)
 * ----------------------------------------------------------------------------
 *  Modulo OPCIONAL. Se activa solo si hay claves configuradas.
 *
 *  Admite varias claves y rota entre ellas: si una agota su cuota (429) o la
 *  rechaza el servicio (403), reintenta con la siguiente. Asi se estira el
 *  limite gratuito repartiendo el gasto entre dos cuentas.
 *
 *  OJO: el video de Veo se factura POR SEGUNDO de video generado. Un clip
 *  corto cuesta dolares, no centimos. Por eso la interfaz muestra siempre la
 *  duracion antes de lanzar nada.
 * ============================================================================
 */

const API_BASE = process.env.GEMINI_API_BASE?.trim() || 'https://generativelanguage.googleapis.com/v1beta';

/** Carpeta donde se guardan los clips generados (volumen del contenedor). */
const DIR_GENERADOS = process.env.GENERADOS_DIR?.trim() || '';

/** Modelo por defecto. Cambiable sin tocar codigo con GEMINI_VIDEO_MODEL. */
export const MODELO_POR_DEFECTO = process.env.GEMINI_VIDEO_MODEL?.trim() || 'veo-3.0-fast-generate-001';

/** Lee las claves de GEMINI_API_KEYS (separadas por coma) o GEMINI_API_KEY_1..4. */
export function getGeminiKeys(): string[] {
  const claves: string[] = [];

  const lista = process.env.GEMINI_API_KEYS?.trim();
  if (lista) {
    claves.push(...lista.split(',').map((clave) => clave.trim()).filter(Boolean));
  }

  for (let indice = 1; indice <= 4; indice += 1) {
    const clave = process.env[`GEMINI_API_KEY_${indice}`]?.trim();
    if (clave) claves.push(clave);
  }

  const suelta = process.env.GEMINI_API_KEY?.trim();
  if (suelta) claves.push(suelta);

  return [...new Set(claves)];
}

export function isVideoEnabled(): boolean {
  return getGeminiKeys().length > 0 && DIR_GENERADOS.length > 0;
}

export class GeminiError extends Error {
  readonly status: number;
  readonly cuota: boolean;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'GeminiError';
    this.status = status;
    // 429 = cuota agotada. 403 suele ser clave sin permiso para el modelo.
    this.cuota = status === 429 || status === 403;
  }
}

async function pedir(url: string, clave: string, init?: RequestInit): Promise<unknown> {
  const respuesta = await fetch(url, {
    ...init,
    headers: {
      'x-goog-api-key': clave,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const cuerpo = await respuesta.text();
  if (!respuesta.ok) {
    let detalle = cuerpo.slice(0, 400);
    try {
      const json = JSON.parse(cuerpo) as { error?: { message?: string } };
      if (json.error?.message) detalle = json.error.message;
    } catch {
      /* la respuesta no era JSON: nos quedamos con el texto */
    }
    throw new GeminiError(detalle, respuesta.status);
  }

  return cuerpo ? JSON.parse(cuerpo) : {};
}

/**
 * Ejecuta una operacion probando las claves en orden.
 * Si una se queda sin cuota, pasa a la siguiente en vez de fallar.
 */
async function conRotacion<T>(tarea: (clave: string) => Promise<T>): Promise<{ resultado: T; clave: string }> {
  const claves = getGeminiKeys();
  if (claves.length === 0) throw new GeminiError('No hay ninguna clave de Gemini configurada.', 401);

  let ultimo: unknown = null;

  for (const clave of claves) {
    try {
      return { resultado: await tarea(clave), clave };
    } catch (error) {
      ultimo = error;
      if (error instanceof GeminiError && error.cuota) continue; // probamos la siguiente
      throw error;
    }
  }

  throw ultimo instanceof Error
    ? ultimo
    : new GeminiError('Todas las claves de Gemini agotaron su cuota.', 429);
}

/** Pregunta a Google que modelos de video acepta la clave. Sirve de diagnostico. */
export async function listarModelosVideo(): Promise<string[]> {
  const { resultado } = await conRotacion(async (clave) => {
    return (await pedir(`${API_BASE}/models`, clave)) as {
      models?: { name?: string; supportedGenerationMethods?: string[] }[];
    };
  });

  return (resultado.models ?? [])
    .map((modelo) => modelo.name ?? '')
    .map((nombre) => nombre.replace(/^models\//, ''))
    .filter((nombre) => /veo|video/i.test(nombre))
    .sort();
}

export interface OpcionesVideo {
  modelo?: string;
  /** Relacion de aspecto: 16:9 para el hero de una landing. */
  aspecto?: string;
  /** Lo que NO debe salir en el clip. */
  negativo?: string;
}

/** Arranca la generacion. Devuelve el nombre de la operacion y la clave usada. */
export async function iniciarVideo(
  prompt: string,
  opciones: OpcionesVideo = {},
): Promise<{ operacion: string; clave: string; modelo: string }> {
  const modelo = opciones.modelo?.trim() || MODELO_POR_DEFECTO;

  const parametros: Record<string, unknown> = {
    aspectRatio: opciones.aspecto ?? '16:9',
  };
  if (opciones.negativo?.trim()) parametros.negativePrompt = opciones.negativo.trim();

  const { resultado, clave } = await conRotacion(async (clave) => {
    const respuesta = (await pedir(`${API_BASE}/models/${modelo}:predictLongRunning`, clave, {
      method: 'POST',
      body: JSON.stringify({ instances: [{ prompt }], parameters: parametros }),
    })) as { name?: string };

    if (!respuesta.name) {
      throw new GeminiError('La API acepto la peticion pero no devolvio operacion.', 502);
    }
    return respuesta.name;
  });

  return { operacion: resultado, clave, modelo };
}

export interface EstadoVideo {
  listo: boolean;
  uri?: string;
  error?: string;
}

/** Consulta si la operacion termino y, si termino, de donde se baja el clip. */
export async function consultarVideo(operacion: string, clave: string): Promise<EstadoVideo> {
  const respuesta = (await pedir(`${API_BASE}/${operacion}`, clave)) as {
    done?: boolean;
    error?: { message?: string };
    response?: {
      generateVideoResponse?: {
        generatedSamples?: { video?: { uri?: string } }[];
      };
      generatedVideos?: { video?: { uri?: string } }[];
    };
  };

  if (!respuesta.done) return { listo: false };
  if (respuesta.error?.message) return { listo: true, error: respuesta.error.message };

  // El nombre del campo ha cambiado entre versiones de la API: probamos los dos.
  const uri =
    respuesta.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri ??
    respuesta.response?.generatedVideos?.[0]?.video?.uri;

  if (!uri) {
    return { listo: true, error: 'La operacion termino pero no trajo ningun video.' };
  }
  return { listo: true, uri };
}

/** Baja el clip y lo guarda en la carpeta compartida. Devuelve el nombre del archivo. */
export async function guardarVideo(uri: string, clave: string, nombreBase: string): Promise<string> {
  if (!DIR_GENERADOS) throw new GeminiError('No hay carpeta donde guardar los videos.', 500);

  const respuesta = await fetch(uri, { headers: { 'x-goog-api-key': clave } });
  if (!respuesta.ok) {
    throw new GeminiError(`No se pudo descargar el video (HTTP ${respuesta.status}).`, respuesta.status);
  }

  const datos = Buffer.from(await respuesta.arrayBuffer());
  const archivo = `${nombreBase}-${Date.now()}.mp4`;

  await fs.mkdir(DIR_GENERADOS, { recursive: true });
  await fs.writeFile(path.join(DIR_GENERADOS, archivo), datos);

  return archivo;
}

/** Lee un clip ya guardado, para servirlo desde la propia app. */
export async function leerVideo(archivo: string): Promise<Buffer | null> {
  if (!DIR_GENERADOS) return null;
  // Nunca dejamos salir del directorio: solo nombre de archivo plano.
  const seguro = path.basename(archivo);
  try {
    return await fs.readFile(path.join(DIR_GENERADOS, seguro));
  } catch {
    return null;
  }
}

/** Eventos NDJSON que consume la interfaz mientras se genera. */
export type EventoVideo =
  | { tipo: 'inicio'; modelo: string; claves: number }
  | { tipo: 'progreso'; segundos: number; mensaje: string }
  | { tipo: 'listo'; url: string; archivo: string; segundos: number; modelo: string }
  | { tipo: 'error'; mensaje: string; detalle?: string };
