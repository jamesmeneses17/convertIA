# ENCARGO LP-G8UQ

**Proyecto:** Plan de alimentacion para atletas amateur: dieta semanal ajustada a...
**Creado:** 2026-09-30T00:24:57.762Z

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
PROMPT MAESTRO | LANDING PAGE DE ALTA CONVERSION
Compilado por ConvertIA | 2026-09-30 00:24 UTC
Tecnicas activas (9/9): Cadenas Semilla + Prompts Ambiciosos + Creador y Critico + Activos de Imagen + Activos de Video + Diseno Sustractivo + Restricciones Negativas + Copy Humano + Movimiento con Proposito
==============================================================================

==============================================================================
00 | ROL Y ESTANDAR DE CALIDAD
==============================================================================
Actuas como un equipo senior de tres perfiles trabajando a la vez sobre el mismo entregable:
  - un DIRECTOR DE ARTE digital con criterio editorial;
  - un ESPECIALISTA EN CRO con experiencia en landing pages que convierten;
  - un DESARROLLADOR FRONT-END que escribe HTML semantico, CSS moderno y JavaScript sin dependencias.

Tu estandar de calidad es el de una pagina de producto premium publicada hoy, no el de una plantilla.
Piensa antes de escribir: primero decide estrategia y direccion de arte, despues maqueta.

==============================================================================
01 | BRIEF DEL PROYECTO
==============================================================================
TEMA / INDUSTRIA:
  Nutricion deportiva personalizada

OFERTA Y BENEFICIO PRINCIPAL:
  Plan de alimentacion para atletas amateur: dieta semanal ajustada a tu deporte, tu cuerpo y tu presupuesto, con revision quincenal

PUBLICO OBJETIVO:
  Corredores, ciclistas y crossfitters de 25 a 45 anos que entrenan 4 o 5 dias a la semana pero sienten que la dieta les frena y no saben que comer antes y despues de entrenar

TONO Y DIRECCION VISUAL:
  Cientifico pero cercano, de deportista a deportista. Verde cesped, negro y blanco puro. Fotografias de comida real, no de suplementos

ACCION PRINCIPAL (OBJETIVO DE CONVERSION):
  Disenar mi plan de nutricion

Todo el contenido debe ser especifico de este brief. Nada de texto generico reutilizable en otro sector.

==============================================================================
02 | ENCARGO
==============================================================================
Disena y programa una LANDING PAGE completa, lista para publicar, orientada a un unico objetivo de conversion.
La pagina debe funcionar abriendo un solo archivo en el navegador, sin compilar y sin instalar nada.
Cada decision de diseno debe poder justificarse por su efecto en la comprension o en la conversion.

==============================================================================
03 | TECNICAS AVANZADAS ACTIVADAS (9/9)
==============================================================================
Las siguientes directivas son de cumplimiento obligatorio y acumulativo. Si dos entran en conflicto,
gana la que reduzca friccion para el usuario; explica el conflicto en una linea al final de la respuesta.

------------------------------------------------------------------------------
T1. CADENAS SEMILLA  [seed-strings]  ::  Direccion de arte
------------------------------------------------------------------------------
ANTES de escribir una sola linea de codigo, genera una CADENA SEMILLA DE ESTILO y respetala sin desviarte en todo el documento:
  1. PALETA: 1 color base, 1 color de tinta/texto, 1 acento de alto contraste para conversion y 2 neutros. Declara los valores HEX exactos.
  2. TIPOGRAFIA: elige una pareja con contraste real, una Serif con caracter para titulares y una Sans neutra para cuerpo (o la inversion deliberada). Define la escala modular (razon 1.25 o 1.333) y el interlineado.
  3. REJILLA Y RITMO: define una rejilla (12 columnas, o rejilla asimetrica 7/5) y una escala de espaciado de 8px.
  4. FIRMA VISUAL: un unico recurso grafico repetido que identifique la marca (regla fina, numeracion de secciones, vineta geometrica, marco desplazado, subrayado dibujado). Usalo minimo 3 veces.
Materializa la cadena semilla como custom properties de CSS en :root y consumela siempre desde ahi; no escribas colores ni tamanos sueltos.
PROHIBIDO el layout por defecto "hero centrado + 3 tarjetas iguales + footer". Al menos DOS secciones deben usar composicion asimetrica (texto desplazado, imagen sangrada al borde, solapamiento controlado o tipografia de gran escala).

------------------------------------------------------------------------------
T2. PROMPTS AMBICIOSOS  [ambitious-prompts]  ::  Psicologia
------------------------------------------------------------------------------
Trabaja como estratega de conversion, no como maquetador. Antes del codigo, escribe un MAPA PSICOLOGICO de la audiencia:
  - 3 MIEDOS concretos que la frenan (que teme perder: dinero, tiempo, reputacion, identidad).
  - 3 OBJECIONES que diria en voz alta antes de convertir (es caro, no tengo tiempo, ya probe algo asi).
  - 3 MOTIVACIONES profundas (el cambio de estado que de verdad busca, no la caracteristica del producto).
Despues, DISENA LA PAGINA CONTRA ESE MAPA: cada seccion debe desactivar al menos un miedo o una objecion. Anota en un comentario HTML al inicio de cada seccion que objecion ataca.
Traduce cada caracteristica en consecuencia vital concreta y, cuando sea honesto, cuantificada (15 minutos al dia, en 30 dias, sin hoja de calculo).
Incluye una seccion de preguntas frecuentes con 4-6 preguntas construidas sobre las objeciones reales detectadas, con respuestas directas y sin evasivas.
Incluye una linea honesta de para-quien-NO-es. La exclusion explicita aumenta la confianza y filtra leads.

------------------------------------------------------------------------------
T3. CREADOR Y CRITICO  [creator-critic]  ::  Calidad
------------------------------------------------------------------------------
Trabaja en DOS PASADAS explicitas dentro de la misma respuesta:
  PASADA 1, CREADOR: construye la primera version completa de la pagina.
  PASADA 2, CRITICO: cambia de sombrero y auditala como consultor externo de UX/CRO que no escribio ese codigo. Se severo y concreto. Puntua de 1 a 10 y justifica en una linea cada criterio:
      a) Claridad de la promesa en los primeros 5 segundos (prueba del vistazo).
      b) Jerarquia visual y recorrido de la mirada hacia la accion principal.
      c) Friccion del formulario y de la llamada a la accion.
      d) Credibilidad y prueba social.
      e) Accesibilidad (contraste AA, foco visible, semantica, textos alternativos).
      f) Rendimiento y peso (CSS inutilizado, animaciones costosas, saltos de layout).
      g) Consistencia del sistema de diseno.
Todo criterio con nota inferior a 8 debe corregirse. Reescribe el codigo con las correcciones aplicadas.
ENTREGA SOLO LA VERSION CORREGIDA como codigo final, y debajo una seccion "AUDITORIA CRO" con la tabla de puntuaciones y la lista de correcciones que aplicaste. No entregues la version 1 en bruto.

------------------------------------------------------------------------------
T4. ACTIVOS DE IMAGEN  [image-assets]  ::  Activos
------------------------------------------------------------------------------
Anade una seccion final "ACTIVOS DE IMAGEN" con 3 a 5 activos (hero, prueba social/retrato, detalle de producto, textura de fondo).
Para CADA activo entrega: nombre de archivo sugerido, uso en la pagina, relacion de aspecto y medidas en px, y un PROMPT EN INGLES autonomo que especifique:
  - sujeto y accion concretos;
  - encuadre y lente (wide 24mm, portrait 85mm, macro, overhead flat-lay);
  - iluminacion (soft window light, golden hour rim light, high-key studio, single hard source);
  - paleta ligada a la cadena semilla del proyecto;
  - textura y acabado (film grain 35mm, matte, high contrast digital);
  - RESTRICCIONES NEGATIVAS: no text, no watermark, no logos, no distorted hands, no extra fingers, no stock-photo smile, no busy background;
  - zona de respiro: indica donde debe quedar espacio limpio para superponer el titular.
MUY IMPORTANTE, la landing debe verse terminada al abrirla: cada <img> tiene que apuntar a una
imagen que CARGUE de verdad. Usa https://picsum.photos/seed/PALABRA/ANCHO/ALTO donde PALABRA es una
palabra clave EN INGLES que describa esa foto concreta (barbershop, dentist, coffee-roasting...),
distinta en cada imagen. Es importante que sea descriptiva y no un codigo al azar: ConvertIA la usa
para buscar la foto real del tema cuando hay banco de imagenes configurado.
Nada de rutas inventadas tipo /img/hero.jpg, que se ven rotas.
Cada imagen lleva width y height explicitos, loading="lazy" (salvo el hero, que va eager con
fetchpriority="high") y un alt descriptivo real.
Encima de cada <img> deja un comentario HTML con el prompt en ingles, para que sea trivial sustituir
la foto temporal por la definitiva. Por ejemplo: <!-- Reemplazar por: cinematic wide shot of... -->

------------------------------------------------------------------------------
T5. ACTIVOS DE VIDEO  [video-assets]  ::  Activos
------------------------------------------------------------------------------
Anade una seccion final "ACTIVOS DE VIDEO" con 2 o 3 clips para el area del Hero o para una seccion de demostracion.
Para CADA clip entrega: duracion (3-8 segundos, pensado para bucle sin corte perceptible), guion plano a plano, movimiento de camara (slow push-in, lateral dolly, static with subject motion, overhead orbit), ritmo, y un PROMPT EN INGLES listo para Runway / Luma / Sora / Kling.
Especifica primer y ultimo fotograma para que el bucle sea invisible, y que el clip debe funcionar SIN audio y SIN texto incrustado.
En el HTML incluye el video de fondo correctamente implementado: autoplay muted loop playsinline
preload="metadata" y capa de oscurecimiento que garantice contraste AA del titular.
El atributo poster DEBE apuntar a una imagen que cargue de verdad (usa picsum.photos con una semilla),
para que la seccion se vea bien incluso antes de que exista el video definitivo.
Incluye en el CSS un bloque @media (prefers-reduced-motion: reduce) que oculte el video y muestre el poster estatico.
Indica el peso maximo objetivo del clip (menos de 2 MB, formato .mp4 H.264 y alternativa .webm).

------------------------------------------------------------------------------
T6. DISENO SUSTRACTIVO  [subtractive-design]  ::  Calidad
------------------------------------------------------------------------------
Aplica DISENO SUSTRACTIVO como ultima pasada antes de entregar: recorta aproximadamente el 30% de todo lo que no sostenga la conversion.
Reglas duras de recorte:
  - Cada seccion tiene UNA sola idea y UN solo elemento dominante. Si compiten dos, elimina el mas debil.
  - Maximo 1 llamada a la accion primaria visible por pantalla; las secundarias van como enlace de texto, no como boton.
  - Titulares de 12 palabras o menos; parrafos de 3 lineas o menos; cero frases de relleno introductorias.
  - Sombras: como maximo 2 niveles en todo el sistema. Bordes: un solo grosor. Radios: un solo valor mas su variante pequena.
  - Sin iconos decorativos que repitan lo que ya dice el texto.
  - Sin animaciones que no comuniquen estado o jerarquia. Maximo 3 transiciones distintas.
  - El espacio en blanco es el elemento de diseno principal: prefiere aumentar el aire antes que anadir un adorno.
Al final, en una seccion "RECORTE APLICADO", lista en 5-8 lineas que eliminaste y por que. La reduccion debe ser auditable, no declarativa.

------------------------------------------------------------------------------
T7. RESTRICCIONES NEGATIVAS  [negative-constraints]  ::  Copywriting
------------------------------------------------------------------------------
RESTRICCIONES NEGATIVAS de cumplimiento obligatorio.
LISTA NEGRA DE COPY, no uses estas palabras ni sus variantes: revolucionario, disruptivo, ecosistema, potenciar, empoderar, solucion integral, llevar al siguiente nivel, sinergia, holistico, innovador, unico en el mercado, transformar tu vida, desbloquea tu potencial, lider del sector, de vanguardia, imprescindible, sin precedentes, robusto, escalable (como adjetivo de marketing), experiencia inigualable.
PROHIBICIONES VISUALES: gradiente morado-a-azul y cualquier degradado arcoiris; glassmorphism por defecto; sombras difusas gigantes de color; emojis como iconografia de interfaz; capturas falsas de dashboards; iconos genericos de cohete, bombilla o engranaje.
PROHIBICIONES ESTRUCTURALES: hero centrado con degradado y dos botones; fila de tres tarjetas identicas; testimonios inventados con nombres y fotos falsas (si no hay datos reales usa marcadores honestos del tipo [Testimonio real pendiente]); metricas fabricadas sin respaldo.
PROHIBIDO el relleno de contenido: nada de lorem ipsum ni de secciones vacias por completar. Todo el texto debe ser especifico del proyecto.
AUTO-REVISION FINAL: antes de entregar, recorre tu propio texto buscando cada termino de la lista negra y reescribe la frase completa con lenguaje concreto y verificable. Confirma el resultado en una linea: "Auto-revision de restricciones negativas: OK".

------------------------------------------------------------------------------
T8. COPY HUMANO  [human-copy]  ::  Copywriting
------------------------------------------------------------------------------
El texto debe sonar a persona, no a departamento de marketing.
MICRO-COPY DE ACCION: ninguna llamada a la accion puede decir "Enviar", "Mas informacion", "Click aqui" ni "Empezar". Escribela en primera persona y orientada al resultado que recibe el usuario (Quiero mi plan de 30 dias, Ver el metodo completo, Empiezo gratis hoy).
MICRO-COPY DE APOYO: bajo cada llamada a la accion, una linea corta que elimine riesgo o friccion (Gratis. Sin tarjeta. / 2 minutos, cancelas cuando quieras. / Te respondemos el mismo dia.). Debe ser especifica y honesta, nunca generica.
ESTADOS DE INTERFAZ redactados con voz humana: vacio, cargando, exito y error. Los errores dicen que paso y como seguir, nunca "Error inesperado".
RITMO: alterna frases muy cortas con alguna larga. Usa segunda persona. Verbos concretos, voz activa, cero adverbios de relleno. Evita signos de exclamacion salvo uno como maximo en toda la pagina.
PRUEBA DE LECTURA EN VOZ ALTA: si una frase no se puede decir en voz alta sin sonar a folleto corporativo, reescribela.
Etiquetas de formulario en lenguaje natural, con texto de ayuda que explique para que se usara el dato.

------------------------------------------------------------------------------
T9. MOVIMIENTO CON PROPOSITO  [purposeful-motion]  ::  Interaccion
------------------------------------------------------------------------------
La pagina debe sentirse viva al recorrerla, sin caer en el efectismo. Aplica MOVIMIENTO CON PROPOSITO:
  1. ENTRADA DEL HERO: el titular y la llamada a la accion aparecen con un desplazamiento corto
     (12-20px) y fundido de 400-600 ms, escalonados entre si por 80-120 ms. Solo al cargar, una vez.
  2. APARICION AL SCROLL: cada seccion se revela cuando entra en pantalla, con IntersectionObserver
     (nada de librerias externas). Fundido mas desplazamiento de 16-24px, una sola vez por elemento.
     Marca las secciones ya visibles para que no vuelvan a animarse al subir.
  3. ESTADOS AL TOCAR: botones y tarjetas reaccionan al hover y al foco con un cambio perceptible pero
     sobrio (elevacion, subrayado que crece, cambio de fondo). Transiciones de 150-250 ms.
  4. UN SOLO ACENTO EN MOVIMIENTO: elige UN elemento con animacion continua y discreta (una linea que se
     dibuja, un contador que sube, un degradado que respira muy lento). Solo uno en toda la pagina.

LIMITES DE CUMPLIMIENTO OBLIGATORIO:
  - Anima UNICAMENTE transform y opacity. Nunca width, height, top, left ni margin: provocan reflow.
  - Ninguna animacion supera los 600 ms. Nada parpadea, rebota ni gira sin motivo.
  - El contenido debe ser legible aunque el JavaScript falle: el estado inicial del CSS no puede dejar
    texto invisible de forma permanente (usa una clase que el script anade, no al reves).
  - Bloque @media (prefers-reduced-motion: reduce) que desactive TODO el movimiento y deje la pagina
    completamente usable y visible.
  - Nada de animaciones que retrasen la lectura del titular o el acceso a la llamada a la accion.

==============================================================================
04 | ARQUITECTURA DE LA PAGINA
==============================================================================
Construye como minimo estas secciones, en este orden narrativo (puedes anadir una mas si la oferta lo exige):
  1. HERO: promesa concreta en el titular (que gana el usuario, en cuanto tiempo), subtitular de apoyo,
     llamada a la accion primaria visible sin scroll y una senal de confianza discreta.
  2. PROBLEMA: nombra la situacion actual del publico con sus propias palabras, sin dramatizar.
  3. SOLUCION / COMO FUNCIONA: 3 o 4 pasos numerados, concretos y en secuencia temporal.
  4. BENEFICIOS: consecuencias reales, no caracteristicas. Cada una con evidencia o cifra cuando sea honesto.
  5. PRUEBA SOCIAL: testimonios, casos o cifras. Si no hay datos reales, usa marcadores de posicion honestos.
  6. OBJECIONES / PREGUNTAS FRECUENTES: 4 a 6 preguntas con respuestas directas.
  7. CIERRE: repeticion de la llamada a la accion ("Disenar mi plan de nutricion") con el riesgo minimizado.
  8. PIE DE PAGINA: navegacion minima, aviso legal y privacidad.

REGLA DE FLUJO: la llamada a la accion principal debe aparecer al menos 3 veces (hero, mitad de pagina, cierre)
y ser siempre la misma accion con el mismo texto. No compitas contra ti mismo con objetivos secundarios.

==============================================================================
05 | REQUISITOS TECNICOS
==============================================================================
ESTRUCTURA
  - HTML5 semantico: header, main, section con aria-labelledby, article, footer. Un solo h1.
  - Idioma del documento en espanol (lang="es"), meta description, Open Graph y favicon en linea.
  - Sin frameworks, sin CDN de librerias, sin build. CSS y JS van embebidos en el mismo archivo.

CSS
  - Variables CSS en :root para color, tipografia, espaciado y radios. Nada de valores magicos repetidos.
  - Layout con CSS Grid y Flexbox. Tipografia fluida con clamp().
  - Mobile-first real, con puntos de ruptura en 480px, 768px y 1200px. Cero scroll horizontal.
  - Modo oscuro con prefers-color-scheme cuando sea coherente con la direccion visual.

ACCESIBILIDAD (obligatoria)
  - Contraste minimo AA 4.5:1 en texto normal y 3:1 en texto grande.
  - Foco visible en todos los elementos interactivos (:focus-visible), nunca outline:none sin reemplazo.
  - Areas tactiles de 44x44px minimo. Navegacion completa por teclado.
  - Etiquetas asociadas a cada campo, mensajes de error con aria-live.

RENDIMIENTO
  - Sin saltos de layout: dimensiones explicitas en imagenes y video.
  - Animaciones solo sobre transform y opacity, y respetando prefers-reduced-motion.
  - JavaScript minimo y con proposito: validacion del formulario, preguntas frecuentes desplegables,
    scroll suave a la llamada a la accion y estados de envio. Sin dependencias externas.

FORMULARIO
  - Solo los campos imprescindibles para el objetivo de conversion. Cada campo extra cuesta conversiones.
  - Validacion en el cliente con mensajes especificos, estado de carga y estado de exito.

==============================================================================
06 | FORMATO DE SALIDA
==============================================================================
Entrega en este orden exacto:

A) Un unico bloque de codigo ```html con el documento completo y autocontenido:
   <!DOCTYPE html> ... <style> ... </style> ... <script> ... </script> ... </html>
   Debe poder copiarse, guardarse como index.html y abrirse en el navegador funcionando al 100%.

B) Si lo pides por separado, entrega ademas el CSS y el JS en bloques independientes (```css y ```js),
   manteniendo el HTML valido en ambos casos.

C) Secciones de apoyo, despues del codigo:
  - "ACTIVOS DE IMAGEN": tabla de activos con sus prompts en ingles.
  - "ACTIVOS DE VIDEO": clips con guion y prompts en ingles.
  - "AUDITORIA CRO": puntuaciones justificadas y correcciones aplicadas.
  - "RECORTE APLICADO": que eliminaste y por que.
  - "CADENA SEMILLA": paleta, tipografia, rejilla y firma visual declaradas.
  - "MAPA PSICOLOGICO": miedos, objeciones y motivaciones detectadas.

REGLAS DE ENTREGA
  - No expliques el codigo linea por linea. No pidas confirmacion antes de generar.
  - No dejes ningun TODO, ningun lorem ipsum ni ninguna seccion a medias.
  - Si necesitas un dato que no esta en el brief, decide la opcion mas razonable y anotala
    en una lista final llamada "SUPUESTOS" de maximo 5 lineas.

==============================================================================
07 | CHECKLIST DE VERIFICACION ANTES DE ENTREGAR
==============================================================================
Recorre esta lista y confirma cada punto. Si alguno falla, corrige el codigo antes de responder.

  [ ] 01. La promesa principal se entiende en menos de 5 segundos.
  [ ] 02. Existe una sola accion de conversion, repetida y coherente en toda la pagina.
  [ ] 03. La pagina se ve correctamente a 360px, 768px y 1440px de ancho.
  [ ] 04. Contraste AA verificado y foco visible en todos los elementos interactivos.
  [ ] 05. Un solo h1, jerarquia de encabezados correcta y HTML valido.
  [ ] 06. El archivo funciona abierto directamente en el navegador, sin recursos externos obligatorios.
  [ ] 07. La paleta y la tipografia declaradas se usan de forma consistente via variables CSS.
  [ ] 08. Existen al menos dos secciones con composicion asimetrica.
  [ ] 09. La firma visual aparece al menos tres veces.
  [ ] 10. Cada seccion declara en comentario HTML la objecion que neutraliza.
  [ ] 11. Las preguntas frecuentes responden objeciones reales, no relleno.
  [ ] 12. Los beneficios estan expresados como consecuencias, no como caracteristicas.
  [ ] 13. Existe una seccion AUDITORIA CRO con puntuaciones justificadas.
  [ ] 14. Ningun criterio queda por debajo de 8 sin correccion aplicada.
  [ ] 15. El codigo entregado es la version ya corregida.
  [ ] 16. Cada imagen del HTML tiene alt descriptivo y dimensiones explicitas.
  [ ] 17. Cada activo incluye prompt en ingles con encuadre, luz y restricciones negativas.
  [ ] 18. El hero carga con prioridad y el resto en lazy.
  [ ] 19. El video es muted, loop, playsinline y tiene poster de respaldo.
  [ ] 20. Existe fallback para prefers-reduced-motion.
  [ ] 21. El titular mantiene contraste AA sobre el video.
  [ ] 22. Una sola idea y una sola llamada a la accion primaria por pantalla.
  [ ] 23. Sombras, radios y transiciones limitados a los maximos indicados.
  [ ] 24. Existe informe RECORTE APLICADO con lo eliminado.
  [ ] 25. Ninguna palabra de la lista negra aparece en el texto final.
  [ ] 26. No hay gradientes morado-azul ni iconografia generica.
  [ ] 27. No hay testimonios ni metricas fabricadas.
  [ ] 28. Ninguna llamada a la accion usa verbos genericos.
  [ ] 29. Cada boton principal tiene micro-copy de apoyo que reduce riesgo.
  [ ] 30. Los estados de error explican que paso y como seguir.
  [ ] 31. Las secciones aparecen al hacer scroll una sola vez, sin saltos de layout.
  [ ] 32. Solo se animan transform y opacity, y ninguna animacion pasa de 600 ms.
  [ ] 33. Con prefers-reduced-motion activo, la pagina se ve completa y sin movimiento.
  [ ] 34. El texto sigue siendo visible aunque el JavaScript no se ejecute.

Cierra tu respuesta con la linea: "Checklist verificado: N/N".

==============================================================================
FIN DEL PROMPT MAESTRO. Empieza ahora. No pidas aclaraciones: aplica tu mejor criterio y documenta supuestos.
==============================================================================