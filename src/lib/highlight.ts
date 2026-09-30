/**
 * ============================================================================
 *  ConvertIA :: resaltador de sintaxis del Prompt
 * ----------------------------------------------------------------------------
 *  Tokenizador minimo y sin dependencias, disenado para la gramatica concreta
 *  que emite el compilador de prompts (reglas ====, titulos de bloque, bullets,
 *  checkboxes, etiquetas [slug] y directivas en mayusculas).
 * ============================================================================
 */

export type LineKind =
  | 'rule' // ==== / ----
  | 'title' // cabecera dentro de una regla
  | 'section' // 03 | TECNICAS ...
  | 'technique' // T1. NOMBRE [slug] :: categoria
  | 'checkbox' // [ ] 01. ...
  | 'bullet' // - / 1. / a)
  | 'meta' // Compilado por ConvertIA | ...
  | 'text'
  | 'blank';

export type InlineKind = 'plain' | 'keyword' | 'tag' | 'quote' | 'number' | 'forbidden';

export interface InlineToken {
  kind: InlineKind;
  text: string;
}

export interface HighlightedLine {
  kind: LineKind;
  tokens: InlineToken[];
  raw: string;
}

const RULE_RE = /^(={5,}|-{5,})$/;
const SECTION_RE = /^\d{2}\s\|\s.+/;
const TECHNIQUE_RE = /^T\d+\.\s.+\[[a-z-]+\]/;
const CHECKBOX_RE = /^\s*\[\s?[xX ]?\s?\]\s/;
const BULLET_RE = /^\s*(-\s|\d+\.\s|[a-z]\)\s)/;
const META_RE = /^(Compilado por ConvertIA|Proyecto:|Tecnicas activas)/;

/** Palabras que el compilador usa como marcadores de orden. */
const KEYWORDS = [
  'PROHIBIDO',
  'PROHIBICIONES',
  'OBLIGATORIO',
  'obligatoria',
  'IMPORTANTE',
  'ANTES',
  'SOLO',
  'NUNCA',
  'MINIMO',
  'MAXIMO',
  'LISTA NEGRA',
  'RESTRICCIONES NEGATIVAS',
  'AUTO-REVISION',
  'PASADA 1',
  'PASADA 2',
  'CREADOR',
  'CRITICO',
  'REGLA',
  'REGLAS',
  'ENTREGA',
  'SUPUESTOS',
];

const KEYWORD_RE = new RegExp(`(${KEYWORDS.join('|')})`, 'g');
const TAG_RE = /\[[a-z][a-z-]*\]/g;
const QUOTE_RE = /"[^"]{1,120}"/g;
const NUMBER_RE = /\b\d+(?:[.,]\d+)?(?:px|%|s|ms|MB|:1|x\d+)?\b/g;

interface Match {
  start: number;
  end: number;
  kind: InlineKind;
  text: string;
}

function collect(text: string, regex: RegExp, kind: InlineKind, out: Match[]): void {
  const re = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : `${regex.flags}g`);
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    if (match[0].length === 0) {
      re.lastIndex += 1;
      continue;
    }
    out.push({ start: match.index, end: match.index + match[0].length, kind, text: match[0] });
  }
}

/** Divide una linea en tokens en linea sin solapamientos. */
export function tokenizeInline(text: string): InlineToken[] {
  const matches: Match[] = [];
  collect(text, TAG_RE, 'tag', matches);
  collect(text, QUOTE_RE, 'quote', matches);
  collect(text, KEYWORD_RE, 'keyword', matches);
  collect(text, NUMBER_RE, 'number', matches);

  matches.sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start));

  const tokens: InlineToken[] = [];
  let cursor = 0;

  for (const match of matches) {
    if (match.start < cursor) continue; // descarta solapamientos
    if (match.start > cursor) {
      tokens.push({ kind: 'plain', text: text.slice(cursor, match.start) });
    }
    tokens.push({ kind: match.kind, text: match.text });
    cursor = match.end;
  }

  if (cursor < text.length) {
    tokens.push({ kind: 'plain', text: text.slice(cursor) });
  }

  return tokens.length > 0 ? tokens : [{ kind: 'plain', text }];
}

function classifyLine(line: string, insideRuleBlock: boolean): LineKind {
  if (line.trim().length === 0) return 'blank';
  if (RULE_RE.test(line.trim())) return 'rule';
  if (SECTION_RE.test(line.trim())) return 'section';
  if (TECHNIQUE_RE.test(line.trim())) return 'technique';
  if (META_RE.test(line.trim())) return 'meta';
  if (CHECKBOX_RE.test(line)) return 'checkbox';
  if (BULLET_RE.test(line)) return 'bullet';
  // Solo es titulo la linea encerrada entre la regla de apertura y la de cierre.
  if (insideRuleBlock) return 'title';
  return 'text';
}

/** Convierte el prompt completo en lineas clasificadas y tokenizadas. */
export function highlightPrompt(prompt: string): HighlightedLine[] {
  const lines = prompt.replace(/\r\n/g, '\n').split('\n');
  // Las reglas vienen por pares: la de apertura abre el bloque de titulo y la de
  // cierre lo termina, de modo que el cuerpo no se pinte como titular.
  let openRule = false;

  return lines.map((raw) => {
    const kind = classifyLine(raw, openRule);
    if (kind === 'rule') openRule = !openRule;
    return {
      kind,
      raw,
      tokens: kind === 'rule' || kind === 'blank' ? [{ kind: 'plain', text: raw }] : tokenizeInline(raw),
    };
  });
}

/** Clases Tailwind por tipo de linea. */
export const LINE_CLASS: Record<LineKind, string> = {
  rule: 'text-primary/35 select-none',
  title: 'text-primary font-semibold tracking-wide',
  section: 'text-accent-foreground font-semibold',
  technique: 'text-success font-semibold',
  checkbox: 'text-muted-foreground',
  bullet: 'text-foreground/85',
  meta: 'text-muted-foreground italic',
  text: 'text-foreground/75',
  blank: '',
};

/** Clases Tailwind por token en linea. */
export const INLINE_CLASS: Record<InlineKind, string> = {
  plain: '',
  keyword: 'text-destructive font-semibold',
  tag: 'text-primary',
  quote: 'text-success',
  number: 'text-amber-500 dark:text-amber-400',
  forbidden: 'line-through opacity-60',
};
