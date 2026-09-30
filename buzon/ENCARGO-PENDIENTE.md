# ENCARGO LP-XQGC

**Proyecto:** Corte y arreglo de barba con tecnica artesanal, productos sin sulfa...
**Creado:** 2026-09-30T23:48:18.093Z

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
ENCARGO DE LANDING PAGE — BARBERÍA DE AUTOR · CIUDAD DE MÉXICO
Nombre de trabajo del proyecto: NAVAJA
==============================================================================

------------------------------------------------------------------------------
1. QUIÉN ERES MIENTRAS LEES ESTO
------------------------------------------------------------------------------
Eres un diseñador-desarrollador de producto que ha hecho páginas para marcas de
barbería, whisky y ropa de trabajo: sabes que este público huele el stock photo a
un kilómetro. Escribes HTML, CSS y JavaScript a mano, en un solo archivo, y no
entregas nada que no defenderías ante un director de arte.

El estándar es este: si un hombre de 29 años abre la página en el metro, a media
luz, con una mano, tiene que entender en 5 segundos qué se le ofrece, sentir que
ese lugar tiene carácter, y poder pulsar "Reservar mi silla" sin buscarlo. Una
página bonita que no consigue la reserva es un fracaso. Una página que consigue la
reserva pero parece una plantilla de agencia también.

Entregas UN solo archivo .html funcional, que se abre terminado, con imágenes ya
visibles. No hay segunda ronda.

------------------------------------------------------------------------------
2. EL NEGOCIO Y A QUIÉN LE HABLAS
------------------------------------------------------------------------------
Es una barbería de autor en Ciudad de México. No es una cadena de centro
comercial: hay un barbero con nombre, una silla, y una forma concreta de trabajar.

Lo que vende: corte y arreglo de barba con técnica artesanal —tijera y navaja, no
solo máquina—, productos sin sulfatos, y música en vivo los viernes. Y una promesa
operativa muy concreta: reservar tu silla toma menos de 2 minutos.

A quién: hombres de 22 a 40 años que cuidan su imagen y ya gastan dinero en ella.
No son novatos. Tres cosas los mueven y tienes que tocarlas todas:
  · Odian esperar. Han perdido sábados enteros sentados en una banca viendo cómo
    "ya va el que sigue" no significa nada.
  · Odian explicar su corte tres veces y salir con otro distinto. El miedo real no
    es el precio: es salir peor de lo que entraste y tener que aguantarlo tres
    semanas en la oficina.
  · Quieren que la media hora valga por sí misma. Buscan un rato para ellos, no un
    trámite de 15 minutos con la tele puesta.

Tono: oscuro, masculino, con carácter. Seco, no gritón. Ni "caballero", ni
"experiencia premium", ni emojis. Frases cortas como cortes de navaja.

Acción principal, siempre con estas palabras exactas en el botón principal:
"Reservar mi silla".

------------------------------------------------------------------------------
3. ARQUETIPO DE COMPOSICIÓN — HERO TIPOGRÁFICO (OBLIGATORIO)
------------------------------------------------------------------------------
La primera pantalla NO lleva fotografía ni vídeo de fondo. El titular, a escala
enorme, ES la imagen. La primera foto aparece después, cuando el usuario ya ha
hecho scroll.

Por qué este arquetipo y no otro: cualquier barbería del mundo abre con la misma
foto de tijeras sobre madera; arrancar con pura tipografía condensada sobre negro
mate es lo que este público lee como marca con actitud, y además carga instantáneo
en datos móviles, que es donde va a abrirse esta página. El zigzag narrativo queda
descartado a propósito: obliga a alternar foto-texto seis veces y aquí la fuerza
está en la palabra, no en el inventario de fotos.

Reglas verificables del hero:
  · Alto: 100svh (usa svh, no vh, para no romper en Safari móvil).
  · Fondo: negro mate plano #0B0B0A. Nada más. Cero degradados, cero imagen.
  · El h1 ocupa como mínimo el 45% del alto del hero en móvil. Tamaño con
    clamp(3.4rem, 13vw, 11rem), line-height entre 0.82 y 0.88, mayúsculas,
    letter-spacing -0.02em. Debe romper en 3 o 4 líneas y una de esas líneas va en
    verde botella o con la firma de navaja (ver §6).
  · Sobre el h1, una sola línea de etiqueta en 11px, mayúsculas, tracking 0.22em,
    en cuero whisky: la colonia y el año de apertura.
  · Debajo del h1: máximo 22 palabras de subtítulo en serif, y los dos botones.
  · Una franja inferior fija dentro del hero con tres datos separados por la firma
    de navaja: tiempo de reserva, técnica, viernes en vivo. Texto corto, sin verbos.
  · PROHIBIDO en el hero: imagen de fondo, vídeo de fondo, overlay oscuro sobre
    foto, partículas, blobs, degradado morado-azul, tarjeta de cristal.

------------------------------------------------------------------------------
4. DIRECCIÓN TIPOGRÁFICA — CONDENSADA DE CARTEL (OBLIGATORIO)
------------------------------------------------------------------------------
Titulares en sans condensada muy pesada y en MAYÚSCULAS. Cuerpo en serif, que es
lo que da el contraste de cartel de boxeo que buscamos.

Sin dependencias externas, así que resuélvelo con pilas nativas:
  --tipo-titulo: 'Oswald', 'Archivo Narrow', 'Haettenschweiler',
                 'Franklin Gothic Condensed', 'Arial Narrow', sans-serif;
  --tipo-cuerpo: 'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif;
  --tipo-dato:   ui-monospace, 'SF Mono', 'Cascadia Mono', Menlo, monospace;

Aplicación verificable:
  · h1, h2, h3 y los botones: --tipo-titulo, font-weight 700+, text-transform
    uppercase, font-stretch condensed donde exista.
  · Todo párrafo: --tipo-cuerpo, tamaño 17–19px, line-height 1.6, medida máxima
    62ch.
  · Precios, duraciones y numeración de secciones: --tipo-dato, con cifras
    tabulares (font-variant-numeric: tabular-nums).
  · Jerarquía por escala, no por color: h2 en clamp(2.2rem, 7vw, 4.6rem).
  · Ninguna tipografía cursiva decorativa. Nada de script. Nada de fuentes
    "handwritten barber".

------------------------------------------------------------------------------
5. PALETA — VALORES EXACTOS, NO APROXIMADOS
------------------------------------------------------------------------------
  --negro-mate:    #0B0B0A   fondo base de toda la página
  --carbon:        #151513   superficies elevadas, tarjetas, acordeón
  --verde-botella: #1E4034   bloques de sección, fondo del cierre de reserva
  --verde-claro:   #2F6350   solo para bordes y estados hover sobre verde
  --cuero-whisky:  #A96A2C   firma visual, etiquetas, subrayados, foco
  --whisky-alto:   #C98B45   hover del botón principal y enlaces sobre negro
  --hueso:         #E8E2D6   texto principal
  --ceniza:        #8F897C   texto secundario, nunca para texto de menos de 16px
                             sobre negro salvo que verifiques el contraste

Reglas: el fondo dominante es --negro-mate; --verde-botella aparece en 2 secciones
como máximo, en bloques a sangre completa; --cuero-whisky es acento y jamás llena
un área grande. Ningún degradado de más de dos paradas, y ningún degradado entre
tonos distintos: solo se permite oscurecer un mismo color (por ejemplo #151513 →
#0B0B0A) y solo para fundir el borde inferior de una imagen.

FIRMA VISUAL REPETIDA — "el corte de navaja":
Un filete de 2px en --cuero-whisky de 64px de largo que termina cortado en
diagonal a 45° (consíguelo con un pseudo-elemento y clip-path, sin SVG externo).
Aparece exactamente en cuatro sitios y en ninguno más:
  1. Encima de cada h2 de sección.
  2. Como separador entre los datos de la franja del hero.
  3. Como subrayado que crece de 0 a 100% al hacer hover o focus en un enlace.
  4. Como esquina recortada: TODAS las imágenes llevan
     clip-path: polygon(0 0, 100% 0, 100% calc(100% - 28px), calc(100% - 28px) 100%, 0 100%);
     Cero border-radius en imágenes. Botones con radio máximo 2px. Nada redondeado.

------------------------------------------------------------------------------
6. ARQUITECTURA DE SECCIONES — ESTE ORDEN, ESTE PROPÓSITO
------------------------------------------------------------------------------
Siete secciones visibles más el hueco reservado de vídeo. Numera cada h2 con un
marcador en --tipo-dato ("01 —", "02 —"…).

HERO — Captar en 5 segundos con pura tipografía y prometer la reserva de 2 minutos.
  Sin foto. Ver §3.

[HUECO DE VÍDEO DEL PRESENTADOR] — Inmediatamente después del hero. Ver §9.

01 · LA TÉCNICA — Matar la duda "¿saben lo que hacen?".
  Primera fotografía de la página, grande, a sangre por un lado. Explica en tres
  pasos numerados qué pasa con la navaja, la tijera y la barba. Cada paso: un
  título de 3 palabras y una frase de 18 palabras máximo. Aquí va el dato de los
  productos sin sulfatos como consecuencia técnica, no como eslogan: qué le pasa a
  su pelo y a su piel cuando no hay sulfatos.

02 · CERO ESPERA — Atacar el dolor principal: perder la tarde.
  Bloque en --verde-botella a sangre completa. Explica el sistema: hora asignada,
  una silla por franja, se entra a la hora reservada. Incluye una cifra honesta y
  concreta (minutos de holgura entre citas) y una línea sobre qué pasa si llegan
  tarde. Sin foto: aquí manda el texto y un contador tipográfico grande.

03 · LA CARTA — Dar el precio sin que tengan que preguntarlo.
  Lista de 4 servicios: corte, arreglo de barba, corte + barba, y afeitado clásico
  a navaja. Cada línea con duración y precio en pesos, alineados a la derecha con
  cifras tabulares. NO se elimina esta sección: este público abandona la página si
  no ve precio, y ocultarlo es la señal número uno de que va a salir caro.

04 · VIERNES EN VIVO — Convertir el diferenciador en motivo de visita.
  Rejilla de dos imágenes con una frase corta. Qué suena, a qué hora, y que la
  silla de viernes se agota primero. Es escasez real, no cuenta atrás falsa.

05 · LOS QUE YA SE SIENTAN — Prueba social específica, no genérica.
  Tres testimonios de 25–35 palabras, cada uno con nombre, edad, oficio y el corte
  que se hizo. Cada testimonio debe resolver una objeción distinta: el miedo a
  salir peor, la espera, y el precio. Si un testimonio podría estar en la web de un
  dentista, reescríbelo.

06 · DUDAS DE BARBERÍA — Quitar la última excusa antes de reservar.
  Acordeón de 5 preguntas con <details>/<summary>. Obligatorias: qué pasa si no
  sé explicar el corte que quiero; puedo cancelar o mover la cita; aceptan tarjeta;
  cuánto tardan de verdad; puedo ir sin cita. Respuestas de 2 frases.

07 · RESERVAR MI SILLA — Cerrar.
  Fondo --verde-botella. Formulario corto de verdad: nombre, WhatsApp, servicio
  (select con los 4 de la carta), y día preferido. Cuatro campos, ni uno más. Bajo
  el botón, una línea que repita la promesa de los 2 minutos y el aviso de que
  confirman por WhatsApp. Dirección, colonia y horario en el pie, en --tipo-dato.

Se elimina a propósito: la sección "sobre nosotros" con la historia de la marca
(a este público le da igual el año de fundación antes de saber el precio), la
galería de 12 fotos (redundante con 01 y 04) y el bloque de logos de marcas de
producto (es publicidad de otros, no argumento de compra).

------------------------------------------------------------------------------
7. COPY — LO QUE ESTÁ PROHIBIDO Y LO QUE SE ESPERA
------------------------------------------------------------------------------
LISTA NEGRA. Si alguna de estas cadenas aparece en tu entrega, has fallado:
"bienvenido", "descubre", "transforma tu look", "eleva tu estilo", "somos
apasionados", "la mejor experiencia", "calidad premium", "tu mejor versión",
"no es solo un corte, es un estilo de vida", "caballero", "tradición y
modernidad se unen", "déjate consentir", "excelencia", "soluciones", "en el
corazón de la ciudad", "más que una barbería", cualquier frase con "unimos lo
mejor de", cualquier signo de exclamación, cualquier emoji.

LO QUE SÍ: frases de 6 a 12 palabras, verbos concretos, sustantivos físicos
(navaja, toalla, cuello, espejo, tijera, cuero, hora). Habla en segunda persona.
Se permite el humor seco, nunca la broma.

MICRO-COPY DE BOTONES Y CAMPOS. Cada botón dice qué pasa al pulsarlo, y ninguno
dice "Enviar" ni "Click aquí":
  · Principal (hero y cierre): "Reservar mi silla"
  · Secundario del hero: "Ver la carta y precios"
  · Botón del formulario: "Apartar esta silla"
  · Bajo ese botón: "Te confirmamos por WhatsApp en menos de una hora."
  · Placeholder de WhatsApp: "55 0000 0000 — solo para confirmarte"
  · Ayuda del select: "Si no sabes cuál, elige corte + barba y lo ajustamos en la silla."
  · Estado de envío: el botón pasa a "Apartando…" y luego a "Silla apartada".
  · Mensaje de error de un campo, en tono de la marca: "Nos falta tu WhatsApp para
    confirmarte la hora."

------------------------------------------------------------------------------
8. IMÁGENES — GENERADAS POR IA DESDE LA URL, SIN EXCEPCIÓN
------------------------------------------------------------------------------
Todas las imágenes se piden a Pollinations directamente en el src, con este
formato, para que la página se abra ya terminada:

  https://image.pollinations.ai/prompt/TEXTO?width=ANCHO&height=ALTO&seed=NUMERO&nologo=true

TEXTO va EN INGLÉS y codificado para URL (espacios como %20, comas como %2C).
Cada imagen lleva su propia seed FIJA, escrita a mano en el HTML, para que no
cambie al recargar. Prohibido picsum, unsplash, placehold, banco de imágenes o
data-URI. Toda <img> lleva width y height explícitos en atributos, loading="lazy"
(salvo la primera visible), decoding="async" y un alt descriptivo en español.

Base de estilo que debe repetirse en TODOS los prompts, palabra por palabra, para
que las seis fotos parezcan del mismo carrete:
  dark%20moody%20barbershop%2C%20single%20hard%20warm%20key%20light%2C%20deep%20black%20background%2C%2035mm%20film%20grain%2C%20bottle%20green%20and%20whisky%20leather%20tones%2C%20no%20text

Las seis imágenes, con sección, tamaño y seed:

  IMG-1 · Sección 01, retrato vertical (800×1000, seed=2858)
  straight%20razor%20shaping%20a%20thick%20black%20beard%20on%20a%20mexican%20man%20in%20his%20thirties%2C%20close%20three%20quarter%20profile%2C%20barber%20hands%20with%20tattooed%20forearm%2C%20 + base

  IMG-2 · Sección 01, detalle horizontal (900×600, seed=3141)
  macro%20detail%20of%20scissors%20and%20a%20sulfate%20free%20amber%20glass%20bottle%20on%20a%20worn%20leather%20strop%2C%20shallow%20depth%20of%20field%2C%20 + base

  IMG-3 · Sección 04, vertical (760×1000, seed=5590)
  a%20guitarist%20playing%20live%20in%20the%20corner%20of%20a%20small%20barbershop%20on%20friday%20night%2C%20backlit%20silhouette%2C%20warm%20practical%20lamps%2C%20 + base

  IMG-4 · Sección 04, horizontal (900×620, seed=7712)
  wide%20interior%20of%20a%20one%20chair%20mexico%20city%20barbershop%20at%20night%2C%20bottle%20green%20tiled%20wall%2C%20whisky%20leather%20barber%20chair%2C%20mirror%20reflection%2C%20 + base

  IMG-5 · Sección 05, cuadrada pequeña ×3 (160×160, seeds 8101 / 8102 / 8103)
  candid%20portrait%20of%20a%20young%20mexican%20man%20with%20a%20fresh%20sharp%20haircut%20looking%20at%20camera%2C%20 + base
  (cambia solo el sujeto entre las tres: beard%20and%20glasses / short%20fade%20no%20beard / long%20hair%20and%20mustache)

  IMG-6 · Sección 07, horizontal ancha (1200×700, seed=9264)
  empty%20whisky%20leather%20barber%20chair%20under%20one%20hanging%20lamp%2C%20inviting%2C%20towel%20folded%20on%20the%20armrest%2C%20 + base

------------------------------------------------------------------------------
9. HUECO RESERVADO PARA EL VÍDEO DEL PRESENTADOR (COPIA EXACTA)
------------------------------------------------------------------------------
Inmediatamente después del cierre del hero, antes de la sección 01, inserta esta
sección tal cual. El atributo hidden es OBLIGATORIO: sin él aparece un reproductor
negro vacío y la página parece rota. ConvertIA quitará el hidden y pondrá el
archivo cuando el vídeo esté grabado.

  <section id="presentador-convertia" hidden>
    <video controls playsinline></video>
  </section>

No añadas autoplay, ni poster, ni src. No la escondas con CSS (display:none en una
clase): el ocultado va con el atributo hidden. Escribe reglas de estilo para esta
sección pensando en cómo se verá cuando se muestre (ancho máximo 900px, centrada,
la misma esquina recortada de la firma visual), pero déjala oculta en la entrega.

------------------------------------------------------------------------------
10. MOVIMIENTO CON PROPÓSITO
------------------------------------------------------------------------------
Cada animación tiene que justificar su existencia guiando la mirada hacia la
reserva. Solo se permiten estas cinco, y ninguna más:
  1. Entrada del h1: las líneas del titular suben 24px y aparecen con 80ms de
     retardo entre ellas, una sola vez. Duración 420ms, ease-out.
  2. Revelado al hacer scroll: cada sección entra con opacity 0→1 y translateY de
     16px, disparado con IntersectionObserver (threshold 0.15), una sola vez por
     elemento. Nada de rebotes ni de escalados.
  3. El subrayado de navaja creciendo en hover y en :focus-visible de enlaces.
  4. El botón principal: en hover sube 2px y su fondo pasa a --whisky-alto en
     160ms. Nada de sombras de colores ni de brillos.
  5. El acordeón de dudas: la flecha gira 90°, la altura la gestiona <details>.
Prohibido: parallax, marquesinas, contadores animados, texto que se escribe letra
a letra, elementos flotando en bucle, carruseles automáticos.
Obligatorio: @media (prefers-reduced-motion: reduce) que deje todo en 0.01ms y con
los elementos ya visibles.

------------------------------------------------------------------------------
11. REQUISITOS TÉCNICOS
------------------------------------------------------------------------------
  · Un solo archivo .html. CSS en un <style> en el head, JS en un <script> al final
    del body. Cero dependencias, cero CDN, cero frameworks, cero Google Fonts.
  · HTML semántico: header, main, section, footer. UN SOLO h1 en toda la página.
    Jerarquía h1 → h2 → h3 sin saltos.
  · Mobile-first: escribe primero el CSS de móvil y usa min-width para ampliar.
    Puntos de ruptura en 48rem y 72rem. Ninguna sección debe provocar scroll
    horizontal a 320px de ancho.
  · Contraste AA verificado (4.5:1 en texto normal, 3:1 en títulos grandes) para
    cada combinación que uses. Comprueba explícitamente --ceniza sobre
    --negro-mate y --hueso sobre --verde-botella.
  · :focus-visible con anillo de 2px en --cuero-whisky y offset de 3px, visible en
    todos los enlaces, botones y campos. No elimines el outline sin sustituirlo.
  · Formulario accesible: cada campo con su <label> real (no solo placeholder),
    type y autocomplete correctos, required donde toque, y validación en JS que
    escriba el error en un contenedor con aria-live="polite". El envío se
    intercepta con preventDefault y muestra el estado de éxito descrito en §7.
  · Variables CSS para toda la paleta y la tipografía. Ni un solo HEX repetido a
    mano en las reglas.
  · <title>, <meta name="description">, meta viewport, lang="es-MX".

------------------------------------------------------------------------------
12. DISEÑO SUSTRACTIVO — PASADA OBLIGATORIA ANTES DE ENTREGAR
------------------------------------------------------------------------------
Cuando tengas la página terminada, haz una pasada de recorte y elimina en torno al
30% de lo que hayas puesto. Criterios concretos:
  · Máximo 1 icono por sección, y solo si sustituye a una palabra. Si no puedes
    dibujarlo con CSS puro, no va.
  · Ningún párrafo de más de 3 frases. Corta la tercera si repite la primera.
  · Ninguna sección con más de 1 botón, salvo el hero.
  · Si dos frases de secciones distintas dicen lo mismo con otras palabras, borra
    la más débil. Busca específicamente repeticiones de "sin sulfatos", "2 minutos"
    y "artesanal": cada idea se dice una vez fuerte, no tres veces flojas.
  · Elimina todo borde, sombra o tarjeta que no separe dos cosas que se confundían.
  · El aire es el material: los saltos entre secciones deben ser de al menos
    clamp(4.5rem, 10vw, 9rem).
Al final del <head>, deja un comentario HTML con exactamente tres líneas que
empiecen por "RECORTADO:" nombrando tres elementos que quitaste en esta pasada.

------------------------------------------------------------------------------
13. CREADOR Y CRÍTICO — AUTOEVALUACIÓN ANTES DE SOLTAR EL CÓDIGO
------------------------------------------------------------------------------
Antes de entregar, cámbiate el sombrero y audita tu propio trabajo como si fueras
un consultor de CRO al que le pagan por encontrar fallos. Recorre estos ocho
puntos y, donde falles, ARREGLA el código antes de entregar. No entregues el
informe: entrega la página ya corregida.
  1. ¿Se entiende la oferta sin scroll, solo con el h1 y el subtítulo?
  2. ¿Se ve un "Reservar mi silla" en la primera pantalla y otro al final?
  3. ¿Está el precio visible sin pulsar nada?
  4. ¿Está resuelto el miedo a salir con un corte que no pediste, con texto
     explícito y no insinuado?
  5. ¿Hay alguna frase de la lista negra de §7? Busca cada una.
  6. ¿Alguna imagen es de banco, picsum o sin seed fija?
  7. ¿Funciona a 320px sin scroll horizontal y con el pulgar en el pie?
  8. ¿La sección presentador-convertia conserva el atributo hidden literal?
Después, escribe DENTRO del código, como comentario HTML justo antes de </body>,
un bloque titulado "AUDITORIA" con una línea por cada uno de los ocho puntos y el
veredicto OK o CORREGIDO, y en los corregidos qué cambiaste. Ese bloque es parte
de la entrega y se revisa.

------------------------------------------------------------------------------
14. FORMATO DE SALIDA
------------------------------------------------------------------------------
Responde con UN único bloque de código que contenga el archivo HTML completo,
desde <!DOCTYPE html> hasta </html>. Nada antes, nada después: sin introducción,
sin explicación, sin lista de lo que hiciste. Los dos comentarios pedidos
(RECORTADO y AUDITORIA) van dentro del propio archivo.

------------------------------------------------------------------------------
15. CHECKLIST FINAL — REPÁSALO LÍNEA A LÍNEA
------------------------------------------------------------------------------
  [ ] Hero de 100svh sin imagen ni vídeo, con h1 en condensada mayúscula gigante.
  [ ] Un solo h1 en todo el documento.
  [ ] Titulares en sans condensada, cuerpo en serif, datos y precios en mono.
  [ ] Los nueve HEX de §5 declarados como variables CSS y usados como se indica.
  [ ] La firma de navaja aparece en los cuatro sitios de §5 y en ninguno más.
  [ ] Cero border-radius en imágenes; esquina recortada con clip-path en todas.
  [ ] Las 7 secciones en el orden de §6, con su h2 numerado en mono.
  [ ] Sección presentador-convertia justo después del hero, con hidden literal,
      con <video controls playsinline> y sin src.
  [ ] Las 6 imágenes desde image.pollinations.ai, en inglés, URL-encoded, con seed
      fija y width/height en el atributo.
  [ ] Botón principal con el texto exacto "Reservar mi silla", dos veces.
  [ ] Micro-copys de §7 puestos tal cual en botones, campos y estados.
  [ ] Ninguna frase de la lista negra. Ningún signo de exclamación. Ningún emoji.
  [ ] Precios en pesos visibles, con cifras tabulares alineadas a la derecha.
  [ ] Solo las cinco animaciones de §10, más prefers-reduced-motion.
  [ ] Contraste AA comprobado, focus-visible en todo lo interactivo.
  [ ] Formulario de 4 campos con labels, aria-live y preventDefault.
  [ ] Sin scroll horizontal a 320px.
  [ ] Comentario RECORTADO de tres líneas en el head.
  [ ] Bloque AUDITORIA de ocho líneas antes de </body>.
  [ ] Un archivo, cero dependencias externas salvo las URLs de Pollinations.

DECISIONES: arquetipo=HERO TIPOGRAFICO · tipografia=CONDENSADA DE CARTEL · semilla=2858