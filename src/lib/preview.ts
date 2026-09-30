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
  '  *,*::before,*::after{box-sizing:border-box}',
  '</style>',
].join('\n');

/**
 * Ensambla el documento final para el iframe.
 * - Si el HTML ya es un documento completo, inyecta el CSS y el JS extra.
 * - Si es un fragmento, lo envuelve en un documento minimo.
 */
export function composePreviewDocument(code: PastedCode): string {
  const css = code.css.trim() ? `<style data-convertia="user-css">\n${code.css}\n</style>` : '';
  const js = code.js.trim() ? `<script data-convertia="user-js">\n${code.js}\n</script>` : '';
  const html = code.html.trim();

  if (!html && !css && !js) return '';

  if (html && isFullDocument(html)) {
    let output = html;
    output = injectIntoHead(output, RESET);
    output = injectIntoHead(output, css);
    output = injectIntoBody(output, js);
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
    '</body>',
    '</html>',
  ]
    .filter((part) => part.length > 0)
    .join('\n');
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

  const publico = brief.audience.trim();
  const accion = brief.cta.trim();

  return [
    `Hola. Si ${publico ? publico.toLowerCase().replace(/^(los|las)\s+/, '') : 'esto va contigo'}, escucha esto.`,
    `${oferta}.`,
    'Sin letra pequena y sin compromiso: lo miras, y si no te encaja, lo dejas.',
    accion ? `Cuando quieras, ${accion.toLowerCase()}. Te respondemos el mismo dia.` : 'Cuando quieras, escribenos.',
  ].join(' ');
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

/** Coloca el video del presentador justo despues de la primera seccion. */
export function insertarPresentador(html: string, url: string): { html: string; cambiado: boolean } {
  if (!html.trim()) return { html, cambiado: false };

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
