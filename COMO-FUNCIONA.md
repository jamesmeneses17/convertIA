# ConvertIA — cómo funciona el sistema

Documento para explicar el proyecto: qué hace, cómo están conectadas las piezas y por qué
se tomó cada decisión.

---

## 1. Qué problema resuelve

Pedirle a una IA "hazme una landing page" da resultados mediocres y distintos cada vez. El
problema no es el modelo: es el encargo. Una IA con un buen encargo produce una página
profesional; con un encargo pobre, una plantilla genérica.

**ConvertIA es una fábrica de encargos.** Recoge las cinco variables de un proyecto, aplica
nueve técnicas de ingeniería de prompts y produce un *Prompt Maestro* de unos 20.000
caracteres que cualquier IA puede cumplir bien.

La tesis del proyecto: *la calidad del resultado depende de la calidad del encargo, no del
modelo que lo ejecute*.

---

## 2. El recorrido completo

```
   TÚ                     ConvertIA                  Claude                 ConvertIA
   │                          │                        │                        │
   │ 1. brief + técnicas      │                        │                        │
   ├─────────────────────────►│                        │                        │
   │                          │ 2. deja el encargo     │                        │
   │                          │    en PostgreSQL       │                        │
   │                          │                        │                        │
   │                          │◄── 3. lo recoge ───────┤                        │
   │                          │      (por MCP)         │                        │
   │                          │                        │ 4. escribe la landing  │
   │                          │◄────── 5. la entrega ──┤                        │
   │                          │                        │                        │
   │◄─ 6. aparece renderizada ┤                        │                        │
```

El punto clave: **tú y Claude nunca habláis directamente**. Os comunicáis a través de una
tabla de PostgreSQL que hace de buzón. Tú dejas encargos, Claude deja resultados.

---

## 3. Las tres etapas de la interfaz

### Etapa 01 — Brief

Cinco campos con validación en tiempo real: tema, oferta, público, tono y acción de
conversión. La precisión aquí determina el 80 % del resultado: un público descrito como
*"jóvenes"* produce una landing genérica; *"jóvenes de 20 a 30 años en su primer empleo, que
cobran mensual y terminan el mes en cero"* produce una que interpela.

### Etapa 02 — Método

Nueve técnicas activables, cada una con un bloque de directivas verificables:

| # | Técnica | Qué impone |
|---|---------|------------|
| 1 | Cadenas Semilla | Guía de estilo con HEX y tipografías; prohíbe el layout genérico |
| 2 | Prompts Ambiciosos | Mapa de 3 miedos, 3 objeciones y 3 motivaciones |
| 3 | Creador y Crítico | Dos pasadas: crear y auditarse con notas de 1 a 10 |
| 4 | Activos de Imagen | Prompts en inglés con encuadre, luz y restricciones |
| 5 | Activos de Vídeo | Clips de 3-8 s con guion plano a plano |
| 6 | Diseño Sustractivo | Recorta el 30 % de lo que no sostiene la conversión |
| 7 | Restricciones Negativas | Lista negra de clichés y de estética de IA |
| 8 | Copy Humano | Micro-copys en primera persona, estados de interfaz reales |
| 9 | Movimiento con Propósito | Animaciones que guían la mirada, no que distraen |

Y dos formas de construir el Prompt Maestro:

- **Con IA** (la principal): la IA redacta un encargo a medida, eligiendo arquetipo de
  composición, dirección tipográfica y arquitectura de secciones para *este* proyecto.
- **Con plantilla** (secundaria): un compilador determinista ensambla ocho bloques fijos.
  Instantáneo y reproducible, pero todos los proyectos comparten esqueleto.

### Etapa 03 — Prompt y resultado

El prompt con sintaxis resaltada, el puente hacia Claude, el visor que renderiza la landing
y el guardado en el banco de proyectos.

---

## 4. Las piezas técnicas, una por una

### 4.1 El compilador determinista

`src/lib/prompt-builder.ts`. Ensambla ocho bloques: rol, brief, encargo, técnicas,
arquitectura, requisitos técnicos, formato de salida y checklist.

**No interviene ninguna IA.** Es código que concatena texto. El mismo brief con las mismas
técnicas produce el mismo prompt carácter por carácter. Eso lo hace auditable: se puede
explicar por qué cada instrucción está ahí.

La base de conocimiento vive en `src/lib/techniques.ts`: el contenido de las nueve técnicas,
escrito a mano. Ahí está el valor real del sistema.

### 4.2 El meta-prompt

`src/lib/meta-prompt.ts`. Cuando se pide la versión con IA, ConvertIA no escribe el Prompt
Maestro: escribe **el encargo para que una IA lo redacte**.

Ese meta-prompt obliga a tomar decisiones que antes estaban congeladas: elegir uno de siete
arquetipos de composición, una de cuatro direcciones tipográficas, y decidir qué secciones
necesita esta oferta concreta. Una semilla aleatoria sugiere por dónde empezar, para que dos
proyectos no acaben con el mismo esqueleto.

El documento debe terminar con una línea auditable:
`DECISIONES: arquetipo=... · tipografia=... · semilla=...`

### 4.3 El buzón (PostgreSQL)

Tabla `handoffs`. Cada fila es un encargo:

| Columna | Para qué |
|---------|----------|
| `code` | Código corto legible, tipo `LP-7K2Q` |
| `tipo` | `landing` (pide una página) o `prompt` (pide el encargo) |
| `prompt` | El Prompt Maestro, o el meta-prompt |
| `html` / `resultado` | Lo que devuelve la IA |
| `status` | `pendiente` → `entregado` (o `cancelado`) |

**Así sabe el sistema qué falta:** solo se consultan las filas `pendiente`. Al entregar, la
fila pasa a `entregado` y desaparece de la consulta. Es el mecanismo de una bandeja de
entrada: lo leído deja de estar sin leer.

Para verlo por dentro:

```bash
docker exec -it convertia_db psql -U convertia -d convertia
```

```sql
SELECT code, tipo, status, created_at FROM handoffs ORDER BY "createdAt" DESC LIMIT 10;
```

### 4.4 El servidor MCP

MCP (*Model Context Protocol*) es el estándar que permite dar herramientas nuevas a una IA.
Sin él, Claude no sabría que ConvertIA existe.

ConvertIA lo expone por dos caminos:

- `mcp/server.mjs` — proceso local que habla por entrada/salida estándar.
- `/api/mcp` — el mismo protocolo por HTTP, dentro de la propia aplicación.

Cinco herramientas:

| Herramienta | Qué hace |
|-------------|----------|
| `listar_encargos` | Qué hay pendiente |
| `obtener_encargo` | Lee el prompt y dice de qué tipo es |
| `entregar_landing` | Devuelve el HTML |
| `entregar_prompt` | Devuelve el Prompt Maestro redactado |
| `estado_convertia` | Diagnóstico de conexión |

**Cómo se conecta a Claude Escritorio:** Configuración → Conectores → *Agregar conector
personalizado*, con la URL del endpoint. En versiones que admiten servidores locales, se
registra en `claude_desktop_config.json` bajo la clave `mcpServers`.

### 4.5 La rutina programada

Es una función de Claude Escritorio, **no del proyecto**. Vive en
`~/.claude/scheduled-tasks/convertia-generar-landings/SKILL.md`.

Ese archivo contiene las instrucciones que Claude lee cada vez que se despierta: llama a
`listar_encargos`, si está vacío termina, si hay algo lo atiende según su tipo.

**Cada ejecución es una conversación nueva y sin memoria.** Por eso el archivo tiene que
explicarlo todo: quien lo lee acaba de nacer. Esto es deliberado — así una landing nunca se
contamina con el brief de la anterior.

Se puede programar con cron (`*/5 * * * *`) o dejarla en manual y lanzarla con *Ejecutar
ahora*. La segunda opción es la recomendada: revisar cada cinco minutos consume cuota aunque
no haya trabajo.

### 4.6 El vigilante

`vigilante/vigilante.mjs`. Resuelve el problema de la rutina programada: **quién hace la
guardia**.

Si vigila Claude, cada vistazo cuesta. Si vigila un script tuyo, no cuesta nada — es una
petición HTTP a tu propio ordenador. El vigilante mira el buzón cada 10 segundos y solo
despierta a Claude cuando hay trabajo de verdad.

```
Script vigilante (gratis) → ¿hay algo? → no → espera 10 s → repite
                          → ¿hay algo? → SÍ → despierta a Claude (una vez)
```

Lleva un tope de dos intentos por encargo: si Claude termina sin entregar, avisa y para, en
vez de entrar en bucle.

### 4.7 Los generadores de activos

Todos opcionales; sin clave, su panel no aparece.

| Servicio | Qué genera | Coste |
|----------|-----------|-------|
| **Pollinations** | Imágenes con IA desde texto, en la propia URL | Gratis, sin clave |
| **Tavus** | Vídeo de una persona digital hablando | Minutos de tu plan |
| **Veo (Gemini)** | Vídeo de escena para el hero | Por segundo de vídeo |
| **Unsplash** | Fotos de banco por palabra clave | Gratis con registro |

Las imágenes de Pollinations van embebidas como URL normal, así que la landing sigue siendo
un archivo autosuficiente y se ve terminada al abrirla.

---

## 5. El despliegue

Todo corre en Docker con un solo comando:

```bash
docker compose up -d --build
```

| Servicio | Qué es |
|----------|--------|
| `app` | Next.js en modo standalone |
| `migrate` | Aplica las migraciones y termina |
| `db` | PostgreSQL 15 con volumen persistente |

El orden está encadenado: `db` sano → `migrate` termina con éxito → `app` arranca.

**Los datos viven en un volumen**, separado de los contenedores. Reconstruir la aplicación no
los toca. El único comando que los borra es `docker compose down -v`.

---

## 6. Decisiones de diseño que conviene poder defender

**Por qué el compilador es determinista.** Un sistema experto se define por tener una base de
conocimiento y reglas explícitas. Si una IA redactara el prompt desde cero, el resultado no
sería reproducible ni auditable. Por eso el camino determinista sigue existiendo, aunque la
vía con IA sea ahora la principal: son dos filosofías y el sistema permite compararlas.

**Por qué el buzón en base de datos y no una llamada directa.** Una aplicación web no puede
ordenarle a Claude que trabaje. Desacoplar con una tabla permite que el productor y el
consumidor vayan a ritmos distintos, que el encargo sobreviva a un reinicio del navegador y
que cualquier cliente MCP pueda atenderlo.

**Por qué las imágenes van a un servicio externo y no se guardan.** La landing tiene que ser
un archivo único que funcione al abrirlo. Descargar las imágenes obligaría a repartir una
carpeta; una URL mantiene el entregable autosuficiente.

**Por qué no se usa una API de pago por defecto.** El sistema se diseñó para funcionar con
una suscripción existente. La integración con API está construida pero desactivada: se enciende poniendo una clave, y tiene sentido cuando el sistema lo usan terceros que no tienen
tu Claude.

---

## 7. Límites conocidos

- **Tavus no genera escenas.** Solo graba personas digitales hablando. Para el plano de
  ambiente del hero hace falta Veo o Runway.
- **Veo requiere facturación activada.** El plan gratuito de Gemini no cubre generación de
  vídeo.
- **La generación tarda.** Entre 4 y 7 minutos por landing con las nueve técnicas activas.
- **Una ejecución puede fallar sin entregar.** Si la IA escribe el HTML en su respuesta antes
  de llamar a la herramienta, se queda sin espacio. Las instrucciones lo prohíben
  explícitamente y el vigilante lo detecta, pero puede ocurrir.

---

## 8. Métricas para la defensa

- **Prompt Maestro:** ~20.000 caracteres, ~5.200 tokens, con las 9 técnicas activas.
- **Tiempo de generación:** 4-7 minutos por landing completa.
- **Salida:** documento HTML autosuficiente, con auditoría CRO, informe de recorte y briefing
  de activos visuales incluidos como documentación.
- **Coste por landing:** cero con suscripción; entre 0,20 y 1 USD si se usa la API.
