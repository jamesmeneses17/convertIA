# ConvertIA

**Sistema experto para generar Prompts Maestros de landing pages de alta conversion.**

ConvertIA no depende de una version concreta de IA ni consume APIs de pago. Parte de un principio:
*la calidad del resultado depende de la calidad de la ingenieria del prompt*. Recoge las variables de tu
proyecto, activa las tecnicas avanzadas que necesites y compila un super-prompt de nivel experto que:

- **a)** se envia a tu sesion activa de Claude (Escritorio o Web) para generar la landing en HTML, CSS y JS;
- **b)** se copia al portapapeles y rinde igual en ChatGPT, Gemini o DeepSeek;
- **c)** se guarda, junto al brief, las tecnicas y el codigo resultante, en PostgreSQL (local o en la nube).

---

## Arranque rapido (Docker)

```bash
cp .env.example .env
docker-compose up --build
```

Abre **http://localhost:3000**. Eso es todo: el contenedor espera a PostgreSQL, aplica las migraciones de
Prisma y arranca Next.js.

> Si el puerto 3000 ya esta ocupado, cambia `APP_PORT` en el `.env` (por ejemplo `APP_PORT=3300`).

| Servicio  | Contenedor          | Puerto | Descripcion                                                      |
| --------- | ------------------- | ------ | ---------------------------------------------------------------- |
| `app`     | `convertia_app`     | 3000   | Next.js 15 en modo standalone (imagen Alpine)                    |
| `migrate` | `convertia_migrate` | -      | Job de un solo uso: aplica las migraciones de Prisma y termina   |
| `db`      | `convertia_db`      | 5432   | PostgreSQL 15 con volumen persistente                            |

El orden de arranque esta encadenado: `db` sano -> `migrate` termina con exito -> `app` arranca. Por eso una
maquina limpia solo necesita `docker-compose up --build`, sin pasos manuales de base de datos.

> **Por que un servicio aparte para migrar:** la imagen final es `output: 'standalone'`, con un `node_modules`
> podado donde el CLI de Prisma no puede ejecutarse. El servicio `migrate` reutiliza la etapa `builder`
> (que si lo tiene completo), aplica `prisma migrate deploy` y se apaga.

Comandos utiles:

```bash
docker-compose logs -f app
```

```bash
docker-compose down
```

```bash
docker-compose down -v
```

(El ultimo borra tambien el volumen con tus proyectos guardados.)

---

## Desarrollo local (sin contenedor para la app)

```bash
docker-compose up -d db
```

```bash
npm install && npx prisma migrate deploy && npm run dev
```

En `.env`, apunta `DATABASE_URL` a `localhost` en lugar de `db`:

```
DATABASE_URL="postgresql://convertia:convertia@localhost:5432/convertia?schema=public"
```

Scripts disponibles:

| Script                   | Que hace                                     |
| ------------------------ | -------------------------------------------- |
| `npm run dev`            | Servidor de desarrollo                       |
| `npm run build`          | `prisma generate` + compilacion de produccion |
| `npm run start`          | Sirve la build de produccion                 |
| `npm run typecheck`      | TypeScript en modo estricto, sin emitir      |
| `npm run lint`           | ESLint (config de Next.js)                   |
| `npm run prisma:deploy`  | Aplica migraciones                           |
| `npm run prisma:studio`  | Explorador visual de la base de datos        |

---

## El flujo: 3 etapas

### ETAPA 01 - Brief

Cinco variables con validacion en tiempo real: borde rojo, mensaje por campo, barra de progreso y bloqueo
con alerta si intentas avanzar incompleto.

| Campo      | Obligatorio | Ejemplo                                                     |
| ---------- | ----------- | ----------------------------------------------------------- |
| `topic`    | si          | Educacion financiera para jovenes                            |
| `offer`    | si          | Curso de finanzas personales para ahorrar en 30 dias         |
| `audience` | si          | Jovenes de 20 a 30 anos en su primer empleo                  |
| `tone`     | si          | Minimalista, directo, paleta verde y negro                   |
| `cta`      | no          | Registrarse gratis (si lo dejas vacio, lo propone la IA)     |

### ETAPA 02 - Metodo

Ocho tarjetas con checkbox e informacion desplegable ("Que hara en tu prompt"):

| #   | Tecnica                | Slug                   | Que inyecta en el prompt                                              |
| --- | ---------------------- | ---------------------- | --------------------------------------------------------------------- |
| 1   | Cadenas Semilla        | `seed-strings`         | Guia de estilo unica: paleta HEX, pareja Serif/Sans, rejilla, firma visual; prohibe el layout generico |
| 2   | Prompts Ambiciosos     | `ambitious-prompts`    | Mapa de 3 miedos, 3 objeciones y 3 motivaciones; cada seccion neutraliza una |
| 3   | Creador y Critico      | `creator-critic`       | Dos pasadas: crear y despues auditar UX/CRO con notas; corrige lo que baje de 8/10 |
| 4   | Activos de Imagen      | `image-assets`         | Briefing con prompts en ingles: encuadre, lente, luz y restricciones negativas |
| 5   | Activos de Video       | `video-assets`         | Clips de 3-8 s para el Hero con guion, prompt en ingles y fallback accesible |
| 6   | Diseno Sustractivo     | `subtractive-design`   | Recorta ~30% de adornos y texto redundante, con informe de lo eliminado |
| 7   | Restricciones Negativas| `negative-constraints` | Lista negra de clichas y prohibicion de gradientes y estetica de IA    |
| 8   | Copy Humano            | `human-copy`           | Micro-copys en primera persona, texto de apoyo y estados de interfaz reales |

Dos formas de compilar:

- **Probar tecnicas por separado** - un prompt independiente por tecnica activa, mismo brief, para medir el
  efecto aislado de cada una (prueba A/B de ingenieria de prompt).
- **Combinar en Prompt Maestro** - fusiona brief, tecnicas, arquitectura de pagina, requisitos tecnicos,
  formato de salida y checklist de verificacion en un unico super-prompt.

### ETAPA 03 - Prompts y Banco de Proyectos

- Prompt con **sintaxis resaltada** y metricas (caracteres, palabras, tokens estimados, lineas).
- **Copiar Prompt Maestro** - al portapapeles, para cualquier IA.
- **Ejecutar en Claude** - abre tu sesion activa con el prompt precargado; si es demasiado largo para la URL,
  se abre una conversacion nueva y el prompt queda copiado para pegarlo.
- **Visor de Codigo Integrado** - pega la respuesta completa de la IA: ConvertIA separa HTML, CSS y JS,
  ensambla el documento y lo renderiza en un `iframe` con sandbox. Incluye anchos de 375/768/100%, recarga,
  apertura en pestana nueva y descarga de `index.html`.
- **Guardar proyecto** - persiste brief, tecnicas, prompt y codigo en PostgreSQL.
- **Generar landing aqui mismo** *(opcional)* - si configuras una API key de Anthropic, aparece un boton que
  envia el Prompt Maestro a Claude desde el propio servidor y escribe la respuesta en el visor en streaming,
  sin copiar ni pegar nada.

El borrador en curso se guarda tambien en `localStorage`, asi que una recarga no te hace perder el trabajo.

---

## Cerrar el ciclo sin pagar API: puente con Claude Escritorio (MCP)

Es la via recomendada si ya tienes suscripcion de Claude. ConvertIA deja el Prompt Maestro en un
**buzon**; Claude Escritorio lo recoge mediante un servidor MCP local, genera la landing **con tu
suscripcion** y la devuelve. La pantalla la estaba esperando y la renderiza sola.

```
ConvertIA (Etapa 03)          Claude Escritorio              ConvertIA (Visor)
  "Enviar a Claude"   ---->   obtener_encargo(LP-7K2Q)
                              ...genera la landing...
                              entregar_landing(...)   ---->   se renderiza sola
```

**Puesta en marcha (una vez):** sigue [`mcp/README.md`](mcp/README.md). En resumen, anade esto al
`claude_desktop_config.json` de Claude Escritorio y reinicia la app:

```json
{
  "mcpServers": {
    "convertia": {
      "command": "node",
      "args": ["C:/Users/Jamex/Downloads/PROYECTO-PAGE/mcp/server.mjs"],
      "env": { "CONVERTIA_URL": "http://localhost:3300" }
    }
  }
}
```

**Uso:** en la Etapa 03 pulsas *Enviar a Claude Escritorio*, te da un codigo (`LP-7K2Q`) y copia la
instruccion; la pegas en Claude Escritorio; en cuanto entrega, la landing aparece en el visor.

El servidor MCP expone cuatro herramientas: `listar_encargos`, `obtener_encargo`, `entregar_landing`
y `estado_convertia`. El buzon vive en la tabla `handoffs` de PostgreSQL, asi que el encargo sobrevive
a un reinicio del navegador.

---

## Modo opcional: generar sin salir de la app

Por defecto ConvertIA **no llama a ninguna IA**: compila el prompt y tu lo pegas donde quieras. Si prefieres
que la landing se genere dentro de la propia pantalla, activa el modo integrado:

1. Consigue una API key en <https://console.anthropic.com/settings/keys>.
2. Ponla en tu `.env`:

```
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-opus-5
```

3. Reinicia: `docker-compose up -d`.

En la Etapa 03, dentro del Visor de Codigo, aparecera el panel **Generar aqui mismo**. Al pulsarlo, el
servidor envia el Prompt Maestro a Claude, el codigo se va escribiendo en el cuadro de texto conforme llega
(streaming) y al terminar se separa en HTML/CSS/JS y se renderiza en el iframe automaticamente. Puedes
detener la generacion a mitad con el boton **Detener**.

Detalles que conviene tener claros:

- **Cuesta dinero.** Cada generacion consume creditos de tu cuenta de Anthropic, facturados por tokens.
- **La clave no sale del servidor.** Se lee en el route handler (`/api/generate`); nunca se expone al
  navegador, porque no usa el prefijo `NEXT_PUBLIC_`.
- **Si no pones la clave, no cambia nada.** El panel no se muestra y el flujo de copiar/pegar sigue intacto.
- **No se puede reutilizar tu sesion de claude.ai.** Esa sesion vive como cookie en tu navegador; usarla
  desde el servidor seria suplantar tu login. La API es la via soportada.
- El endpoint responde en **NDJSON** (un evento JSON por linea: `start`, `delta`, `done`, `error`), maneja
  el `stop_reason: "refusal"` y traduce los errores tipados del SDK a mensajes en castellano.

---

## Estructura

```
src/
  app/
    layout.tsx                 Layout raiz, tema claro/oscuro sin parpadeo
    page.tsx                   Portada + asistente de 3 etapas
    proyectos/page.tsx         Banco de Proyectos (Server Component)
    api/health/route.ts        Salud del servicio y de la base de datos
    api/projects/route.ts      GET lista | POST crea
    api/projects/[id]/route.ts GET | PATCH | DELETE
  components/
    ui/                        Primitivos estilo shadcn (Radix + CVA + Tailwind)
    layout/                    Cabecera, pie y conmutador de tema
    wizard/                    Stepper y las tres etapas, visor de prompt y de codigo
    projects/                  Tarjetas, busqueda y borrado del banco
  lib/
    techniques.ts              Las 8 tecnicas y sus directivas (nucleo editorial)
    prompt-builder.ts          Compilador determinista del Prompt Maestro
    highlight.ts               Resaltador de sintaxis del prompt
    preview.ts                 Separacion de la respuesta de la IA y ensamblado del iframe
    validation.ts              Validacion del brief y esquemas Zod de la API
    ai-config.ts               Modelo, limites y prompt de sistema del modo integrado
    generate-client.ts         Cliente del stream NDJSON de /api/generate
    bridge.ts                  Buzon del puente MCP: codigos, DTOs y esquemas
    bridge-client.ts           Cliente del buzon (crear encargo y esperar entrega)
    prisma.ts, serialize.ts, api-errors.ts, claude.ts, utils.ts, types.ts
prisma/
  schema.prisma                Modelo Project
  migrations/                  Migracion inicial
mcp/
  server.mjs                   Servidor MCP para Claude Escritorio (4 herramientas)
  README.md                    Instalacion del puente paso a paso
  claude_desktop_config.example.json
docker/
  entrypoint.sh                Espera a la base de datos y arranca el servidor
```

---

## Modelo de datos

```prisma
model Project {
  id           String   @id @default(cuid())
  name         String
  topic        String
  offer        String
  audience     String
  tone         String
  cta          String?
  techniques   Json     @default("[]")   // ["seed-strings", "human-copy", ...]
  masterPrompt String                    // Prompt Maestro compilado
  pastedCode   Json?                     // { html, css, js }
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

La tabla `handoffs` guarda los encargos del puente MCP (codigo corto, prompt, codigo devuelto y estado).


## API

| Metodo   | Ruta                 | Descripcion                                  |
| -------- | -------------------- | -------------------------------------------- |
| `GET`    | `/api/health`        | Estado del servicio y de PostgreSQL          |
| `GET`    | `/api/projects`      | Lista proyectos (`?q=` busca, `?take=` limita) |
| `POST`   | `/api/projects`      | Crea un proyecto                             |
| `GET`    | `/api/projects/:id`  | Devuelve un proyecto                         |
| `PATCH`  | `/api/projects/:id`  | Actualiza brief, prompt o codigo pegado      |
| `DELETE` | `/api/projects/:id`  | Elimina un proyecto                          |
| `GET`    | `/api/generate`      | Dice si el modo de generacion integrada esta activo |
| `POST`   | `/api/generate`      | Genera la landing con Claude y la devuelve en streaming NDJSON |
| `GET`    | `/api/bridge/handoffs` | Buzon de encargos pendientes (lo consulta el servidor MCP) |
| `POST`   | `/api/bridge/handoffs` | Deja un Prompt Maestro en el buzon y devuelve su codigo |
| `GET`    | `/api/bridge/handoffs/:code` | Estado del encargo y codigo entregado |
| `POST`   | `/api/bridge/handoffs/:code/deliver` | Entrega de Claude Escritorio |
| `DELETE` | `/api/bridge/handoffs/:code` | Cancela un encargo pendiente |

Si PostgreSQL no esta disponible, la API responde `503` con `dbUnavailable: true` y la interfaz lo explica
sin romperse: el compilador de prompts sigue funcionando al 100%, porque no depende de la base de datos.

---

## Base de datos en la nube

Sustituye `DATABASE_URL` por la cadena de tu proveedor (Neon, Supabase, Railway) y comenta el servicio `db`
en `docker-compose.yml`:

```
DATABASE_URL="postgresql://usuario:pass@host.neon.tech/convertia?sslmode=require"
```

El servicio `migrate` aplica las migraciones contra esa base igual que contra la local.

---

## Stack

Next.js 15 (App Router) | React 19 | TypeScript estricto | Tailwind CSS | primitivos estilo Shadcn UI sobre
Radix | Lucide Icons | Prisma ORM | PostgreSQL 15 | Docker multi-stage sobre Node 20 Alpine.
