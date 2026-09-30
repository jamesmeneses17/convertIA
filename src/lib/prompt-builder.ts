import { TECHNIQUES, getTechnique, sortTechniques } from '@/lib/techniques';
import type { Brief, IndividualPrompt, TechniqueSlug } from '@/lib/types';

/**
 * ============================================================================
 *  ConvertIA :: Compilador de Prompts
 * ----------------------------------------------------------------------------
 *  Este modulo es el motor del sistema experto. No llama a ninguna API de IA:
 *  su unico trabajo es ingenieria de prompt determinista. El mismo brief con
 *  las mismas tecnicas produce siempre el mismo Prompt Maestro, de modo que el
 *  resultado es reproducible y auditable en cualquier modelo (Claude, ChatGPT,
 *  Gemini, DeepSeek).
 * ============================================================================
 */

const RULE = '='.repeat(78);
const THIN = '-'.repeat(78);

function section(title: string): string {
  return `${RULE}\n${title}\n${RULE}`;
}

function valueOrFallback(value: string, fallback: string): string {
  const clean = value.trim();
  return clean.length > 0 ? clean : fallback;
}

/** Bloque 00 :: rol del modelo. */
function roleBlock(): string {
  return [
    section('00 | ROL Y ESTANDAR DE CALIDAD'),
    'Actuas como un equipo senior de tres perfiles trabajando a la vez sobre el mismo entregable:',
    '  - un DIRECTOR DE ARTE digital con criterio editorial;',
    '  - un ESPECIALISTA EN CRO con experiencia en landing pages que convierten;',
    '  - un DESARROLLADOR FRONT-END que escribe HTML semantico, CSS moderno y JavaScript sin dependencias.',
    '',
    'Tu estandar de calidad es el de una pagina de producto premium publicada hoy, no el de una plantilla.',
    'Piensa antes de escribir: primero decide estrategia y direccion de arte, despues maqueta.',
  ].join('\n');
}

/** Bloque 01 :: brief. */
function briefBlock(brief: Brief): string {
  const cta = valueOrFallback(
    brief.cta,
    'No definido. Propon la accion de conversion mas coherente con la oferta y justifica tu eleccion en una linea.',
  );

  return [
    section('01 | BRIEF DEL PROYECTO'),
    `TEMA / INDUSTRIA:`,
    `  ${brief.topic.trim()}`,
    '',
    `OFERTA Y BENEFICIO PRINCIPAL:`,
    `  ${brief.offer.trim()}`,
    '',
    `PUBLICO OBJETIVO:`,
    `  ${brief.audience.trim()}`,
    '',
    `TONO Y DIRECCION VISUAL:`,
    `  ${brief.tone.trim()}`,
    '',
    `ACCION PRINCIPAL (OBJETIVO DE CONVERSION):`,
    `  ${cta}`,
    '',
    'Todo el contenido debe ser especifico de este brief. Nada de texto generico reutilizable en otro sector.',
  ].join('\n');
}

/** Bloque 02 :: objetivo del encargo. */
function objectiveBlock(): string {
  return [
    section('02 | ENCARGO'),
    'Disena y programa una LANDING PAGE completa, lista para publicar, orientada a un unico objetivo de conversion.',
    'La pagina debe funcionar abriendo un solo archivo en el navegador, sin compilar y sin instalar nada.',
    'Cada decision de diseno debe poder justificarse por su efecto en la comprension o en la conversion.',
  ].join('\n');
}

/** Bloque 03 :: tecnicas activadas. */
function techniquesBlock(slugs: readonly TechniqueSlug[]): string {
  const ordered = sortTechniques(slugs);

  if (ordered.length === 0) {
    return [
      section('03 | TECNICAS AVANZADAS ACTIVADAS (0/8)'),
      'No se activo ninguna tecnica adicional. Aplica igualmente tu mejor criterio profesional de diseno y CRO.',
    ].join('\n');
  }

  const blocks = ordered.map((slug, index) => {
    const technique = getTechnique(slug);
    return [
      `${THIN}`,
      `T${index + 1}. ${technique.name.toUpperCase()}  [${technique.slug}]  ::  ${technique.category}`,
      `${THIN}`,
      technique.directive,
    ].join('\n');
  });

  return [
    section(`03 | TECNICAS AVANZADAS ACTIVADAS (${ordered.length}/${TECHNIQUES.length})`),
    'Las siguientes directivas son de cumplimiento obligatorio y acumulativo. Si dos entran en conflicto,',
    'gana la que reduzca friccion para el usuario; explica el conflicto en una linea al final de la respuesta.',
    '',
    blocks.join('\n\n'),
  ].join('\n');
}

/** Bloque 04 :: arquitectura de la pagina. */
function architectureBlock(brief: Brief): string {
  const hasCta = brief.cta.trim().length > 0;
  return [
    section('04 | ARQUITECTURA DE LA PAGINA'),
    'Construye como minimo estas secciones, en este orden narrativo (puedes anadir una mas si la oferta lo exige):',
    '  1. HERO: promesa concreta en el titular (que gana el usuario, en cuanto tiempo), subtitular de apoyo,',
    '     llamada a la accion primaria visible sin scroll y una senal de confianza discreta.',
    '  2. PROBLEMA: nombra la situacion actual del publico con sus propias palabras, sin dramatizar.',
    '  3. SOLUCION / COMO FUNCIONA: 3 o 4 pasos numerados, concretos y en secuencia temporal.',
    '  4. BENEFICIOS: consecuencias reales, no caracteristicas. Cada una con evidencia o cifra cuando sea honesto.',
    '  5. PRUEBA SOCIAL: testimonios, casos o cifras. Si no hay datos reales, usa marcadores de posicion honestos.',
    '  6. OBJECIONES / PREGUNTAS FRECUENTES: 4 a 6 preguntas con respuestas directas.',
    `  7. CIERRE: repeticion de la llamada a la accion${hasCta ? ` ("${brief.cta.trim()}")` : ''} con el riesgo minimizado.`,
    '  8. PIE DE PAGINA: navegacion minima, aviso legal y privacidad.',
    '',
    'REGLA DE FLUJO: la llamada a la accion principal debe aparecer al menos 3 veces (hero, mitad de pagina, cierre)',
    'y ser siempre la misma accion con el mismo texto. No compitas contra ti mismo con objetivos secundarios.',
  ].join('\n');
}

/** Bloque 05 :: requisitos tecnicos. */
function technicalBlock(): string {
  return [
    section('05 | REQUISITOS TECNICOS'),
    'ESTRUCTURA',
    '  - HTML5 semantico: header, main, section con aria-labelledby, article, footer. Un solo h1.',
    '  - Idioma del documento en espanol (lang="es"), meta description, Open Graph y favicon en linea.',
    '  - Sin frameworks, sin CDN de librerias, sin build. CSS y JS van embebidos en el mismo archivo.',
    '',
    'CSS',
    '  - Variables CSS en :root para color, tipografia, espaciado y radios. Nada de valores magicos repetidos.',
    '  - Layout con CSS Grid y Flexbox. Tipografia fluida con clamp().',
    '  - Mobile-first real, con puntos de ruptura en 480px, 768px y 1200px. Cero scroll horizontal.',
    '  - Modo oscuro con prefers-color-scheme cuando sea coherente con la direccion visual.',
    '',
    'ACCESIBILIDAD (obligatoria)',
    '  - Contraste minimo AA 4.5:1 en texto normal y 3:1 en texto grande.',
    '  - Foco visible en todos los elementos interactivos (:focus-visible), nunca outline:none sin reemplazo.',
    '  - Areas tactiles de 44x44px minimo. Navegacion completa por teclado.',
    '  - Etiquetas asociadas a cada campo, mensajes de error con aria-live.',
    '',
    'RENDIMIENTO',
    '  - Sin saltos de layout: dimensiones explicitas en imagenes y video.',
    '  - Animaciones solo sobre transform y opacity, y respetando prefers-reduced-motion.',
    '  - JavaScript minimo y con proposito: validacion del formulario, preguntas frecuentes desplegables,',
    '    scroll suave a la llamada a la accion y estados de envio. Sin dependencias externas.',
    '',
    'FORMULARIO',
    '  - Solo los campos imprescindibles para el objetivo de conversion. Cada campo extra cuesta conversiones.',
    '  - Validacion en el cliente con mensajes especificos, estado de carga y estado de exito.',
  ].join('\n');
}

/** Bloque 06 :: formato de salida. */
function outputBlock(slugs: readonly TechniqueSlug[]): string {
  const ordered = sortTechniques(slugs);
  const extras: string[] = [];

  if (ordered.includes('image-assets')) extras.push('  - "ACTIVOS DE IMAGEN": tabla de activos con sus prompts en ingles.');
  if (ordered.includes('video-assets')) extras.push('  - "ACTIVOS DE VIDEO": clips con guion y prompts en ingles.');
  if (ordered.includes('creator-critic')) extras.push('  - "AUDITORIA CRO": puntuaciones justificadas y correcciones aplicadas.');
  if (ordered.includes('subtractive-design')) extras.push('  - "RECORTE APLICADO": que eliminaste y por que.');
  if (ordered.includes('seed-strings')) extras.push('  - "CADENA SEMILLA": paleta, tipografia, rejilla y firma visual declaradas.');
  if (ordered.includes('ambitious-prompts')) extras.push('  - "MAPA PSICOLOGICO": miedos, objeciones y motivaciones detectadas.');

  return [
    section('06 | FORMATO DE SALIDA'),
    'Entrega en este orden exacto:',
    '',
    'A) Un unico bloque de codigo ```html con el documento completo y autocontenido:',
    '   <!DOCTYPE html> ... <style> ... </style> ... <script> ... </script> ... </html>',
    '   Debe poder copiarse, guardarse como index.html y abrirse en el navegador funcionando al 100%.',
    '',
    'B) Si lo pides por separado, entrega ademas el CSS y el JS en bloques independientes (```css y ```js),',
    '   manteniendo el HTML valido en ambos casos.',
    '',
    'C) Secciones de apoyo, despues del codigo:',
    ...(extras.length > 0 ? extras : ['  - (ninguna adicional activada)']),
    '',
    'REGLAS DE ENTREGA',
    '  - No expliques el codigo linea por linea. No pidas confirmacion antes de generar.',
    '  - No dejes ningun TODO, ningun lorem ipsum ni ninguna seccion a medias.',
    '  - Si necesitas un dato que no esta en el brief, decide la opcion mas razonable y anotala',
    '    en una lista final llamada "SUPUESTOS" de maximo 5 lineas.',
  ].join('\n');
}

/** Bloque 07 :: checklist final derivado de las tecnicas activas. */
function checklistBlock(slugs: readonly TechniqueSlug[]): string {
  const ordered = sortTechniques(slugs);

  const base = [
    'La promesa principal se entiende en menos de 5 segundos.',
    'Existe una sola accion de conversion, repetida y coherente en toda la pagina.',
    'La pagina se ve correctamente a 360px, 768px y 1440px de ancho.',
    'Contraste AA verificado y foco visible en todos los elementos interactivos.',
    'Un solo h1, jerarquia de encabezados correcta y HTML valido.',
    'El archivo funciona abierto directamente en el navegador, sin recursos externos obligatorios.',
  ];

  const fromTechniques = ordered.flatMap((slug) => getTechnique(slug).checklist);
  const items = [...base, ...fromTechniques];

  return [
    section('07 | CHECKLIST DE VERIFICACION ANTES DE ENTREGAR'),
    'Recorre esta lista y confirma cada punto. Si alguno falla, corrige el codigo antes de responder.',
    '',
    ...items.map((item, index) => `  [ ] ${String(index + 1).padStart(2, '0')}. ${item}`),
    '',
    'Cierra tu respuesta con la linea: "Checklist verificado: N/N".',
  ].join('\n');
}

export interface BuildOptions {
  /** Nombre del proyecto, usado solo en la cabecera informativa. */
  projectName?: string;
  /** Fecha de compilacion; inyectable para que las pruebas sean deterministas. */
  compiledAt?: Date;
}

/**
 * Compila el PROMPT MAESTRO: fusiona brief + tecnicas + arquitectura +
 * requisitos tecnicos + formato de salida + checklist en un solo super-prompt.
 */
export function buildMasterPrompt(
  brief: Brief,
  slugs: readonly TechniqueSlug[],
  options: BuildOptions = {},
): string {
  const ordered = sortTechniques(slugs);
  const date = options.compiledAt ?? new Date();
  const stamp = date.toISOString().slice(0, 16).replace('T', ' ');
  const names = ordered.length > 0 ? ordered.map((slug) => getTechnique(slug).name).join(' + ') : 'ninguna';

  const header = [
    RULE,
    'PROMPT MAESTRO | LANDING PAGE DE ALTA CONVERSION',
    `Compilado por ConvertIA | ${stamp} UTC`,
    options.projectName ? `Proyecto: ${options.projectName}` : null,
    `Tecnicas activas (${ordered.length}/${TECHNIQUES.length}): ${names}`,
    RULE,
  ]
    .filter((line): line is string => line !== null)
    .join('\n');

  return [
    header,
    '',
    roleBlock(),
    '',
    briefBlock(brief),
    '',
    objectiveBlock(),
    '',
    techniquesBlock(ordered),
    '',
    architectureBlock(brief),
    '',
    technicalBlock(),
    '',
    outputBlock(ordered),
    '',
    checklistBlock(ordered),
    '',
    RULE,
    'FIN DEL PROMPT MAESTRO. Empieza ahora. No pidas aclaraciones: aplica tu mejor criterio y documenta supuestos.',
    RULE,
  ].join('\n');
}

/**
 * Compila un prompt independiente por cada tecnica activa.
 * Sirve para comparar el efecto aislado de cada tecnica sobre el mismo brief
 * (A/B de ingenieria de prompt).
 */
export function buildIndividualPrompts(
  brief: Brief,
  slugs: readonly TechniqueSlug[],
  options: BuildOptions = {},
): IndividualPrompt[] {
  const ordered = sortTechniques(slugs);
  const date = options.compiledAt ?? new Date();
  const stamp = date.toISOString().slice(0, 16).replace('T', ' ');

  return ordered.map((slug, index) => {
    const technique = getTechnique(slug);

    const prompt = [
      RULE,
      `PRUEBA AISLADA ${index + 1}/${ordered.length} | ${technique.name.toUpperCase()}  [${technique.slug}]`,
      `Compilado por ConvertIA | ${stamp} UTC`,
      RULE,
      '',
      section('00 | ROL'),
      'Actuas como director de arte digital y desarrollador front-end senior. Escribes HTML semantico,',
      'CSS moderno y JavaScript sin dependencias, con estandar de pagina de producto premium.',
      '',
      briefBlock(brief),
      '',
      section('01 | OBJETIVO DE ESTA PRUEBA'),
      technique.soloObjective,
      '',
      'IMPORTANTE: en esta prueba aplicas UNICAMENTE la tecnica indicada abajo. No mezcles otras tecnicas.',
      'El objetivo es medir su efecto aislado sobre el mismo brief.',
      '',
      section(`02 | TECNICA UNICA: ${technique.name.toUpperCase()}`),
      technique.directive,
      '',
      section('03 | REQUISITOS MINIMOS'),
      '  - Documento HTML unico y autocontenido (CSS y JS embebidos), abrible en el navegador sin build.',
      '  - Mobile-first, contraste AA, foco visible, un solo h1.',
      '  - Secciones minimas: hero, problema, solucion, beneficios, prueba social, preguntas frecuentes, cierre, pie.',
      '  - Sin lorem ipsum y sin secciones a medias.',
      '',
      section('04 | FORMATO DE SALIDA'),
      'Un unico bloque ```html con el documento completo. Despues, en 3 lineas como maximo,',
      `explica que decisiones concretas tomaste por efecto de la tecnica "${technique.name}".`,
      '',
      section('05 | CHECKLIST'),
      ...technique.checklist.map((item, i) => `  [ ] ${i + 1}. ${item}`),
      '',
      RULE,
      'Empieza ahora.',
      RULE,
    ].join('\n');

    return { slug: technique.slug, name: technique.name, prompt };
  });
}

/** Une los prompts individuales en un solo documento descargable/copiable. */
export function joinIndividualPrompts(prompts: readonly IndividualPrompt[]): string {
  return prompts
    .map((item) => item.prompt)
    .join(`\n\n\n${RULE}\n${RULE}\n\n\n`);
}
