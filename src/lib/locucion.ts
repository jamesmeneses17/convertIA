/**
 * ============================================================================
 *  ConvertIA :: locucion
 * ----------------------------------------------------------------------------
 *  Tavus lee el guion en voz alta. Si el texto llega sin tildes ni enies, la
 *  voz dice cosas como "anos" en vez de "años", que ademas de sonar mal
 *  significa otra cosa muy distinta.
 *
 *  El codigo fuente de ConvertIA se escribe sin acentos a proposito (evita
 *  problemas de codificacion entre Windows, Docker y PostgreSQL), y los briefs
 *  de ejemplo siguen esa misma norma. Asi que antes de mandar nada a Tavus hay
 *  que devolverle las tildes al texto.
 *
 *  Esto NO es un corrector ortografico general: es una lista cerrada de
 *  palabras frecuentes en briefs comerciales. Si una palabra no esta en la
 *  lista, se deja tal cual.
 * ============================================================================
 */

/**
 * Palabras sin acentuar -> palabra correcta. En minusculas; la funcion
 * respeta despues las mayusculas del original.
 *
 * Las de "ñ" van primero en importancia: una tilde de menos se perdona al
 * oido, una "ñ" de menos cambia la palabra.
 */
const DICCIONARIO: Record<string, string> = {
  // --- ñ ---
  ano: 'año',
  anos: 'años',
  nino: 'niño',
  ninos: 'niños',
  nina: 'niña',
  ninas: 'niñas',
  diseno: 'diseño',
  disenos: 'diseños',
  disenar: 'diseñar',
  disenada: 'diseñada',
  disenado: 'diseñado',
  duena: 'dueña',
  dueno: 'dueño',
  duenas: 'dueñas',
  duenos: 'dueños',
  manana: 'mañana',
  mananas: 'mañanas',
  pequena: 'pequeña',
  pequeno: 'pequeño',
  pequenas: 'pequeñas',
  pequenos: 'pequeños',
  espanol: 'español',
  espanola: 'española',
  companero: 'compañero',
  companeros: 'compañeros',
  compania: 'compañía',
  senal: 'señal',
  senales: 'señales',
  senor: 'señor',
  senora: 'señora',
  sueno: 'sueño',
  suenos: 'sueños',
  ensenar: 'enseñar',
  ensenamos: 'enseñamos',
  ensenanza: 'enseñanza',
  manana_: 'mañana',
  bano: 'baño',
  banos: 'baños',
  cana: 'caña',
  montana: 'montaña',
  montanas: 'montañas',
  tamano: 'tamaño',
  tamanos: 'tamaños',
  acompanamiento: 'acompañamiento',
  acompanar: 'acompañar',
  campana: 'campaña',
  campanas: 'campañas',
  extranar: 'extrañar',
  manejo: 'manejo',

  // --- tildes de uso diario ---
  mas: 'más',
  dia: 'día',
  dias: 'días',
  aqui: 'aquí',
  alli: 'allí',
  asi: 'así',
  tambien: 'también',
  ademas: 'además',
  despues: 'después',
  rapido: 'rápido',
  rapida: 'rápida',
  facil: 'fácil',
  dificil: 'difícil',
  practico: 'práctico',
  practica: 'práctica',
  basico: 'básico',
  basica: 'básica',
  minimo: 'mínimo',
  maximo: 'máximo',
  ultimo: 'último',
  ultima: 'última',
  unico: 'único',
  unica: 'única',
  proximo: 'próximo',
  proxima: 'próxima',
  publico: 'público',
  publica: 'pública',
  telefono: 'teléfono',
  credito: 'crédito',
  metodo: 'método',
  numero: 'número',
  numeros: 'números',
  analisis: 'análisis',
  diagnostico: 'diagnóstico',
  clinica: 'clínica',
  clinicas: 'clínicas',
  medico: 'médico',
  medica: 'médica',
  energia: 'energía',
  garantia: 'garantía',
  economia: 'economía',
  categoria: 'categoría',
  tecnica: 'técnica',
  tecnicas: 'técnicas',
  tecnico: 'técnico',
  logistica: 'logística',
  estetica: 'estética',
  organico: 'orgánico',
  artesania: 'artesanía',
  fotografia: 'fotografía',
  fotografias: 'fotografías',
  video: 'vídeo',
  videos: 'vídeos',
  quiza: 'quizá',
  segun: 'según',
  estas: 'estás',
  esta_: 'está',
  yendo: 'yendo',

  // --- terminaciones -cion / -sion, las mas frecuentes en briefs ---
  sesion: 'sesión',
  sesiones: 'sesiones',
  atencion: 'atención',
  conversion: 'conversión',
  gestion: 'gestión',
  presion: 'presión',
  decision: 'decisión',
  decisiones: 'decisiones',
  solucion: 'solución',
  soluciones: 'soluciones',
  informacion: 'información',
  formacion: 'formación',
  valoracion: 'valoración',
  reservacion: 'reservación',
  suscripcion: 'suscripción',
  inscripcion: 'inscripción',
  aplicacion: 'aplicación',
  operacion: 'operación',
  produccion: 'producción',
  direccion: 'dirección',
  habitacion: 'habitación',
  habitaciones: 'habitaciones',
  alimentacion: 'alimentación',
  vacunacion: 'vacunación',
  migracion: 'migración',
  resolucion: 'resolución',
  seleccion: 'selección',
  retencion: 'retención',
  facturacion: 'facturación',
  certificacion: 'certificación',
  consulta: 'consulta',
  composicion: 'composición',
  tipografia: 'tipografía',
  mision: 'misión',
  vision: 'visión',
  pasion: 'pasión',
  ocasion: 'ocasión',
  impresion: 'impresión',
  revision: 'revisión',
  revisiones: 'revisiones',

  // --- mas vocabulario frecuente en briefs ---
  joven: 'joven',
  jovenes: 'jóvenes',
  pagina: 'página',
  paginas: 'páginas',
  camara: 'cámara',
  movil: 'móvil',
  moviles: 'móviles',
  util: 'útil',
  comun: 'común',
  jardin: 'jardín',
  musica: 'música',
  fisico: 'físico',
  fisica: 'física',
  logica: 'lógica',
  arbol: 'árbol',
  metrica: 'métrica',
  metricas: 'métricas',
  quimica: 'química',
  cirugia: 'cirugía',
  odontologo: 'odontólogo',
  veterinario: 'veterinario',
  academia: 'academia',
  ingles: 'inglés',
  frances: 'francés',
  aleman: 'alemán',
  japones: 'japonés',
  cafe: 'café',
  menu: 'menú',
  album: 'álbum',
  albums: 'álbumes',
  sabado: 'sábado',
  sabados: 'sábados',
  miercoles: 'miércoles',
  credito_: 'crédito',
  intereses: 'intereses',
};

/** Las claves con guion bajo son desambiguadores internos, no palabras. */
const PALABRAS = new Map(
  Object.entries(DICCIONARIO)
    .filter(([clave]) => !clave.endsWith('_'))
    .map(([sin, con]) => [sin, con]),
);

/** Copia el patron de mayusculas del original sobre la palabra corregida. */
function conservarMayusculas(original: string, corregida: string): string {
  if (original === original.toUpperCase() && original.length > 1) return corregida.toUpperCase();
  const primera = original[0];
  if (primera && primera === primera.toUpperCase()) {
    return corregida.charAt(0).toUpperCase() + corregida.slice(1);
  }
  return corregida;
}

/**
 * Devuelve las tildes y las enies a un texto escrito sin ellas, para que una
 * voz sintetica lo pronuncie bien. Solo toca palabras del diccionario.
 */
export function repararAcentos(texto: string): string {
  if (!texto) return texto;

  return texto.replace(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+/g, (palabra) => {
    // Si ya viene acentuada, quien la escribio sabia lo que hacia.
    if (/[ÁÉÍÓÚÜÑáéíóúüñ]/.test(palabra)) return palabra;

    const correcta = PALABRAS.get(palabra.toLowerCase());
    return correcta ? conservarMayusculas(palabra, correcta) : palabra;
  });
}
