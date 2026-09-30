/**
 * ============================================================================
 *  ConvertIA :: fotos tematicas (Unsplash)
 * ----------------------------------------------------------------------------
 *  Las tecnicas piden a la IA que use https://picsum.photos/seed/PALABRA/W/H,
 *  donde PALABRA es una palabra clave en ingles que describe esa foto.
 *
 *  Si hay clave de Unsplash configurada, al entregar la landing cambiamos esas
 *  URLs por fotos reales que SI tienen que ver con el tema. La URL que queda
 *  escrita es la definitiva de Unsplash, asi que el HTML sigue funcionando
 *  aunque apagues ConvertIA.
 *
 *  Sin clave no pasa nada: se queda la de picsum, que tambien carga.
 * ============================================================================
 */

const API = 'https://api.unsplash.com/search/photos';

/** Captura https://picsum.photos/seed/PALABRA/ANCHO/ALTO */
const PICSUM = /https:\/\/picsum\.photos\/seed\/([A-Za-z0-9_,-]+)\/(\d{2,4})\/(\d{2,4})/g;

export function isFotosEnabled(): boolean {
  const clave = process.env.UNSPLASH_ACCESS_KEY?.trim();
  return typeof clave === 'string' && clave.length > 0;
}

interface RespuestaUnsplash {
  results?: { urls?: { raw?: string; regular?: string }; alt_description?: string | null }[];
}

/** Busca una foto para esa palabra clave. Devuelve null si no encuentra o falla. */
async function buscarFoto(palabra: string, ancho: number, alto: number): Promise<string | null> {
  const clave = process.env.UNSPLASH_ACCESS_KEY?.trim();
  if (!clave) return null;

  const consulta = palabra.replace(/[_-]+/g, ' ').trim();
  if (!consulta) return null;

  const orientacion = ancho >= alto ? 'landscape' : 'portrait';
  const url = `${API}?query=${encodeURIComponent(consulta)}&per_page=1&orientation=${orientacion}&content_filter=high`;

  try {
    const respuesta = await fetch(url, {
      headers: { Authorization: `Client-ID ${clave}`, 'Accept-Version': 'v1' },
      signal: AbortSignal.timeout(8000),
    });
    if (!respuesta.ok) {
      console.error(`[ConvertIA][fotos] Unsplash respondio ${respuesta.status} para "${consulta}"`);
      return null;
    }

    const datos = (await respuesta.json()) as RespuestaUnsplash;
    const primera = datos.results?.[0];
    if (!primera?.urls?.raw && !primera?.urls?.regular) return null;

    // Con `raw` podemos pedir el recorte exacto que necesita la maqueta.
    if (primera.urls.raw) {
      return `${primera.urls.raw}&w=${ancho}&h=${alto}&fit=crop&crop=entropy&q=80`;
    }
    return primera.urls.regular ?? null;
  } catch (error) {
    console.error('[ConvertIA][fotos] fallo la busqueda', error);
    return null;
  }
}

/**
 * Cambia las fotos de relleno por fotos reales del tema.
 * Si algo falla, devuelve el HTML tal cual: nunca rompe la entrega.
 */
export async function ponerFotosTematicas(html: string): Promise<{ html: string; cambiadas: number }> {
  if (!isFotosEnabled() || !html) return { html, cambiadas: 0 };

  const coincidencias = [...html.matchAll(PICSUM)];
  if (coincidencias.length === 0) return { html, cambiadas: 0 };

  // Una sola busqueda por palabra clave, aunque se repita en varias imagenes.
  const buscadas = new Map<string, string | null>();

  for (const [, palabra, ancho, alto] of coincidencias) {
    const llave = `${palabra}|${ancho}x${alto}`;
    if (buscadas.has(llave)) continue;
    buscadas.set(llave, await buscarFoto(palabra ?? '', Number(ancho), Number(alto)));
  }

  let cambiadas = 0;
  const resultado = html.replace(PICSUM, (original, palabra: string, ancho: string, alto: string) => {
    const encontrada = buscadas.get(`${palabra}|${ancho}x${alto}`);
    
    // Si Unsplash NO encuentra foto o falla, en lugar de dejar picsum, devolvemos un placeholder que dice "Error Unsplash"
    if (!encontrada) {
      return `https://via.placeholder.com/${ancho}x${alto}?text=Error+Unsplash+(${palabra})`;
    }
    
    cambiadas += 1;
    return encontrada;
  });

  return { html: resultado, cambiadas };
}
