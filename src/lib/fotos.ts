/**
 * ============================================================================
 *  ConvertIA :: fotos tematicas (Unsplash)
 * ----------------------------------------------------------------------------
 *  Las landings salen con imagenes GENERADAS con IA por Pollinations, porque no
 *  cuestan nada y siempre tienen que ver con el tema. Pero a veces una foto
 *  real de banco queda mejor que una imagen de IA, sobre todo en caras y manos.
 *
 *  Este modulo cambia las imagenes del HTML por fotos reales de Unsplash.
 *  Reconoce las dos procedencias que puede haber escrito la IA:
 *
 *    - Pollinations: el texto de busqueda sale del propio enlace, que lleva
 *      dentro la descripcion en ingles de esa foto.
 *    - Picsum (landings antiguas): el texto sale de la semilla.
 *
 *  La URL que queda escrita es la definitiva de Unsplash, asi que el HTML sigue
 *  funcionando aunque apagues ConvertIA.
 *
 *  Sin clave no pasa nada: no se toca el HTML.
 * ============================================================================
 */

const API = 'https://api.unsplash.com/search/photos';

/** Captura https://picsum.photos/seed/PALABRA/ANCHO/ALTO */
const PICSUM = /https:\/\/picsum\.photos\/seed\/([A-Za-z0-9_,-]+)\/(\d{2,4})\/(\d{2,4})/g;

/** Captura https://image.pollinations.ai/prompt/TEXTO?width=...&height=... */
const POLLINATIONS = /https:\/\/image\.pollinations\.ai\/prompt\/[^"'\s<>)]+/g;

/**
 * Palabras de direccion de arte que describen COMO se ve la imagen, no QUE hay
 * en ella. A un generador de IA le sirven; a un buscador de fotos solo le
 * estorban, porque ninguna foto real esta etiquetada como "8k" o "cinematic".
 */
const RUIDO = new Set([
  'a', 'an', 'the', 'of', 'in', 'on', 'at', 'with', 'and', 'for', 'very', 'highly',
  'cinematic', 'photorealistic', 'realistic', 'photo', 'photography', 'photograph',
  'shot', 'image', 'picture', 'render', 'rendering', 'detailed', 'detail', 'details',
  'quality', 'high', 'ultra', '4k', '8k', 'hd', 'hdr', 'sharp', 'focus', 'bokeh',
  'lighting', 'light', 'lit', 'soft', 'warm', 'cool', 'moody', 'dramatic', 'natural',
  'golden', 'hour', 'studio', 'background', 'style', 'styled', 'professional',
  'beautiful', 'stunning', 'award', 'winning', 'masterpiece', 'no', 'text', 'watermark',
  'closeup', 'close', 'up', 'wide', 'angle', 'lens', 'mm', 'depth', 'field', 'film',
  'grain', 'muted', 'tones', 'palette', 'color', 'colors', 'colour', 'vibrant',
]);

export function isFotosEnabled(): boolean {
  const clave = process.env.UNSPLASH_ACCESS_KEY?.trim();
  return typeof clave === 'string' && clave.length > 0;
}

/**
 * Convierte el prompt largo de una imagen de IA en una consulta corta de
 * busqueda. Unsplash funciona mucho mejor con 3 o 4 sustantivos que con una
 * frase de veinte palabras llena de direccion de arte.
 */
export function consultaDesdePrompt(texto: string): string {
  const palabras = texto
    .replace(/[_+\-,./]+/g, ' ')
    .toLowerCase()
    .split(/\s+/)
    .filter((palabra) => palabra.length > 2 && !RUIDO.has(palabra) && !/^\d+$/.test(palabra));

  return palabras.slice(0, 4).join(' ').trim();
}

interface Objetivo {
  /** La URL literal tal y como aparece en el HTML. */
  url: string;
  consulta: string;
  ancho: number;
  alto: number;
}

/** Lee un entero de los parametros de la URL, con valor por defecto. */
function entero(params: URLSearchParams, nombre: string, porDefecto: number): number {
  const crudo = Number(params.get(nombre));
  return Number.isFinite(crudo) && crudo >= 50 && crudo <= 4000 ? Math.round(crudo) : porDefecto;
}

/** Encuentra todas las imagenes sustituibles del documento. */
function localizarObjetivos(html: string, incluirPollinations: boolean): Objetivo[] {
  const objetivos: Objetivo[] = [];

  for (const coincidencia of html.matchAll(PICSUM)) {
    objetivos.push({
      url: coincidencia[0],
      consulta: (coincidencia[1] ?? '').replace(/[_,-]+/g, ' ').trim(),
      ancho: Number(coincidencia[2]) || 1200,
      alto: Number(coincidencia[3]) || 800,
    });
  }

  if (!incluirPollinations) return objetivos;

  for (const coincidencia of html.matchAll(POLLINATIONS)) {
    const url = coincidencia[0];
    // La IA a veces escribe &amp; dentro del atributo; hay que normalizarlo.
    const normalizada = url.replace(/&amp;/g, '&');
    const corte = normalizada.indexOf('?');
    const ruta = corte === -1 ? normalizada : normalizada.slice(0, corte);
    const params = new URLSearchParams(corte === -1 ? '' : normalizada.slice(corte + 1));

    let prompt = ruta.replace('https://image.pollinations.ai/prompt/', '');
    try {
      prompt = decodeURIComponent(prompt.replace(/\+/g, ' '));
    } catch {
      prompt = prompt.replace(/%20|\+/g, ' ');
    }

    const consulta = consultaDesdePrompt(prompt);
    if (!consulta) continue;

    objetivos.push({
      url,
      consulta,
      ancho: entero(params, 'width', 1200),
      alto: entero(params, 'height', 800),
    });
  }

  return objetivos;
}

/**
 * Ultimo recurso cuando Unsplash no encuentra nada.
 *
 * Picsum devuelve una foto cualquiera, sin relacion con el tema, pero SIEMPRE
 * responde. Entre una foto neutra y un recuadro roto, gana la foto neutra: el
 * hueco vacio hace que la pagina entera parezca a medio hacer.
 */
function respaldoPicsum(consulta: string, ancho: number, alto: number): string {
  const semilla = consulta.replace(/[^a-z0-9]+/gi, '').slice(0, 24) || 'convertia';
  return `https://picsum.photos/seed/${semilla}/${ancho}/${alto}`;
}

interface RespuestaUnsplash {
  results?: { urls?: { raw?: string; regular?: string }; alt_description?: string | null }[];
}

interface ResultadoBusqueda {
  url: string | null;
  /** Peticiones que le quedan a la clave en esta hora, si Unsplash lo informa. */
  restantes: number | null;
  /** Motivo del fallo, para poder explicarlo en la interfaz. */
  error: string | null;
}

/** Busca una foto para esa consulta. Devuelve null si no encuentra o falla. */
async function buscarFoto(consulta: string, ancho: number, alto: number): Promise<ResultadoBusqueda> {
  const clave = process.env.UNSPLASH_ACCESS_KEY?.trim();
  if (!clave) return { url: null, restantes: null, error: 'Sin clave de Unsplash.' };
  if (!consulta) return { url: null, restantes: null, error: 'Sin palabras de busqueda.' };

  const orientacion = ancho >= alto ? 'landscape' : 'portrait';
  const url = `${API}?query=${encodeURIComponent(consulta)}&per_page=1&orientation=${orientacion}&content_filter=high`;

  try {
    const respuesta = await fetch(url, {
      headers: { Authorization: `Client-ID ${clave}`, 'Accept-Version': 'v1' },
      signal: AbortSignal.timeout(8000),
    });

    const cabecera = respuesta.headers.get('x-ratelimit-remaining');
    const restantes = cabecera === null ? null : Number(cabecera);

    if (respuesta.status === 403) {
      return {
        url: null,
        restantes,
        error: 'Unsplash agoto el limite de la clave (50 busquedas por hora en el plan de pruebas).',
      };
    }
    if (respuesta.status === 401) {
      return { url: null, restantes, error: 'Unsplash rechazo la clave (401).' };
    }
    if (!respuesta.ok) {
      return { url: null, restantes, error: `Unsplash respondio ${respuesta.status}.` };
    }

    const datos = (await respuesta.json()) as RespuestaUnsplash;
    const primera = datos.results?.[0];

    if (!primera?.urls?.raw && !primera?.urls?.regular) {
      return { url: null, restantes, error: `Sin resultados para "${consulta}".` };
    }

    // Con `raw` podemos pedir el recorte exacto que necesita la maqueta.
    if (primera.urls.raw) {
      return {
        url: `${primera.urls.raw}&w=${ancho}&h=${alto}&fit=crop&crop=entropy&q=80`,
        restantes,
        error: null,
      };
    }
    return { url: primera.urls.regular ?? null, restantes, error: null };
  } catch (error) {
    return {
      url: null,
      restantes: null,
      error: error instanceof Error ? error.message : 'Fallo la conexion con Unsplash.',
    };
  }
}

export interface ResultadoFotos {
  html: string;
  cambiadas: number;
  /** Cuantas imagenes se intentaron cambiar en total. */
  intentadas: number;
  restantes: number | null;
  /** Avisos legibles: sin resultados, limite agotado, etc. */
  avisos: string[];
}

/**
 * Cambia las imagenes del HTML por fotos reales de Unsplash.
 * Si algo falla, devuelve el HTML tal cual: nunca rompe la entrega.
 *
 * @param incluirPollinations  true para cambiar tambien las imagenes de IA.
 *                             Con false solo toca las de relleno (picsum).
 */
export async function cambiarPorFotosReales(
  html: string,
  incluirPollinations: boolean,
  opciones: { respaldo?: boolean } = {},
): Promise<ResultadoFotos> {
  const vacio: ResultadoFotos = { html, cambiadas: 0, intentadas: 0, restantes: null, avisos: [] };
  if (!html) return vacio;

  // Sin clave todavia tiene sentido entrar, pero solo para poner el respaldo:
  // desde que Pollinations dejo de ser anonimo, sus URLs no cargan solas.
  if (!isFotosEnabled() && !opciones.respaldo) return vacio;

  const objetivos = localizarObjetivos(html, incluirPollinations);
  if (objetivos.length === 0) return vacio;

  // Una sola busqueda por consulta, aunque se repita en varias imagenes:
  // el plan de pruebas de Unsplash solo da 50 peticiones por hora.
  const buscadas = new Map<string, string | null>();
  const avisos: string[] = [];
  let restantes: number | null = null;

  for (const objetivo of objetivos) {
    const llave = `${objetivo.consulta}|${objetivo.ancho}x${objetivo.alto}`;
    if (buscadas.has(llave)) continue;
    if (!isFotosEnabled()) {
      buscadas.set(llave, null);
      continue;
    }

    const resultado = await buscarFoto(objetivo.consulta, objetivo.ancho, objetivo.alto);
    buscadas.set(llave, resultado.url);

    if (resultado.restantes !== null) restantes = resultado.restantes;
    if (resultado.error && !avisos.includes(resultado.error)) avisos.push(resultado.error);

    // Si se agoto el limite no tiene sentido seguir pidiendo.
    if (resultado.error?.includes('limite')) break;
  }

  let resultado = html;
  let cambiadas = 0;

  let conRespaldo = 0;

  for (const objetivo of objetivos) {
    const encontrada = buscadas.get(`${objetivo.consulta}|${objetivo.ancho}x${objetivo.alto}`);
    const nueva =
      encontrada ??
      (opciones.respaldo ? respaldoPicsum(objetivo.consulta, objetivo.ancho, objetivo.alto) : null);

    if (!nueva) continue;
    if (!resultado.includes(objetivo.url)) continue;

    resultado = resultado.split(objetivo.url).join(nueva);
    cambiadas += 1;
    if (!encontrada) conRespaldo += 1;
  }

  if (conRespaldo > 0) {
    avisos.push(
      `${conRespaldo} ${conRespaldo === 1 ? 'imagen quedo' : 'imagenes quedaron'} con foto de relleno ` +
        'de Picsum: Unsplash no encontro nada para su descripcion.',
    );
  }

  return { html: resultado, cambiadas, intentadas: objetivos.length, restantes, avisos };
}

/**
 * Sustitucion automatica al entregar una landing.
 *
 * Cambia TODAS las imagenes por fotos reales de Unsplash, incluidas las que la
 * IA escribio como enlaces de Pollinations.
 *
 * Por que automatica y no opcional: Pollinations dejo de servir imagenes
 * anonimas (devuelve 402 Payment Required), asi que esos enlaces ya no cargan
 * en el navegador. Si no se sustituyen aqui, la landing llega con los huecos
 * rotos. Lo que no encuentre Unsplash se rellena con Picsum, que siempre
 * responde, para que nunca quede un recuadro vacio.
 */
export async function ponerFotosTematicas(html: string): Promise<{ html: string; cambiadas: number }> {
  const resultado = await cambiarPorFotosReales(html, true, { respaldo: true });
  return { html: resultado.html, cambiadas: resultado.cambiadas };
}
