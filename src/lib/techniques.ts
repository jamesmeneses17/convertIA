import type { Technique, TechniqueSlug } from '@/lib/types';
import { TECHNIQUE_SLUGS } from '@/lib/types';

/**
 * ============================================================================
 *  ConvertIA :: Biblioteca de tecnicas avanzadas de prompting
 * ----------------------------------------------------------------------------
 *  Cada tecnica es un modulo independiente. `directive` es el bloque textual
 *  literal que se inyecta en el Prompt Maestro; esta escrito en imperativo
 *  porque los modelos siguen mejor ordenes concretas y verificables que
 *  descripciones abstractas.
 * ============================================================================
 */

export const TECHNIQUES: readonly Technique[] = [
  // --------------------------------------------------------------- 1
  {
    slug: 'seed-strings',
    name: 'Cadenas Semilla',
    tagline: 'Una guia de estilo unica que rompe el layout generico.',
    category: 'Direccion de arte',
    icon: 'Palette',
    whatItDoes: [
      'Obliga a la IA a declarar una guia de estilo ANTES de escribir codigo: paleta con valores HEX, escala tipografica y rejilla.',
      'Fuerza una pareja tipografica con contraste real (una Serif expresiva + una Sans neutra) en lugar de la fuente por defecto.',
      'Prohibe la estructura "hero centrado + 3 tarjetas + footer" y exige al menos dos secciones con composicion asimetrica.',
      'Fija tokens de diseno reutilizables (--color-*, --space-*, --radius-*) para que todo el CSS sea coherente.',
    ],
    directive: [
      'ANTES de escribir una sola linea de codigo, genera una CADENA SEMILLA DE ESTILO y respetala sin desviarte en todo el documento:',
      '  1. PALETA: 1 color base, 1 color de tinta/texto, 1 acento de alto contraste para conversion y 2 neutros. Declara los valores HEX exactos.',
      '  2. TIPOGRAFIA: elige una pareja con contraste real, una Serif con caracter para titulares y una Sans neutra para cuerpo (o la inversion deliberada). Define la escala modular (razon 1.25 o 1.333) y el interlineado.',
      '  3. REJILLA Y RITMO: define una rejilla (12 columnas, o rejilla asimetrica 7/5) y una escala de espaciado de 8px.',
      '  4. FIRMA VISUAL: un unico recurso grafico repetido que identifique la marca (regla fina, numeracion de secciones, vineta geometrica, marco desplazado, subrayado dibujado). Usalo minimo 3 veces.',
      'Materializa la cadena semilla como custom properties de CSS en :root y consumela siempre desde ahi; no escribas colores ni tamanos sueltos.',
      'PROHIBIDO el layout por defecto "hero centrado + 3 tarjetas iguales + footer". Al menos DOS secciones deben usar composicion asimetrica (texto desplazado, imagen sangrada al borde, solapamiento controlado o tipografia de gran escala).',
    ].join('\n'),
    soloObjective:
      'Producir la guia de estilo (cadena semilla) y aplicarla a una landing page completa con identidad visual propia y layout no generico.',
    checklist: [
      'La paleta y la tipografia declaradas se usan de forma consistente via variables CSS.',
      'Existen al menos dos secciones con composicion asimetrica.',
      'La firma visual aparece al menos tres veces.',
    ],
  },

  // --------------------------------------------------------------- 2
  {
    slug: 'ambitious-prompts',
    name: 'Prompts Ambiciosos',
    tagline: 'Resuelve miedos, dudas y motivaciones reales del cliente.',
    category: 'Psicologia',
    icon: 'Target',
    whatItDoes: [
      'Pide un mapa previo de la audiencia: 3 miedos, 3 objeciones y 3 motivaciones profundas antes de maquetar.',
      'Exige que cada seccion de la pagina neutralice explicitamente una objecion concreta.',
      'Incorpora preguntas frecuentes construidas sobre las dudas reales, no sobre relleno.',
      'Convierte caracteristicas en consecuencias vitales medibles para el usuario.',
    ],
    directive: [
      'Trabaja como estratega de conversion, no como maquetador. Antes del codigo, escribe un MAPA PSICOLOGICO de la audiencia:',
      '  - 3 MIEDOS concretos que la frenan (que teme perder: dinero, tiempo, reputacion, identidad).',
      '  - 3 OBJECIONES que diria en voz alta antes de convertir (es caro, no tengo tiempo, ya probe algo asi).',
      '  - 3 MOTIVACIONES profundas (el cambio de estado que de verdad busca, no la caracteristica del producto).',
      'Despues, DISENA LA PAGINA CONTRA ESE MAPA: cada seccion debe desactivar al menos un miedo o una objecion. Anota en un comentario HTML al inicio de cada seccion que objecion ataca.',
      'Traduce cada caracteristica en consecuencia vital concreta y, cuando sea honesto, cuantificada (15 minutos al dia, en 30 dias, sin hoja de calculo).',
      'Incluye una seccion de preguntas frecuentes con 4-6 preguntas construidas sobre las objeciones reales detectadas, con respuestas directas y sin evasivas.',
      'Incluye una linea honesta de para-quien-NO-es. La exclusion explicita aumenta la confianza y filtra leads.',
    ].join('\n'),
    soloObjective:
      'Construir la landing partiendo de un mapa de miedos, objeciones y motivaciones, de forma que cada bloque neutralice una resistencia concreta.',
    checklist: [
      'Cada seccion declara en comentario HTML la objecion que neutraliza.',
      'Las preguntas frecuentes responden objeciones reales, no relleno.',
      'Los beneficios estan expresados como consecuencias, no como caracteristicas.',
    ],
  },

  // --------------------------------------------------------------- 3
  {
    slug: 'creator-critic',
    name: 'Creador y Critico',
    tagline: 'Autoevaluacion UX/CRO antes de entregar el codigo.',
    category: 'Calidad',
    icon: 'ShieldCheck',
    whatItDoes: [
      'Divide el trabajo de la IA en dos roles: primero crea, luego se audita a si misma como consultor CRO externo.',
      'Fuerza una auditoria puntuada (jerarquia visual, claridad de la promesa, friccion, prueba social, accesibilidad, rendimiento).',
      'Obliga a corregir todo lo que puntue por debajo de 8/10 antes de entregar.',
      'Entrega una lista final de correcciones aplicadas, para que veas el razonamiento.',
    ],
    directive: [
      'Trabaja en DOS PASADAS explicitas dentro de la misma respuesta:',
      '  PASADA 1, CREADOR: construye la primera version completa de la pagina.',
      '  PASADA 2, CRITICO: cambia de sombrero y auditala como consultor externo de UX/CRO que no escribio ese codigo. Se severo y concreto. Puntua de 1 a 10 y justifica en una linea cada criterio:',
      '      a) Claridad de la promesa en los primeros 5 segundos (prueba del vistazo).',
      '      b) Jerarquia visual y recorrido de la mirada hacia la accion principal.',
      '      c) Friccion del formulario y de la llamada a la accion.',
      '      d) Credibilidad y prueba social.',
      '      e) Accesibilidad (contraste AA, foco visible, semantica, textos alternativos).',
      '      f) Rendimiento y peso (CSS inutilizado, animaciones costosas, saltos de layout).',
      '      g) Consistencia del sistema de diseno.',
      'Todo criterio con nota inferior a 8 debe corregirse. Reescribe el codigo con las correcciones aplicadas.',
      'ENTREGA SOLO LA VERSION CORREGIDA como codigo final, y debajo una seccion "AUDITORIA CRO" con la tabla de puntuaciones y la lista de correcciones que aplicaste. No entregues la version 1 en bruto.',
    ].join('\n'),
    soloObjective:
      'Crear la pagina y auditarla despues con criterio CRO/UX, entregando solo la version corregida junto al informe de auditoria.',
    checklist: [
      'Existe una seccion AUDITORIA CRO con puntuaciones justificadas.',
      'Ningun criterio queda por debajo de 8 sin correccion aplicada.',
      'El codigo entregado es la version ya corregida.',
    ],
  },

  // --------------------------------------------------------------- 4
  {
    slug: 'image-assets',
    name: 'Activos de Imagen',
    tagline: 'Prompts listos para Midjourney / DALL-E con encuadre e iluminacion.',
    category: 'Activos',
    icon: 'Image',
    whatItDoes: [
      'Genera un briefing de imagenes con prompt en ingles listo para pegar en Midjourney, DALL-E o Flux.',
      'Especifica encuadre, lente, iluminacion, paleta y relacion de aspecto para cada activo.',
      'Anade restricciones visuales (sin texto incrustado, sin manos deformes, sin marcas de agua, zona libre para el titular).',
      'Deja marcadores de posicion en el HTML con las medidas exactas y el texto alternativo ya redactado.',
    ],
    directive: [
      'Anade una seccion final "ACTIVOS DE IMAGEN" con 3 a 5 activos (hero, prueba social/retrato, detalle de producto, textura de fondo).',
      'Para CADA activo entrega: nombre de archivo sugerido, uso en la pagina, relacion de aspecto y medidas en px, y un PROMPT EN INGLES autonomo que especifique:',
      '  - sujeto y accion concretos;',
      '  - encuadre y lente (wide 24mm, portrait 85mm, macro, overhead flat-lay);',
      '  - iluminacion (soft window light, golden hour rim light, high-key studio, single hard source);',
      '  - paleta ligada a la cadena semilla del proyecto;',
      '  - textura y acabado (film grain 35mm, matte, high contrast digital);',
      '  - RESTRICCIONES NEGATIVAS: no text, no watermark, no logos, no distorted hands, no extra fingers, no stock-photo smile, no busy background;',
      '  - zona de respiro: indica donde debe quedar espacio limpio para superponer el titular.',
      'MUY IMPORTANTE, la landing debe verse terminada al abrirla: cada <img> tiene que apuntar a una',
      'imagen que CARGUE de verdad. Usa https://picsum.photos/seed/PALABRA/ANCHO/ALTO donde PALABRA es una',
      'palabra clave EN INGLES que describa esa foto concreta (barbershop, dentist, coffee-roasting...),',
      'distinta en cada imagen. Es importante que sea descriptiva y no un codigo al azar: ConvertIA la usa',
      'para buscar la foto real del tema cuando hay banco de imagenes configurado.',
      'Nada de rutas inventadas tipo /img/hero.jpg, que se ven rotas.',
      'Cada imagen lleva width y height explicitos, loading="lazy" (salvo el hero, que va eager con',
      'fetchpriority="high") y un alt descriptivo real.',
      'Encima de cada <img> deja un comentario HTML con el prompt en ingles, para que sea trivial sustituir',
      'la foto temporal por la definitiva. Por ejemplo: <!-- Reemplazar por: cinematic wide shot of... -->',
    ].join('\n'),
    soloObjective:
      'Producir la landing y su briefing completo de activos de imagen, con prompts en ingles listos para un generador visual.',
    checklist: [
      'Cada imagen del HTML tiene alt descriptivo y dimensiones explicitas.',
      'Cada activo incluye prompt en ingles con encuadre, luz y restricciones negativas.',
      'El hero carga con prioridad y el resto en lazy.',
    ],
  },

  // --------------------------------------------------------------- 5
  {
    slug: 'video-assets',
    name: 'Activos de Video',
    tagline: 'Clips dinamicos para el Hero (Runway / Luma / Sora).',
    category: 'Activos',
    icon: 'Video',
    whatItDoes: [
      'Propone 2-3 clips cortos para el Hero con guion plano a plano y duracion exacta.',
      'Entrega el prompt en ingles para Runway, Luma o Sora, con movimiento de camara y ritmo.',
      'Incluye el HTML del video de fondo con poster, muted, loop, playsinline y respaldo en imagen.',
      'Respeta prefers-reduced-motion: si el usuario lo pide, el video se sustituye por imagen estatica.',
    ],
    directive: [
      'Anade una seccion final "ACTIVOS DE VIDEO" con 2 o 3 clips para el area del Hero o para una seccion de demostracion.',
      'Para CADA clip entrega: duracion (3-8 segundos, pensado para bucle sin corte perceptible), guion plano a plano, movimiento de camara (slow push-in, lateral dolly, static with subject motion, overhead orbit), ritmo, y un PROMPT EN INGLES listo para Runway / Luma / Sora / Kling.',
      'Especifica primer y ultimo fotograma para que el bucle sea invisible, y que el clip debe funcionar SIN audio y SIN texto incrustado.',
      'En el HTML incluye el video de fondo correctamente implementado: autoplay muted loop playsinline',
      'preload="metadata" y capa de oscurecimiento que garantice contraste AA del titular.',
      'El atributo poster DEBE apuntar a una imagen que cargue de verdad (usa picsum.photos con una semilla),',
      'para que la seccion se vea bien incluso antes de que exista el video definitivo.',
      'Incluye en el CSS un bloque @media (prefers-reduced-motion: reduce) que oculte el video y muestre el poster estatico.',
      'Indica el peso maximo objetivo del clip (menos de 2 MB, formato .mp4 H.264 y alternativa .webm).',
    ].join('\n'),
    soloObjective:
      'Producir la landing con un Hero en video correctamente implementado y el briefing de clips listo para un generador de video.',
    checklist: [
      'El video es muted, loop, playsinline y tiene poster de respaldo.',
      'Existe fallback para prefers-reduced-motion.',
      'El titular mantiene contraste AA sobre el video.',
    ],
  },

  // --------------------------------------------------------------- 6
  {
    slug: 'subtractive-design',
    name: 'Diseno Sustractivo',
    tagline: 'Elimina el 30% de adornos y texto redundante.',
    category: 'Calidad',
    icon: 'Scissors',
    whatItDoes: [
      'Ordena una pasada final de recorte: quitar el 30% de elementos decorativos y de palabras redundantes.',
      'Prioriza el espacio en blanco y una sola jerarquia dominante por seccion.',
      'Limita sombras, bordes, iconos y animaciones a un maximo verificable.',
      'Pide informe de lo eliminado para que la reduccion sea auditable.',
    ],
    directive: [
      'Aplica DISENO SUSTRACTIVO como ultima pasada antes de entregar: recorta aproximadamente el 30% de todo lo que no sostenga la conversion.',
      'Reglas duras de recorte:',
      '  - Cada seccion tiene UNA sola idea y UN solo elemento dominante. Si compiten dos, elimina el mas debil.',
      '  - Maximo 1 llamada a la accion primaria visible por pantalla; las secundarias van como enlace de texto, no como boton.',
      '  - Titulares de 12 palabras o menos; parrafos de 3 lineas o menos; cero frases de relleno introductorias.',
      '  - Sombras: como maximo 2 niveles en todo el sistema. Bordes: un solo grosor. Radios: un solo valor mas su variante pequena.',
      '  - Sin iconos decorativos que repitan lo que ya dice el texto.',
      '  - Sin animaciones que no comuniquen estado o jerarquia. Maximo 3 transiciones distintas.',
      '  - El espacio en blanco es el elemento de diseno principal: prefiere aumentar el aire antes que anadir un adorno.',
      'Al final, en una seccion "RECORTE APLICADO", lista en 5-8 lineas que eliminaste y por que. La reduccion debe ser auditable, no declarativa.',
    ].join('\n'),
    soloObjective:
      'Entregar una landing deliberadamente reducida, con menor carga cognitiva y un informe de lo que se elimino.',
    checklist: [
      'Una sola idea y una sola llamada a la accion primaria por pantalla.',
      'Sombras, radios y transiciones limitados a los maximos indicados.',
      'Existe informe RECORTE APLICADO con lo eliminado.',
    ],
  },

  // --------------------------------------------------------------- 7
  {
    slug: 'negative-constraints',
    name: 'Restricciones Negativas',
    tagline: 'Prohibe clichas de copy y gradientes genericos de IA.',
    category: 'Copywriting',
    icon: 'Ban',
    whatItDoes: [
      'Bloquea una lista negra explicita de palabras cliche (revolucionario, ecosistema, potenciar, solucion integral...).',
      'Prohibe los gradientes morado-azul y las esteticas reconocibles como "hechas por IA".',
      'Veta patrones estructurales gastados: hero centrado con degradado, tres tarjetas iguales, testimonios inventados.',
      'Exige una auto-revision final: buscar cada termino prohibido y reescribirlo.',
    ],
    directive: [
      'RESTRICCIONES NEGATIVAS de cumplimiento obligatorio.',
      'LISTA NEGRA DE COPY, no uses estas palabras ni sus variantes: revolucionario, disruptivo, ecosistema, potenciar, empoderar, solucion integral, llevar al siguiente nivel, sinergia, holistico, innovador, unico en el mercado, transformar tu vida, desbloquea tu potencial, lider del sector, de vanguardia, imprescindible, sin precedentes, robusto, escalable (como adjetivo de marketing), experiencia inigualable.',
      'PROHIBICIONES VISUALES: gradiente morado-a-azul y cualquier degradado arcoiris; glassmorphism por defecto; sombras difusas gigantes de color; emojis como iconografia de interfaz; capturas falsas de dashboards; iconos genericos de cohete, bombilla o engranaje.',
      'PROHIBICIONES ESTRUCTURALES: hero centrado con degradado y dos botones; fila de tres tarjetas identicas; testimonios inventados con nombres y fotos falsas (si no hay datos reales usa marcadores honestos del tipo [Testimonio real pendiente]); metricas fabricadas sin respaldo.',
      'PROHIBIDO el relleno de contenido: nada de lorem ipsum ni de secciones vacias por completar. Todo el texto debe ser especifico del proyecto.',
      'AUTO-REVISION FINAL: antes de entregar, recorre tu propio texto buscando cada termino de la lista negra y reescribe la frase completa con lenguaje concreto y verificable. Confirma el resultado en una linea: "Auto-revision de restricciones negativas: OK".',
    ].join('\n'),
    soloObjective:
      'Entregar una landing libre de clichas de copy y de estetica generica de IA, con auto-revision final verificada.',
    checklist: [
      'Ninguna palabra de la lista negra aparece en el texto final.',
      'No hay gradientes morado-azul ni iconografia generica.',
      'No hay testimonios ni metricas fabricadas.',
    ],
  },

  // --------------------------------------------------------------- 8
  {
    slug: 'human-copy',
    name: 'Copy Humano',
    tagline: 'Micro-copys naturales y persuasivos en cada boton.',
    category: 'Copywriting',
    icon: 'MessageSquareQuote',
    whatItDoes: [
      'Sustituye "Enviar" o "Mas informacion" por micro-copys en primera persona orientados al resultado.',
      'Escribe el micro-copy de apoyo que reduce el riesgo justo debajo de cada boton.',
      'Redacta estados reales de interfaz: vacio, cargando, exito y error, con voz humana.',
      'Impone ritmo de lectura variado y lenguaje de conversacion, con frases cortas y verbos concretos.',
    ],
    directive: [
      'El texto debe sonar a persona, no a departamento de marketing.',
      'MICRO-COPY DE ACCION: ninguna llamada a la accion puede decir "Enviar", "Mas informacion", "Click aqui" ni "Empezar". Escribela en primera persona y orientada al resultado que recibe el usuario (Quiero mi plan de 30 dias, Ver el metodo completo, Empiezo gratis hoy).',
      'MICRO-COPY DE APOYO: bajo cada llamada a la accion, una linea corta que elimine riesgo o friccion (Gratis. Sin tarjeta. / 2 minutos, cancelas cuando quieras. / Te respondemos el mismo dia.). Debe ser especifica y honesta, nunca generica.',
      'ESTADOS DE INTERFAZ redactados con voz humana: vacio, cargando, exito y error. Los errores dicen que paso y como seguir, nunca "Error inesperado".',
      'RITMO: alterna frases muy cortas con alguna larga. Usa segunda persona. Verbos concretos, voz activa, cero adverbios de relleno. Evita signos de exclamacion salvo uno como maximo en toda la pagina.',
      'PRUEBA DE LECTURA EN VOZ ALTA: si una frase no se puede decir en voz alta sin sonar a folleto corporativo, reescribela.',
      'Etiquetas de formulario en lenguaje natural, con texto de ayuda que explique para que se usara el dato.',
    ].join('\n'),
    soloObjective:
      'Entregar una landing cuyo copy, micro-copys y estados de interfaz suenen escritos por una persona concreta.',
    checklist: [
      'Ninguna llamada a la accion usa verbos genericos.',
      'Cada boton principal tiene micro-copy de apoyo que reduce riesgo.',
      'Los estados de error explican que paso y como seguir.',
    ],
  },
  // --------------------------------------------------------------- 9
  {
    slug: 'purposeful-motion',
    name: 'Movimiento con Proposito',
    tagline: 'Animaciones que guian la mirada, no que distraen.',
    category: 'Interaccion',
    icon: 'Sparkles',
    whatItDoes: [
      'Anade aparicion progresiva de las secciones al hacer scroll, con IntersectionObserver y sin librerias.',
      'Pide un gesto de entrada para el titular del hero, que es donde se decide si el usuario se queda.',
      'Exige estados de hover y foco visibles en botones y tarjetas, para que la pagina se sienta viva al tocarla.',
      'Pone limites: solo transform y opacity, duraciones cortas y respeto total a prefers-reduced-motion.',
    ],
    directive: [
      'La pagina debe sentirse viva al recorrerla, sin caer en el efectismo. Aplica MOVIMIENTO CON PROPOSITO:',
      '  1. ENTRADA DEL HERO: el titular y la llamada a la accion aparecen con un desplazamiento corto',
      '     (12-20px) y fundido de 400-600 ms, escalonados entre si por 80-120 ms. Solo al cargar, una vez.',
      '  2. APARICION AL SCROLL: cada seccion se revela cuando entra en pantalla, con IntersectionObserver',
      '     (nada de librerias externas). Fundido mas desplazamiento de 16-24px, una sola vez por elemento.',
      '     Marca las secciones ya visibles para que no vuelvan a animarse al subir.',
      '  3. ESTADOS AL TOCAR: botones y tarjetas reaccionan al hover y al foco con un cambio perceptible pero',
      '     sobrio (elevacion, subrayado que crece, cambio de fondo). Transiciones de 150-250 ms.',
      '  4. UN SOLO ACENTO EN MOVIMIENTO: elige UN elemento con animacion continua y discreta (una linea que se',
      '     dibuja, un contador que sube, un degradado que respira muy lento). Solo uno en toda la pagina.',
      '',
      'LIMITES DE CUMPLIMIENTO OBLIGATORIO:',
      '  - Anima UNICAMENTE transform y opacity. Nunca width, height, top, left ni margin: provocan reflow.',
      '  - Ninguna animacion supera los 600 ms. Nada parpadea, rebota ni gira sin motivo.',
      '  - El contenido debe ser legible aunque el JavaScript falle: el estado inicial del CSS no puede dejar',
      '    texto invisible de forma permanente (usa una clase que el script anade, no al reves).',
      '  - Bloque @media (prefers-reduced-motion: reduce) que desactive TODO el movimiento y deje la pagina',
      '    completamente usable y visible.',
      '  - Nada de animaciones que retrasen la lectura del titular o el acceso a la llamada a la accion.',
    ].join('\n'),
    soloObjective:
      'Entregar una landing con movimiento sobrio y util: entrada del hero, aparicion al scroll y estados de interaccion, sin librerias y respetando prefers-reduced-motion.',
    checklist: [
      'Las secciones aparecen al hacer scroll una sola vez, sin saltos de layout.',
      'Solo se animan transform y opacity, y ninguna animacion pasa de 600 ms.',
      'Con prefers-reduced-motion activo, la pagina se ve completa y sin movimiento.',
      'El texto sigue siendo visible aunque el JavaScript no se ejecute.',
    ],
  },
] as const;

/** Mapa slug -> tecnica, para acceso O(1). */
export const TECHNIQUE_MAP: Readonly<Record<TechniqueSlug, Technique>> = Object.freeze(
  TECHNIQUES.reduce(
    (acc, technique) => {
      acc[technique.slug] = technique;
      return acc;
    },
    {} as Record<TechniqueSlug, Technique>,
  ),
);

export function getTechnique(slug: TechniqueSlug): Technique {
  return TECHNIQUE_MAP[slug];
}

/** Type guard para validar slugs que llegan desde la base de datos o la API. */
export function isTechniqueSlug(value: unknown): value is TechniqueSlug {
  return typeof value === 'string' && (TECHNIQUE_SLUGS as readonly string[]).includes(value);
}

/** Normaliza una lista desconocida a slugs validos, en el orden canonico. */
export function normalizeTechniques(value: unknown): TechniqueSlug[] {
  if (!Array.isArray(value)) return [];
  const found = new Set(value.filter(isTechniqueSlug));
  return TECHNIQUE_SLUGS.filter((slug) => found.has(slug));
}

/** Devuelve las tecnicas en el orden canonico de la biblioteca. */
export function sortTechniques(slugs: readonly TechniqueSlug[]): TechniqueSlug[] {
  const set = new Set(slugs);
  return TECHNIQUE_SLUGS.filter((slug) => set.has(slug));
}
