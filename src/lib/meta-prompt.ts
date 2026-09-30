import { getTechnique, sortTechniques } from '@/lib/techniques';
import type { Brief, TechniqueSlug } from '@/lib/types';

/**
 * ============================================================================
 *  ConvertIA :: meta-prompt
 * ----------------------------------------------------------------------------
 *  El compilador determinista (prompt-builder.ts) arma siempre la misma
 *  estructura: fiable y reproducible, pero todas las landings acaban con el
 *  mismo esqueleto.
 *
 *  Este modulo hace otra cosa: escribe el ENCARGO para que una IA redacte el
 *  Prompt Maestro a medida de este proyecto. La IA elige la arquitectura, el
 *  arquetipo de composicion y la direccion de arte segun el brief, en vez de
 *  rellenar una plantilla.
 *
 *  Los dos caminos conviven: el determinista es instantaneo y auditable; este
 *  tarda unos minutos y da variedad real.
 * ============================================================================
 */

const RULE = '='.repeat(78);

/** Esqueletos de pagina entre los que la IA debe elegir uno y comprometerse. */
const ARQUETIPOS = [
  'ZIGZAG NARRATIVO: secciones que alternan lado, imagen y texto intercambiando posicion.',
  'EDITORIAL A UNA COLUMNA: medida de lectura estrecha y centrada, imagenes a sangre completa entre bloques.',
  'HERO TIPOGRAFICO: sin imagen en la primera pantalla; el titular a gran escala ocupa el espacio y la primera foto llega despues.',
  'PANTALLA PARTIDA: mitad fija de contenido y mitad visual que cambia al avanzar.',
  'REJILLA MODULAR: bloques de distintos tamanos en mosaico, con una pieza dominante por pantalla.',
  'DOCUMENTO GUIADO: indice lateral fijo y contenido a la derecha, como una guia tecnica.',
  'PORTADA A SANGRE: una imagen a pantalla completa con el titular encima y el resto en columna estrecha debajo.',
];

const DIRECCIONES = [
  'SERIF EDITORIAL: titulares en serif con caracter, cuerpo en sans neutra.',
  'SANS GEOMETRICA: todo en una sans de formas limpias, jerarquia por peso y tamano.',
  'CONDENSADA DE CARTEL: titulares muy pesados y estrechos en mayusculas, cuerpo en serif.',
  'MONO TECNICA: monoespaciada para datos y etiquetas, sans para lectura.',
];

export interface MetaOptions {
  projectName?: string;
  /** Semilla para que dos proyectos identicos no elijan lo mismo. */
  semilla?: number;
  /**
   * Modo rapido: recorta lo que hace larga la generacion (anexos de
   * documentacion, segunda pasada critica, secciones de mas). La pagina sale
   * igual de buena; lo que se pierde es el papeleo alrededor.
   */
  rapido?: boolean;
}

/** Instrucciones que abrevian el trabajo de la IA que ejecutara el prompt. */
const BLOQUE_RAPIDO = [
  'MODO RAPIDO ACTIVADO. El Prompt Maestro que escribas debe ordenar expresamente:',
  '  - Entre 5 y 6 secciones como maximo, no mas.',
  '  - Una sola pasada de escritura: nada de reescribir la pagina entera para auditarse.',
  '    La autocritica se resuelve mientras escribe, no en una segunda version.',
  '  - Cero anexos de documentacion despues del codigo: ni tablas de activos, ni auditoria',
  '    CRO, ni informe de recorte, ni mapa psicologico. Solo el bloque de codigo.',
  '  - Nada de explicar el codigo ni de resumir lo que hizo.',
  'Esto reduce el tiempo de generacion a la mitad sin bajar la calidad de la pagina.',
  '',
];

/**
 * Construye el encargo que se le da a la IA para que escriba el Prompt Maestro.
 * Ojo: aqui NO se pide una landing. Se pide el encargo de la landing.
 */
export function buildMetaPrompt(
  brief: Brief,
  slugs: readonly TechniqueSlug[],
  options: MetaOptions = {},
): string {
  const ordered = sortTechniques(slugs);
  const semilla = options.semilla ?? Math.floor(Math.random() * 9000) + 1000;

  // La semilla decide por donde empieza a mirar, para que no caiga siempre en
  // el mismo esqueleto. Puede descartarlo, pero tiene que justificarlo.
  const sugerido = ARQUETIPOS[semilla % ARQUETIPOS.length] ?? ARQUETIPOS[0]!;
  const sugeridaTipo = DIRECCIONES[semilla % DIRECCIONES.length] ?? DIRECCIONES[0]!;

  const tecnicas =
    ordered.length > 0
      ? ordered
          .map((slug, index) => {
            const t = getTechnique(slug);
            return [
              `  ${index + 1}. ${t.name} [${t.slug}] — ${t.category}`,
              `     Objetivo: ${t.tagline}`,
              `     Debe traducirse en instrucciones verificables, no en una mencion de pasada.`,
            ].join('\n');
          })
          .join('\n')
      : '  (ninguna: usa solo tu criterio profesional)';

  const cta = brief.cta.trim() || 'No definido: decide tu la accion mas coherente y justificala.';

  return [
    RULE,
    'ENCARGO: ESCRIBE UN PROMPT MAESTRO',
    `Semilla de variacion: ${semilla}`,
    options.projectName ? `Proyecto: ${options.projectName}` : null,
    RULE,
    '',
    ...(options.rapido ? BLOQUE_RAPIDO : []),
    'ATENCION, LEE ESTO DOS VECES:',
    'NO tienes que construir la landing page. Tu trabajo es ESCRIBIR EL ENCARGO que otra IA',
    'leera para construirla. Entregas un documento de texto, no codigo HTML.',
    '',
    'Actuas como director creativo y arquitecto de prompts. Te dan un brief y unas tecnicas,',
    'y tienes que redactar el mejor encargo posible: tan concreto que dos IAs distintas',
    'produzcan paginas equivalentes en calidad leyendolo.',
    '',
    RULE,
    'EL BRIEF DEL CLIENTE',
    RULE,
    `TEMA / INDUSTRIA:  ${brief.topic.trim()}`,
    `OFERTA:            ${brief.offer.trim()}`,
    `PUBLICO:           ${brief.audience.trim()}`,
    `TONO Y VISUAL:     ${brief.tone.trim()}`,
    `ACCION PRINCIPAL:  ${cta}`,
    '',
    RULE,
    'TECNICAS QUE DEBES INCORPORAR',
    RULE,
    tecnicas,
    '',
    RULE,
    'DECISIONES QUE TIENES QUE TOMAR TU (no las delegues)',
    RULE,
    '',
    '1. ARQUETIPO DE COMPOSICION. Elige UNO y comprometete con el en todo el documento.',
    '   No vale mezclar ni describirlo de forma vaga. Opciones:',
    ...ARQUETIPOS.map((a) => `     - ${a}`),
    '   Justifica en una linea por que ese arquetipo encaja con ESTE publico y ESTA oferta.',
    '',
    `   EMPIEZA CONSIDERANDO ESTE: ${sugerido}`,
    '   Es el que te toca por semilla. Usalo salvo que el brief pida claramente otro, y si lo',
    '   descartas escribe en una linea por que no encajaba. Asi evitamos que todos los proyectos',
    '   acaben con el mismo esqueleto.',
    '   PROHIBIDO elegir el zigzag narrativo "porque si": es el mas comun y el mas gastado.',
    '',
    '2. DIRECCION TIPOGRAFICA. Elige UNA:',
    ...DIRECCIONES.map((d) => `     - ${d}`),
    '   Debe ser coherente con el tono del brief, no con tu gusto.',
    `   La semilla sugiere esta: ${sugeridaTipo}`,
    '',
    '3. ARQUITECTURA DE SECCIONES. Decide que secciones necesita ESTA oferta y en que orden.',
    '   No copies una lista estandar: una oferta de servicio juridico no necesita lo mismo',
    '   que una suscripcion de producto fisico. Entre 5 y 9 secciones, cada una con su proposito',
    '   declarado. Si eliminas alguna habitual (prueba social, precios, preguntas), di por que.',
    '',
    '4. PALETA Y FIRMA VISUAL. Propon valores HEX concretos y un recurso grafico repetido.',
    '',
    RULE,
    'QUE DEBE CONTENER EL PROMPT MAESTRO QUE ESCRIBAS',
    RULE,
    '',
    'Escribelo en espanol, en texto plano con titulos y separadores, listo para pegar en',
    'cualquier IA (Claude, ChatGPT, Gemini). Debe incluir, como minimo:',
    '',
    '  - El rol y el estandar de calidad que asume quien lo lea.',
    '  - El brief completo, integrado con naturalidad (no pegado en crudo).',
    '  - El arquetipo, la direccion tipografica y la paleta que has decidido, como ordenes.',
    '  - La arquitectura de secciones con el proposito de cada una.',
    '  - Las directivas de cada tecnica activa, redactadas a medida de este proyecto.',
    '  - Requisitos tecnicos: HTML semantico, un solo h1, CSS y JS embebidos, sin dependencias,',
    '    mobile-first, contraste AA, foco visible, imagenes con dimensiones explicitas.',
    '  - Las imagenes deben GENERARSE CON IA desde la propia URL, con Pollinations:',
    '      https://image.pollinations.ai/prompt/TEXTO?width=ANCHO&height=ALTO&seed=NUMERO&nologo=true',
    '    TEXTO es la descripcion de la foto EN INGLES y codificada para URL (espacios como %20).',
    '    Cada imagen lleva su propia seed fija, para que no cambie al recargar. Nada de picsum',
    '    ni de fotos de banco: la pagina debe abrirse ya terminada y con imagenes de ESTE tema.',
    '  - Un hueco reservado para el video del presentador: exige una seccion inmediatamente',
    '    despues del hero con <section id="presentador-convertia"> y dentro un <video controls',
    '    playsinline> vacio. ConvertIA le pone el archivo cuando el video termina de grabarse.',
    '  - El formato de salida esperado y un checklist final de verificacion.',
    '',
    RULE,
    'REGLAS DE ENTREGA',
    RULE,
    '',
    '  - Entrega UNICAMENTE el Prompt Maestro. Sin preambulos, sin "aqui tienes", sin comentarios.',
    '  - No escribas HTML ni CSS: lo que entregas es un encargo en prosa e instrucciones.',
    '  - Nada generico: si una frase de tu prompt serviria igual para otro sector, reescribela.',
    options.rapido
      ? '  - Extension orientativa: entre 5.000 y 9.000 caracteres. Breve y sin relleno.'
      : '  - Extension orientativa: entre 8.000 y 20.000 caracteres. Mejor preciso que largo.',
    '  - Termina el documento con una linea exactamente asi, para poder auditarlo despues:',
    `    DECISIONES: arquetipo=<el que elegiste> · tipografia=<la que elegiste> · semilla=${semilla}`,
    '',
    RULE,
    'Empieza ahora. Tu respuesta es el Prompt Maestro, nada mas.',
    RULE,
  ]
    .filter((line): line is string => line !== null)
    .join('\n');
}
