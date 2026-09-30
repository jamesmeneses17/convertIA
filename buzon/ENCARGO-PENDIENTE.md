# ENCARGO LP-7Z4J

**Proyecto:** Sesiones de terapia cognitivo-conductual por videollamada, agenda f...
**Creado:** 2026-09-30T14:57:52.518Z

## Instrucciones para Claude

1. Cumple al pie de la letra el Prompt Maestro que viene mas abajo.
2. Escribe el resultado en un archivo llamado `ENTREGA.html` **en esta misma carpeta**.
3. Debe ser un documento HTML completo y autocontenido: CSS y JavaScript embebidos,
   sin dependencias externas, que funcione abriendolo en el navegador.
4. No cambies el nombre del archivo ni lo guardes en otro sitio: ConvertIA lo esta esperando
   y lo mostrara renderizado en cuanto aparezca.

---

## PROMPT MAESTRO

==============================================================================
PROMPT MAESTRO — LANDING PAGE
Proyecto: terapia cognitivo-conductual en linea, con valoracion inicial gratuita
Codigo interno: LP-DC2U · semilla 5261
==============================================================================

------------------------------------------------------------------------------
1. TU ROL Y EL ESTANDAR DE CALIDAD
------------------------------------------------------------------------------

Actuas como disenador-desarrollador senior especializado en paginas de captacion para
servicios de salud mental. Has trabajado con consultas privadas y sabes dos cosas que un
generalista no sabe:

  a) Quien llega a esta pagina no esta comparando features. Esta reuniendo el valor para
     pedir ayuda por primera vez, y cualquier friccion visual o promesa exagerada le da
     la excusa perfecta para cerrar la pestana y dejarlo "para enero".
  b) La salud mental se comunica con sobriedad. Una pagina que parece una startup de
     productividad, o que vende felicidad con stock photos de gente saltando en un campo,
     destruye la credibilidad clinica en tres segundos.

El estandar es este: la pagina tiene que parecer encargada a un estudio de diseno
editorial por una psicologa que cuida su reputacion. Nada de plantilla SaaS. Si al
terminar la pagina podria servir, cambiando cuatro palabras, para una app de finanzas o
un gimnasio, has fallado y tienes que rehacerla.

Entregas un unico archivo HTML autonomo, terminado, con contenido real escrito por ti
(no lorem ipsum, no placeholders de texto). Nada de "aqui iria el testimonio".

------------------------------------------------------------------------------
2. EL ENCARGO
------------------------------------------------------------------------------

La clienta es una psicologa con consulta 100% en linea. Atiende adultos en terapia
cognitivo-conductual por videollamada. Su diferencia real frente a la consulta de barrio
son tres cosas concretas, y las tres tienen que quedar claras antes del primer scroll:

  1. Sesiones por videollamada, desde casa, sin sala de espera y sin cruzarse con nadie.
  2. Agenda con franjas nocturnas: hay horas a las 21:00 y a las 22:00 en dias de semana,
     pensadas para quien sale de trabajar tarde o no quiere pedir permiso para ir a
     terapia.
  3. La primera sesion es de valoracion y no se cobra. Sirve para contar que pasa, oir un
     plan y decidir. No hay compromiso de continuar ni paquetes que haya que contratar.

A QUIEN LE HABLAS

Adultos de 25 a 40 anos que llevan meses —a veces anos— funcionando con ansiedad de
fondo o con una sensacion de bloqueo: duermen mal, aplazan decisiones, se les acelera el
pecho antes de una reunion, han empezado a decir "no" a planes. No estan en crisis
aguda; estan cansados. Ya han pensado en ir a terapia varias veces y no han dado el
paso, y el motivo casi nunca es el dinero: es la pereza de buscar, la incomodidad de
contarle su vida a un desconocido en una sala con la puerta cerrada, el miedo a que se
les considere un caso grave, y una verguenza sorda por no poder resolverlo solos ("otros
tienen problemas de verdad").

Escribe para esa persona leyendo el movil a las 23:40 de un martes, con la pareja
dormida al lado. Ese es el contexto real de lectura y condiciona todo: frases cortas,
nada que grite, un solo paso siguiente muy claro.

ACCION PRINCIPAL

Reservar la valoracion gratuita. Es el unico objetivo de conversion de la pagina. No hay
newsletter, no hay descarga de ebook, no hay "descubre mas". Todo empuja al mismo sitio.

TONO

Calido, honesto y llano. Cero jerga clinica en los titulares: no escribas "abordaje
psicoterapeutico", "reestructuracion cognitiva", "sintomatologia ansiosa" ni "salud
mental integral" en ningun titular ni boton. Los terminos tecnicos, si aparecen, van una
sola vez y explicados de inmediato en lenguaje de calle. Honesto tambien significa no
prometer resultados: la terapia no "elimina la ansiedad en 6 semanas", y decirlo asi te
delata como IA que no entiende el sector.

------------------------------------------------------------------------------
3. ARQUETIPO DE COMPOSICION: REJILLA MODULAR (obligatorio)
------------------------------------------------------------------------------

Construye la pagina como un mosaico de bloques de distintos tamanos, con una pieza
dominante por pantalla y piezas satelite mas pequenas a su alrededor.

POR QUE ESTE Y NO OTRO: esta persona no lee, escanea con miedo. Un mosaico le deja
encontrar de un vistazo la unica pieza que le desbloquea —"cuanto cuesta", "hay hora a
las 22:00", "que pasa si me quedo en blanco"— sin obligarla a leer un discurso lineal
que la haria abandonar antes de llegar al dato. Descarto expresamente el zigzag
narrativo: impone un ritmo de lectura secuencial y aqui el lector necesita elegir por
donde entra.

REGLAS VERIFICABLES DE LA REJILLA:

  - Base de 12 columnas en escritorio. En movil, una sola columna: el mosaico se apila y
    la pieza dominante de cada seccion va siempre primera.
  - Cada seccion tiene exactamente una pieza dominante que ocupa entre 7 y 12 columnas y
    es visiblemente mas grande que sus satelites. Prohibido que dos bloques de la misma
    seccion tengan el mismo peso visual: si empatan, agranda uno o reduce el otro.
  - Usa tres tamanos de modulo y solo tres: grande (7-12 col), medio (4-6 col), pequeno
    (3-4 col). Nada intermedio.
  - Canal entre modulos constante de 20px en movil y 28px en escritorio. No lo varies por
    seccion.
  - Al menos dos modulos de toda la pagina deben ser "vacios utiles": un modulo que solo
    contiene una frase corta con mucho aire alrededor, sin icono ni borde. El vacio forma
    parte de la rejilla, no es un hueco por rellenar.
  - Prohibido el carrusel, el acordeon decorativo y las tarjetas de altura desigual que
    dejan dientes de sierra al final de una fila.

------------------------------------------------------------------------------
4. DIRECCION TIPOGRAFICA: SANS GEOMETRICA (obligatorio)
------------------------------------------------------------------------------

Toda la pagina en una sola familia sans de formas limpias y geometricas, con la jerarquia
construida solo con peso y tamano. Encaja con el tono porque una serif editorial daria
un aire institucional y de "informe clinico" que es justo lo que este publico teme, y una
condensada de cartel gritaria.

  - Pila de fuentes del sistema, sin dependencias externas ni Google Fonts: primero
    "Inter", luego "Segoe UI", luego "Helvetica Neue", luego Arial, luego sans-serif.
  - Solo tres pesos en toda la pagina: 400 para cuerpo, 500 para etiquetas y botones,
    700 para titulares. Nada de 300 (ilegible en crema) ni de 800/900.
  - Escala fluida: h1 entre 34px en movil y 62px en escritorio; h2 entre 25px y 38px;
    cuerpo 17px en movil y 18px en escritorio; nunca por debajo de 15px, ni en notas
    legales ni en pies de foto.
  - Interlineado 1.15 en titulares, 1.6 en cuerpo. Medida de lectura maxima de 66
    caracteres por linea en cualquier bloque de texto corrido.
  - Cero mayusculas sostenidas en titulares. Se permiten solo en etiquetas de una o dos
    palabras (por ejemplo la etiqueta de una seccion), con 0.08em de espaciado entre
    letras.
  - Cero cursiva decorativa y cero subrayado salvo en enlaces de texto.

------------------------------------------------------------------------------
5. PALETA Y FIRMA VISUAL (valores exactos, no interpretables)
------------------------------------------------------------------------------

  #F7F2EA  crema — fondo dominante de la pagina
  #EFE6D9  crema hueso — fondo de modulos y de secciones alternas
  #2E2A26  tinta tierra — texto principal (contraste sobre crema > 12:1)
  #6B6157  tinta suave — texto secundario y pies de foto
  #7A4030  tierra profunda — fondo de los botones principales, texto en #F7F2EA
  #A4614A  terracota — bordes, subrayados gruesos, estados hover
  #C9BEDD  lavanda suave — solo como relleno de acento y fondo del arco decorativo
  #574a73  lavanda profunda — enlaces de texto y etiquetas de seccion
  #8F9E8B  salvia — un unico uso en toda la pagina: el indicador de plazas nocturnas

Prohibido introducir cualquier otro color, incluido el blanco puro #FFFFFF: si necesitas
un plano mas claro, usa #FDFBF7. Prohibidos los degradados de dos tintas saturadas, el
morado-a-cian, el glassmorphism, las sombras azuladas y los brillos de neon. Sombras
permitidas: una sola, muy baja y calida, del tipo desplazamiento vertical de 2px, difusion
de 12px, negro al 6%. Nada mas.

FIRMA GRAFICA REPETIDA — "EL ARCO DE VENTANA":

Una forma de ventana con la parte superior redondeada: esquinas superiores con radio de
96px (56px en movil) y esquinas inferiores con radio de 10px. Es el motivo que cose toda
la pagina y alude a la ventana iluminada de casa a la que se conecta la sesion nocturna.

  - Todas las fotografias van recortadas con esa forma de arco, sin excepcion.
  - La pieza dominante del hero lleva un arco de #C9BEDD desplazado 12px abajo y 12px a
    la derecha detras de la foto, visible como un borde de color.
  - Cada etiqueta de seccion va precedida de un pequeno arco macizo de 14x18px en
    #A4614A.
  - Los botones son pastilla completa (radio 999px): el arco es para imagenes y modulos,
    la pastilla para acciones. No los mezcles.
  - Aparece minimo 6 veces y maximo 12 en toda la pagina. Contarlas es parte del
    checklist.

------------------------------------------------------------------------------
6. ARQUITECTURA DE SECCIONES (este orden, siete secciones)
------------------------------------------------------------------------------

1. PORTADA MODULAR
   Proposito: que en la primera pantalla sepa que puede empezar esta semana, de noche,
   sin pagar la primera sesion. Pieza dominante: bloque de texto con el unico h1 de la
   pagina y el boton principal. Satelites: una foto en arco (interior domestico calido
   de noche), un modulo pequeno con la franja horaria disponible mas proxima, y un
   modulo pequeno con el dato de la valoracion sin coste. Sin menu de navegacion largo:
   como maximo un logotipo de texto y un enlace ancla al formulario.

2. "PUEDE QUE TE SUENE"
   Proposito: reconocimiento antes que argumento. Cuatro modulos medianos con frases en
   primera persona que describen sintomas cotidianos reconocibles (dormir mal, aplazar,
   cancelar planes, la sensacion de estar funcionando en automatico), escritas sin
   dramatismo y sin diagnosticar. Cierra con un modulo de vacio util: una linea que diga,
   con otras palabras, que llevar meses asi no lo convierte en algo menor.

3. "LA PRIMERA SESION, MINUTO A MINUTO"
   Proposito: desactivar el miedo numero uno, que es no saber que va a pasar. Pieza
   dominante: una secuencia de cuatro momentos de los 50 minutos de la valoracion (como
   se entra, que se pregunta al principio, en que consiste el plan que se propone, como
   se decide si seguir). Satelite: un modulo con lo que NO va a pasar en esa sesion.
   Esta seccion es la mas importante de la pagina: dale el mayor peso visual.

4. "COMO FUNCIONA ESTO, SIN TECNICISMOS"
   Proposito: explicar la terapia cognitivo-conductual en lenguaje llano y justificar por
   que es el enfoque, no relleno educativo. Pieza dominante: la explicacion en tres o
   cuatro frases de la idea central (trabajar sobre lo que uno piensa y hace en
   situaciones concretas, con tareas entre sesiones). Satelites: dos modulos con un
   ejemplo concreto de ejercicio entre sesiones.

5. "QUIEN TE VA A ESCUCHAR"
   Proposito: la confianza aqui no es de marca, es de persona. Pieza dominante: retrato
   en arco. Satelites: numero de colegiacion, formacion en TCC, anos de consulta, idiomas,
   y una frase corta en primera persona sobre como trabaja. Nada de logotipos de
   universidades ni medallas.

6. "HORARIOS, PRECIO Y DUDAS INCOMODAS"
   Proposito: quitar las dos ultimas excusas, dinero y logistica, y responder lo que no
   se atreve a preguntar. Pieza dominante: las franjas nocturnas reales y la tarifa de
   las sesiones siguientes en euros, dicha sin rodeos, junto con que no hay paquetes ni
   permanencia. Satelites: cuatro preguntas escritas como las diria el lector —quedarme
   en blanco, si esto lleva a medicacion, privacidad de la videollamada, si por pantalla
   funciona igual que en persona— con respuestas de dos o tres frases.

7. RESERVA
   Proposito: cerrar. Formulario de cuatro campos como maximo: nombre, correo, telefono
   opcional y un selector de franja horaria preferida. Una linea sobre confidencialidad
   junto al boton. Repite ahi que la valoracion no se cobra, porque es lo ultimo que lee
   antes de pulsar.

DECISION SOBRE PRUEBA SOCIAL: no hay seccion de testimonios con nombre y foto, y esto es
deliberado, no un olvido. Publicar testimonios de pacientes es eticamente problematico y
en varios paises esta restringido para profesionales sanitarios; ademas, este publico
desconfia de la resena entusiasta. La sustituyes por dos piezas verificables: el numero
de procesos acompanados y de anos de consulta en la seccion 5, y dentro de la seccion 6
un modulo con dos frases anonimas y sobrias del tipo "lo que mas repiten al final de la
primera sesion", sin nombre, sin inicial, sin foto y sin estrellas.

------------------------------------------------------------------------------
7. DIRECTIVAS DE TECNICA
------------------------------------------------------------------------------

7.1 CADENAS SEMILLA — direccion de arte con identidad propia
La cadena de estilo que gobierna toda decision estetica es esta, y resuelvela literalmente:
"ventana iluminada a las diez de la noche · papel de carta color crema · terracota
desgastada · lavanda de tarde · nada de clinica". Traduccion obligatoria: luz siempre
calida y lateral, jamas luz fria de fluorescente; texturas de papel y ceramica, nunca
cristal ni metal; formas de arco, nunca rectangulos de esquina viva. Prohibido de forma
explicita: cerebros, cabezas de perfil con engranajes, divanes, bombillas, mariposas,
puzzles, siluetas meditando en loto, plantas monstera como unico atrezzo y cualquier
icono de cerebro en cualquier tamano.

7.2 PROMPTS AMBICIOSOS — psicologia del lector, resuelta en la pagina
Antes de escribir, anota internamente estos cinco frenos y asigna a cada uno un lugar
concreto de la pagina donde queda respondido. Ninguno puede quedar sin sitio:
   F1 "no se que va a pasar y me da vertigo" → seccion 3, minuto a minuto.
   F2 "mi problema no es tan grave, estoy ocupando el sitio de alguien peor" → cierre de
      la seccion 2, validando sin exagerar.
   F3 "no puedo ir a una consulta sin que en casa o en el trabajo se enteren" → portada
      y seccion 6, franjas nocturnas desde casa.
   F4 "y si no conecto con ella y ya he pagado" → portada y seccion 7, valoracion sin
      coste y sin compromiso de continuar.
   F5 "por videollamada no puede ser lo mismo" → pregunta explicita en la seccion 6,
      respondida sin defensividad.
Ademas, un limite etico que es tambien de eficacia: cero urgencia artificial. Nada de
contadores, "quedan 2 plazas hoy" ni descuentos que expiran. El unico dato de escasez
permitido es real y neutro: cuantas franjas nocturnas quedan libres esta semana.

7.3 COPY HUMANO — microcopy de cada accion
Ningun boton dice "Enviar", "Reservar ahora", "Empezar", "Saber mas", "Contactar" ni
"Agenda tu cita". Cada uno se escribe en primera persona del lector y nombra lo que
ocurre al pulsar, en cuatro a siete palabras, del tipo "Quiero la primera sesion" o "Ver
las horas de noche". Bajo cada boton principal va una linea de apoyo de menos de doce
palabras que retira el riesgo (que no se cobra, que se puede cambiar la hora, cuanto se
tarda en responder). Los titulares de seccion se leen como algo que diria una persona en
voz baja, no como un titulo de indice. Longitud maxima de parrafo: cuatro lineas en
escritorio.

7.4 RESTRICCIONES NEGATIVAS — lista de prohibiciones
Prohibidas estas palabras y familias completas: "transforma tu vida", "desbloquea tu
potencial", "bienestar 360", "viaje de autoconocimiento", "revoluciona", "empodera",
"holistico", "la mejor version de ti mismo", "sanar tu nino interior", "libre de ansiedad
para siempre", "solucion definitiva". Prohibido usar "simplemente" y "solo" para
minimizar el esfuerzo de pedir ayuda. Prohibido el titular de tres palabras con punto
entre cada una. Prohibidos los emoji. Prohibido prometer plazos o resultados garantizados.
Prohibidas las cifras inventadas con aire de estudio: si citas un dato de eficacia de la
TCC, formulalo como afirmacion cualitativa y no como porcentaje falso.

7.5 MOVIMIENTO CON PROPOSITO
Solo tres animaciones en toda la pagina, y cada una tiene que justificar su existencia
dirigiendo la mirada:
   M1 Entrada de los modulos al aparecer en pantalla: opacidad de 0 a 1 y 14px de
      desplazamiento vertical, 420ms, curva suave de salida, con 70ms de retardo
      encadenado entre modulos de la misma fila para que el ojo lea primero la pieza
      dominante.
   M2 Estado activo de los botones: el fondo pasa de tierra profunda a terracota en
      180ms y el boton se eleva 1px. Nada de escalados ni de rebotes.
   M3 En la seccion 3, el paso activo de la secuencia de la primera sesion se marca con
      un subrayado de 3px en terracota que crece de izquierda a derecha en 260ms al
      entrar en foco o al pasar el cursor.
Nada de parallax, nada de scrollytelling, nada de contadores animados, nada que se mueva
en bucle. Respeta prefers-reduced-motion desactivando M1 y M3 por completo. Ninguna
animacion puede provocar desplazamiento de contenido ya leido.

7.6 DISENO SUSTRACTIVO
Escribe primero la pagina completa y despues haz una pasada de recorte obligatoria en la
que elimines alrededor del 30% de los elementos decorativos y del texto. Criterios de
poda, en este orden: fuera los iconos que solo repiten en dibujo lo que ya dice el
titular; fuera todo adjetivo que no aporte informacion comprobable; fuera cualquier
parrafo que repita una idea ya dicha en otra seccion; fuera los bordes cuando el cambio
de fondo ya separa los bloques; fuera las etiquetas de seccion redundantes. Objetivo
medible: como maximo 4 iconos en toda la pagina, ningun bloque de texto de mas de 70
palabras, y como maximo 7 botones o enlaces de accion en total contando el formulario.

7.7 ACTIVOS DE IMAGEN
Toda imagen se muestra con una direccion https://picsum.photos/seed/PALABRA/ANCHO/ALTO,
con PALABRA en ingles y descriptiva de esa foto concreta, ancho y alto reales en pixeles
declarados tambien como atributos de la imagen, y texto alternativo escrito para alguien
que no ve la foto. Usa estas semillas: "warmlamp" para el interior nocturno de la
portada, "windowrain" para la pieza de la seccion 2, "teacup" para la seccion 3,
"notebook" para el ejemplo de ejercicio de la seccion 4, "therapist" para el retrato de
la seccion 5 y "blanket" para el cierre. Todas las imagenes en carga diferida salvo la
de la portada.
Ademas, al final de tu entrega y fuera del HTML, incluye un bloque con seis prompts
listos para Midjourney o DALL-E, uno por cada imagen anterior, redactados en ingles y
con estos cuatro datos explicitos en cada uno: encuadre y distancia, direccion y
temperatura de la luz, paleta ligada a crema/terracota/lavanda, y relacion de aspecto.
Ejemplo de nivel exigido para la portada: plano medio del rincon de un salon a las 22:00,
lampara de mesa fuera de cuadro entrando por la izquierda a unos 2700K, un portatil
cerrado y una manta de lana, sin personas, textiles color crema y terracota, grano fino
de pelicula, 3:2. Cada prompt lleva su propia linea de exclusiones negativas coherente
con el punto 7.1.

7.8 ACTIVOS DE VIDEO
Al final de la entrega, tambien fuera del HTML, propon dos clips alternativos para la
pieza dominante de la portada, escritos para Runway, Luma o Sora, de 6 a 8 segundos,
pensados para reproducirse en bucle, sin audio, sin personas identificables y sin cortes.
Cada uno especifica: sujeto, un unico movimiento de camara muy lento (por ejemplo empuje
de 5% o panoramica lateral minima), la accion dentro del plano (una cortina que se mueve
apenas, vapor de una taza, la luz de la lampara ganando intensidad al anochecer),
iluminacion calida de interior, paleta de la pagina y relacion de aspecto 16:9 y 4:5.
Indica tambien el punto de bucle y el peso maximo objetivo. En el HTML, el video no se
implementa: deja la imagen de portada en su sitio y anade un comentario en el codigo
indicando donde iria el video, con que imagen de poster y con que atributos de
reproduccion silenciada, en bucle y desactivada bajo prefers-reduced-motion.

7.9 CREADOR Y CRITICO
Antes de darme el codigo, hazte una auditoria en dos roles. Como CRITICO UX/CRO, revisa la
pagina contra estos ocho puntos y anota para cada uno "cumple" o el arreglo que aplicas:
   1. En la primera pantalla se ven, sin scroll, la videollamada, la franja nocturna y la
      valoracion sin coste.
   2. Los cinco frenos F1 a F5 tienen un lugar identificable en la pagina.
   3. Cada seccion tiene una sola pieza dominante y no hay empates de peso visual.
   4. Ningun boton usa verbos genericos y todos los principales llevan linea de apoyo.
   5. Ninguna palabra de la lista negra del punto 7.4 aparece en la pagina.
   6. La pasada sustractiva se hizo de verdad: iconos, palabras por bloque y numero de
      acciones estan dentro de los limites.
   7. Contraste AA verificado en los pares criticos: crema sobre tierra profunda en los
      botones, tinta suave sobre crema hueso, lavanda profunda sobre crema.
   8. En 360px de ancho no hay desbordamiento horizontal ni texto por debajo de 15px.
Corrige lo que falle y entrega ya corregido. Al final incluye la tabla de esa auditoria
con los ocho puntos y su resultado, mas las tres decisiones que estuviste a punto de
tomar y descartaste, con el motivo en una linea cada una.

------------------------------------------------------------------------------
8. REQUISITOS TECNICOS
------------------------------------------------------------------------------

  - Un solo archivo .html, con el CSS en una etiqueta de estilo en la cabecera y el JS
    minimo en una etiqueta de script al final del cuerpo. Sin frameworks, sin CDN, sin
    fuentes externas, sin librerias de iconos: si hace falta un icono, va dibujado en SVG
    en linea.
  - HTML semantico: cabecera, main, secciones con su encabezado, pie. Un unico h1 en toda
    la pagina, en la portada. Jerarquia de encabezados sin saltos. El formulario con
    etiquetas asociadas a cada campo y no solo con texto de relleno dentro del campo.
  - Mobile-first: escribe los estilos base para 360px y sube con consultas de medios en
    720px y 1080px. Comprueba que el mosaico se apila en el orden correcto.
  - Accesibilidad: contraste minimo AA en todo texto, foco visible propio y no suprimido
    en todos los elementos interactivos con un contorno de 2px en lavanda profunda y 2px
    de separacion, area tactil minima de 44px, region del formulario anunciada
    correctamente y mensajes de error de validacion en texto y no solo en color.
  - Cada imagen con sus atributos de ancho y alto explicitos para que no salte el layout,
    y texto alternativo real.
  - Idioma del documento en espanol, titulo y meta descripcion escritos para este
    servicio, e informacion de la consulta marcada con datos estructurados.
  - El JS se limita a: la animacion de entrada de modulos mediante observador de
    interseccion respetando prefers-reduced-motion, el subrayado del paso activo de la
    seccion 3, el desplazamiento suave de los anclas hacia el formulario, y la validacion
    del formulario en el cliente con mensaje de exito simulado. Nada mas.

------------------------------------------------------------------------------
9. FORMATO DE SALIDA
------------------------------------------------------------------------------

Entrega, en este orden y sin preambulos:
  A) El archivo HTML completo, en un unico bloque de codigo, funcionando tal cual al
     abrirlo en un navegador.
  B) Bloque "PROMPTS DE IMAGEN": los seis prompts del punto 7.7.
  C) Bloque "PROMPTS DE VIDEO": los dos clips del punto 7.8.
  D) Bloque "AUDITORIA": la tabla de ocho puntos y las tres decisiones descartadas.
Sin explicaciones de como lo hiciste, sin resumen de la estructura, sin ofertas de
cambios.

------------------------------------------------------------------------------
10. CHECKLIST FINAL (repasalo antes de responder)
------------------------------------------------------------------------------

  [ ] Un solo h1, en la portada.
  [ ] Siete secciones, en el orden del punto 6, cada una con su pieza dominante.
  [ ] Portada con videollamada, franja nocturna y valoracion sin coste visibles sin scroll.
  [ ] Colores exclusivamente de la lista del punto 5, sin blanco puro ni degradados.
  [ ] El arco de ventana aparece entre 6 y 12 veces; todas las fotos van recortadas con el.
  [ ] Una sola familia sans y solo los pesos 400, 500 y 700.
  [ ] Cero terminos clinicos en titulares y botones; cero palabras de la lista negra.
  [ ] Botones en primera persona, con linea de apoyo bajo los principales.
  [ ] Maximo 4 iconos, maximo 7 acciones, ningun bloque de mas de 70 palabras.
  [ ] Solo las animaciones M1, M2 y M3, todas anuladas con prefers-reduced-motion.
  [ ] Sin urgencia artificial, sin contadores, sin promesas de resultado.
  [ ] Las seis imagenes usan las semillas indicadas de picsum con ancho y alto explicitos.
  [ ] Sin testimonios con nombre o foto; prueba social sustituida como indica el punto 6.
  [ ] Contraste AA y foco visible comprobados; sin desbordamiento a 360px.
  [ ] Un unico archivo, sin dependencias externas de ningun tipo.
  [ ] Incluidos los bloques B, C y D del punto 9.

DECISIONES: arquetipo=rejilla modular · tipografia=sans geometrica · semilla=5261