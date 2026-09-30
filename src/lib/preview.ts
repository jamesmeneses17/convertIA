import { repararAcentos } from '@/lib/locucion';
import type { PastedCode } from '@/lib/types';

/**
 * ============================================================================
 *  ConvertIA :: Visor de Codigo Integrado
 * ----------------------------------------------------------------------------
 *  Toma el HTML/CSS/JS que devolvio la IA y lo ensambla en un documento unico
 *  que se inyecta en un <iframe sandbox> para previsualizar la landing en vivo.
 * ============================================================================
 */

export const EMPTY_CODE: PastedCode = { html: '', css: '', js: '' };

export function isCodeEmpty(code: PastedCode): boolean {
  return !code.html.trim() && !code.css.trim() && !code.js.trim();
}

/** Detecta si el HTML pegado ya es un documento completo. */
export function isFullDocument(html: string): boolean {
  const head = html.trimStart().slice(0, 600).toLowerCase();
  return head.includes('<!doctype html') || head.includes('<html');
}

/** Inserta un fragmento antes de </head> o, si no existe, al inicio del body. */
function injectIntoHead(document: string, fragment: string): string {
  if (!fragment.trim()) return document;
  if (/<\/head>/i.test(document)) {
    return document.replace(/<\/head>/i, `${fragment}\n</head>`);
  }
  if (/<body[^>]*>/i.test(document)) {
    return document.replace(/<body[^>]*>/i, (match) => `${match}\n${fragment}`);
  }
  return `${fragment}\n${document}`;
}

/** Inserta un fragmento antes de </body> o al final del documento. */
function injectIntoBody(document: string, fragment: string): string {
  if (!fragment.trim()) return document;
  if (/<\/body>/i.test(document)) {
    return document.replace(/<\/body>/i, `${fragment}\n</body>`);
  }
  return `${document}\n${fragment}`;
}

const RESET = [
  '<style data-convertia="reset">',
  '  html{-webkit-text-size-adjust:100%}',
  '  body{margin:0;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}',
  '  img,video,svg{max-width:100%;height:auto}',
  '  /* Un <video> sin fuente se ve como un recuadro negro roto: lo ocultamos */',
  '  /* hasta que ConvertIA le pone el archivo. Lo mismo con su seccion. */',
  '  video:not([src]):not(:has(source[src])){display:none}',
  '  #presentador-convertia:not(:has(video[src])):not(:has(source[src])){display:none}',
  '  *,*::before,*::after{box-sizing:border-box}',
  '</style>',
].join('\n');

/**
 * Ensambla el documento final para el iframe.
 * - Si el HTML ya es un documento completo, inyecta el CSS y el JS extra.
 * - Si es un fragmento, lo envuelve en un documento minimo.
 */
/**
 * Script de diagnostico que solo vive en la previsualizacion.
 *
 * Etiqueta cada <img> con el servicio del que viene, para que al pasar el raton
 * por encima se vea de donde salio, y avisa a ConvertIA de cuales han cargado y
 * cuales no. Nunca se incluye en el archivo que descargas.
 */
const SONDA_IMAGENES = [
  '<script data-convertia="sonda-imagenes">',
  '(function(){',
  '  function servicio(u){',
  '    u = String(u || "");',
  '    if (u.indexOf("data:") === 0) return "Incrustada";',
  '    var h = "";',
  '    try { h = new URL(u, location.href).hostname.toLowerCase(); } catch (e) { h = ""; }',
  '    if (h.indexOf("pollinations") > -1) return "Pollinations";',
  '    if (h.indexOf("unsplash") > -1) return "Unsplash";',
  '    if (h.indexOf("picsum") > -1) return "Picsum";',
  '    if (h.indexOf("placehold") > -1 || h.indexOf("dummyimage") > -1) return "Marcador";',
  '    return h || "Archivo local";',
  '  }',
  '  function revisar(){',
  '    var imgs = document.querySelectorAll("img");',
  '    var lista = [];',
  '    for (var i = 0; i < imgs.length; i++) {',
  '      var img = imgs[i];',
  '      var s = servicio(img.currentSrc || img.getAttribute("src"));',
  '      var roto = img.complete && img.naturalWidth === 0;',
  '      img.title = roto ? (s + " - no cargo") : ("Imagen de " + s);',
  '      if (roto) {',
  '        img.setAttribute("data-convertia-fallo", s);',
  '        if (img.alt.indexOf("[") !== 0) img.alt = "[" + s + " no cargo] " + img.alt;',
  '      }',
  '      lista.push({ servicio: s, ok: !roto });',
  '    }',
  '    try { parent.postMessage({ tipo: "convertia:imagenes", items: lista }, "*"); } catch (e) {}',
  '  }',
  '  window.addEventListener("load", revisar);',
  '  document.addEventListener("error", revisar, true);',
  '  setTimeout(revisar, 2500);',
  '  setTimeout(revisar, 8000);',
  '})();',
  '</script>',
  '<style data-convertia="sonda-estilo">',
  '  img[data-convertia-fallo]{min-height:96px;background:repeating-linear-gradient(45deg,#3a2020,#3a2020 8px,#2b1818 8px,#2b1818 16px);outline:1px dashed #b45757;outline-offset:-1px}',
  '</style>',
].join('\n');

export interface PreviewOptions {
  /** Inyecta la sonda de imagenes. Falso para el archivo que se descarga. */
  sonda?: boolean;
}

export function composePreviewDocument(code: PastedCode, options: PreviewOptions = {}): string {
  const css = code.css.trim() ? `<style data-convertia="user-css">\n${code.css}\n</style>` : '';
  const js = code.js.trim() ? `<script data-convertia="user-js">\n${code.js}\n</script>` : '';
  const html = code.html.trim();

  if (!html && !css && !js) return '';

  const sonda = options.sonda === false ? '' : SONDA_IMAGENES;

  if (html && isFullDocument(html)) {
    let output = html;
    output = injectIntoHead(output, RESET);
    output = injectIntoHead(output, css);
    output = injectIntoBody(output, js);
    output = injectIntoBody(output, sonda);
    return output;
  }

  return [
    '<!DOCTYPE html>',
    '<html lang="es">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<title>Previsualizacion ConvertIA</title>',
    RESET,
    css,
    '</head>',
    '<body>',
    html,
    js,
    sonda,
    '</body>',
    '</html>',
  ]
    .filter((part) => part.length > 0)
    .join('\n');
}

/**
 * De que servicio viene una imagen, mirando su URL. Es lo unico que hace falta:
 * en Pollinations el propio enlace lleva dentro el texto que genera la imagen.
 */
export function servicioDeImagen(url: string): { nombre: string; detalle: string } {
  const limpia = (url || '').trim();

  if (limpia.startsWith('data:')) {
    return { nombre: 'Incrustada', detalle: 'La imagen viaja dentro del propio HTML.' };
  }

  let host = '';
  try {
    host = new URL(limpia, 'http://local').hostname.toLowerCase();
  } catch {
    host = '';
  }

  if (host.includes('pollinations')) {
    return {
      nombre: 'Pollinations',
      detalle:
        'Ya no sirve imagenes anonimas (responde 402): estos enlaces no cargan. Pulsa "Cambiar por fotos reales".',
    };
  }
  if (host.includes('unsplash')) {
    return { nombre: 'Unsplash', detalle: 'Foto de banco buscada por palabra clave.' };
  }
  if (host.includes('picsum')) {
    return {
      nombre: 'Picsum',
      detalle: 'Foto de relleno: siempre carga, pero no tiene que ver con el tema.',
    };
  }
  if (host.includes('placehold') || host.includes('dummyimage')) {
    return { nombre: 'Marcador', detalle: 'Rectangulo de relleno, no es una foto real.' };
  }
  if (!host) return { nombre: 'Archivo local', detalle: 'Ruta relativa: no se vera fuera de su carpeta.' };

  return { nombre: host, detalle: 'Servicio externo no reconocido por ConvertIA.' };
}

/** Una imagen del documento, con su procedencia. */
export interface ImagenDetectada {
  src: string;
  servicio: string;
  detalle: string;
}

/** Lista las imagenes del HTML y de que servicio viene cada una. */
export function listarImagenes(html: string): ImagenDetectada[] {
  const encontradas: ImagenDetectada[] = [];
  const etiqueta = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
  let coincidencia: RegExpExecArray | null;

  while ((coincidencia = etiqueta.exec(html)) !== null) {
    const src = coincidencia[1] ?? '';
    const { nombre, detalle } = servicioDeImagen(src);
    encontradas.push({ src, servicio: nombre, detalle });
  }
  return encontradas;
}

interface FencedBlock {
  lang: string;
  code: string;
}

/** Extrae todos los bloques con triple backtick de una respuesta en markdown. */
export function extractFencedBlocks(response: string): FencedBlock[] {
  const blocks: FencedBlock[] = [];
  const fence = /```([a-zA-Z0-9+#-]*)\r?\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;

  while ((match = fence.exec(response)) !== null) {
    blocks.push({ lang: (match[1] ?? '').toLowerCase(), code: (match[2] ?? '').trimEnd() });
  }
  return blocks;
}

/**
 * Reparte la respuesta de la IA en html / css / js.
 * Acepta tanto una respuesta con bloques markdown como codigo pegado en crudo.
 */
export function splitAiResponse(response: string): PastedCode {
  const blocks = extractFencedBlocks(response);

  if (blocks.length === 0) {
    const raw = response.trim();
    if (!raw) return { ...EMPTY_CODE };
    // Sin bloques: si parece HTML lo tratamos como HTML, si no como CSS/JS segun pistas.
    if (/<[a-z!][\s\S]*>/i.test(raw)) return { html: raw, css: '', js: '' };
    if (/\{[\s\S]*:[\s\S]*;[\s\S]*\}/.test(raw) && !/function|=>|const |let /.test(raw)) {
      return { html: '', css: raw, js: '' };
    }
    return { html: '', css: '', js: raw };
  }

  const result: PastedCode = { ...EMPTY_CODE };

  for (const block of blocks) {
    const isHtml = block.lang === 'html' || block.lang === 'htm' || (!block.lang && /<[a-z!]/i.test(block.code));
    const isCss = block.lang === 'css' || block.lang === 'scss';
    const isJs = ['js', 'javascript', 'jsx', 'ts', 'typescript'].includes(block.lang);

    if (isHtml) {
      result.html = result.html ? `${result.html}\n\n${block.code}` : block.code;
    } else if (isCss) {
      result.css = result.css ? `${result.css}\n\n${block.code}` : block.code;
    } else if (isJs) {
      result.js = result.js ? `${result.js}\n\n${block.code}` : block.code;
    }
  }

  return result;
}

/** Metricas rapidas mostradas bajo el visor. */
export function codeStats(code: PastedCode): { lines: number; chars: number; weightKb: string } {
  const all = `${code.html}\n${code.css}\n${code.js}`;
  const chars = all.length;
  const lines = all.split('\n').filter((line) => line.trim().length > 0).length;
  return { lines, chars, weightKb: (new TextEncoder().encode(all).length / 1024).toFixed(1) };
}

/**
 * Busca en el documento generado el prompt del clip de video, que las tecnicas
 * dejan escrito en la seccion de documentacion. Sirve para precargar el panel
 * de generacion sin que el usuario lo copie a mano.
 */
export function extraerPromptVideo(html: string): string {
  if (!html) return '';

  const seccion = html.match(/ACTIVOS DE VIDEO([\s\S]{0,4000})/i);
  const zona = seccion?.[1] ?? html;

  const directo = zona.match(/Prompt:\s*([\s\S]{40,900}?)(?:\n\s*\n|\n\s*\d\.|Negativos:|-->)/i);
  if (directo?.[1]) return directo[1].replace(/\s+/g, ' ').trim();

  return '';
}

/** Cambia el origen del video del hero por el clip recien generado. */
export function insertarVideoGenerado(html: string, url: string): { html: string; cambiado: boolean } {
  if (!html.trim()) return { html, cambiado: false };

  if (/<source\s[^>]*type=["']video\/mp4["'][^>]*>/i.test(html)) {
    return {
      html: html.replace(
        /<source\s([^>]*)src=["'][^"']*["']([^>]*)type=["']video\/mp4["']([^>]*)>/i,
        `<source $1src="${url}"$2type="video/mp4"$3>`,
      ),
      cambiado: true,
    };
  }

  if (/<video[\s>]/i.test(html)) {
    return {
      html: html.replace(/(<video[^>]*>)/i, `$1\n  <source src="${url}" type="video/mp4">`),
      cambiado: true,
    };
  }

  return { html, cambiado: false };
}

/**
 * Propone un guion de presentador a partir del BRIEF, sin esperar a la landing.
 * Asi el video se puede ir grabando mientras Claude escribe la pagina.
 */
export function guionDesdeBrief(brief: {
  topic: string;
  offer: string;
  audience: string;
  cta: string;
}): string {
  const oferta = brief.offer.trim();
  if (!oferta) return '';

  const publico = brief.audience.trim().toLowerCase().replace(/^(los|las)\s+/, '');
  const accion = brief.cta.trim().toLowerCase();
  const tema = brief.topic.trim().toLowerCase();

  /**
   * Seis guiones distintos. La eleccion sale del propio brief, no del azar:
   * asi el mismo proyecto siempre propone el mismo guion (y no cambia solo
   * mientras escribes), pero dos proyectos distintos suenan distinto.
   */
  const semilla = [...`${brief.topic}${brief.offer}`].reduce(
    (suma, letra) => (suma * 31 + letra.charCodeAt(0)) % 100_000,
    7,
  );

  const cierre = accion ? `Cuando quieras, ${accion}.` : 'Cuando quieras, escribenos.';

  const guiones = [
    [
      `Hola. Si ${publico || 'esto va contigo'}, escucha esto.`,
      `${oferta}.`,
      'Sin letra pequena y sin compromiso: lo miras, y si no te encaja, lo dejas.',
      cierre,
    ],
    [
      'Te voy a ahorrar tiempo y te lo cuento en treinta segundos.',
      `${oferta}.`,
      `Esto es para ${publico || 'gente como tu'}. Si no eres tu, no pasa nada.`,
      cierre,
    ],
    [
      `Seguramente ya lo intentaste antes y no salio. Es lo normal en ${tema || 'esto'}.`,
      `Por eso lo montamos asi: ${oferta}.`,
      'Nada de promesas raras. Lo ves, lo pruebas y decides.',
      cierre,
    ],
    [
      `Una pregunta rapida para ${publico || 'ti'}: cuanto llevas dandole vueltas a esto?`,
      `${oferta}.`,
      'El primer paso es corto y no te compromete a nada.',
      cierre,
    ],
    [
      'Voy al grano, que se que tienes prisa.',
      `${oferta}.`,
      `Si ${publico || 'esto te suena'}, te va a encajar. Si no, mejor que lo sepas ya.`,
      cierre,
    ],
    [
      `Esto no es para todo el mundo. Es para ${publico || 'quien va en serio'}.`,
      `${oferta}.`,
      'Lo demas te lo contamos cuando hablemos, sin rodeos.',
      cierre,
    ],
  ];

  const elegido = guiones[semilla % guiones.length] ?? guiones[0]!;

  // Tavus LEE el texto: sin tildes ni enies pronuncia "anos" por "años".
  return repararAcentos(elegido.join(' '));
}

/**
 * Propone un guion de presentador leyendo el titular y el subtitular del hero.
 * Se escribe como se habla, porque lo va a decir una persona a camara.
 */
export function extraerGuionPresentador(html: string): string {
  if (!html) return '';

  const limpiar = (texto: string) =>
    texto
      .replace(/<[^>]+>/g, ' ')
      .replace(/&[a-z]+;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const h1 = html.match(/<h1[^>]*>([\s\S]{3,300}?)<\/h1>/i);
  const titular = h1?.[1] ? limpiar(h1[1]) : '';
  if (!titular) return '';

  // El primer parrafo despues del h1 suele ser el subtitular de apoyo.
  const resto = html.slice(html.indexOf(h1?.[0] ?? '') + (h1?.[0]?.length ?? 0));
  const p = resto.match(/<p[^>]*>([\s\S]{20,400}?)<\/p>/i);
  const apoyo = p?.[1] ? limpiar(p[1]) : '';

  return [
    `Hola. ${titular}.`,
    apoyo,
    'Si te encaja, dale al boton y lo vemos juntos. Sin compromiso.',
  ]
    .filter(Boolean)
    .join(' ');
}

/** Hueco que el Prompt Maestro reserva para el presentador. */
const HUECO_PRESENTADOR = /(<section[^>]*id=["']presentador-convertia["'][^>]*>)([\s\S]*?)(<\/section>)/i;

/**
 * Coloca el video del presentador. Si el Prompt Maestro dejo el hueco reservado
 * lo rellena ahi; si no, lo inserta despues de la primera seccion.
 */
export function insertarPresentador(html: string, url: string): { html: string; cambiado: boolean } {
  if (!html.trim()) return { html, cambiado: false };

  const hueco = html.match(HUECO_PRESENTADOR);
  if (hueco) {
    // El hueco nace oculto para que no se vea un reproductor vacio.
    const apertura = (hueco[1] ?? '').replace(/\shidden(?=[\s>])/i, '');
    const cierre = hueco[3] ?? '</section>';
    let cuerpo = hueco[2] ?? '';

    if (/<video[^>]*>/i.test(cuerpo)) {
      cuerpo = cuerpo.replace(/<video([^>]*)>/i, (_etiqueta, attrs: string) => {
        const limpio = attrs.replace(/\ssrc=["'][^"']*["']/i, '');
        return `<video${limpio} src="${url}">`;
      });
    } else {
      cuerpo += `
      <video src="${url}" controls playsinline style="width:100%"></video>`;
    }

    return {
      html: html.replace(HUECO_PRESENTADOR, () => `${apertura}${cuerpo}${cierre}`),
      cambiado: true,
    };
  }

  const bloque = [
    '',
    '<!-- Video de presentador generado con Tavus -->',
    '<section aria-label="Presentacion en video" style="padding:48px 24px;display:grid;place-items:center">',
    `  <video src="${url}" controls playsinline preload="metadata" style="width:100%;max-width:720px;border-radius:8px;display:block"></video>`,
    '</section>',
    '',
  ].join('\n');

  // Preferimos colocarlo despues de la primera seccion, que suele ser el hero.
  const finPrimeraSeccion = html.search(/<\/section>/i);
  if (finPrimeraSeccion !== -1) {
    const corte = finPrimeraSeccion + '</section>'.length;
    return { html: html.slice(0, corte) + bloque + html.slice(corte), cambiado: true };
  }

  if (/<\/main>/i.test(html)) {
    return { html: html.replace(/<\/main>/i, `${bloque}</main>`), cambiado: true };
  }

  return { html, cambiado: false };
}
