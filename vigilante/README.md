# Vigilante de ConvertIA

Mira el buzon de ConvertIA cada 10 segundos y reacciona **solo cuando hay un encargo
pendiente**. Vigilar es una peticion HTTP a tu propio ordenador: no cuesta nada.

## Los dos modos

| Modo | Que hace al encontrar trabajo | Cuota que gasta |
| --- | --- | --- |
| `aviso` (por defecto) | Notificacion de Windows + pitido. Tu lanzas la tarea del chat. | Chats |
| `codigo` | Despierta el CLI de Claude Code y genera solo. | **Codigo** (la cara) |

El modo `aviso` existe porque el `codigo` abre una sesion completa de Claude Code por cada
encargo, y esa es la cuota mas cara con diferencia. Con `aviso` el ordenador sigue haciendo
la guardia gratis, pero el trabajo se ejecuta en una conversacion de chat.

**El flujo en modo aviso:**

```
Pides la landing en ConvertIA
        v
El encargo entra en PostgreSQL
        v
El vigilante lo ve (gratis) -> notificacion de Windows
        v
Abres Claude > Programadas > "ConvertIA - atender el buzon" > Ejecutar ahora
        v
La landing aparece sola en el visor
```

## Arrancarlo

Doble clic en `iniciar-vigilante.cmd`, o desde una terminal:

```
node vigilante/vigilante.mjs
```

Para el modo automatico de Claude Code (mas caro):

```
set VIGILANTE_MODO=codigo && node vigilante/vigilante.mjs
```

Deja la ventana abierta. Para pararlo, cierrala.

## Que necesita

- ConvertIA levantado (`docker compose up -d`)
- En modo `aviso`: nada mas. No hace falta el CLI de Claude.
- En modo `codigo`: el CLI de Claude Code (`npm install -g @anthropic-ai/claude-code`) y el
  archivo `mcp-convertia.json` de esta carpeta

## Arrancarlo con Windows

1. Pulsa `Win + R`, escribe `shell:startup` y pulsa Enter.
2. Copia ahi un acceso directo a `iniciar-vigilante.cmd`.

A partir de ahi arranca solo al encender el ordenador.

## Ajustes

| Variable | Para que sirve | Por defecto |
| --- | --- | --- |
| `VIGILANTE_MODO` | `aviso` o `codigo` | `aviso` |
| `CONVERTIA_URL` | Donde esta ConvertIA | `http://localhost:3300` |
| `VIGILANTE_INTERVALO` | Cada cuanto mira, en milisegundos | `10000` |
| `VIGILANTE_REPETIR` | Cada cuanto repite el aviso de un encargo sin atender | `600000` (10 min) |

## Si algo falla

- **"No veo ConvertIA"**: levanta el contenedor con `docker compose up -d`.
- **No sale la notificacion**: el aviso tambien se escribe en la ventana del vigilante.
  Comprueba que las notificaciones de Windows no esten en "No molestar".
- **"No se pudo lanzar el CLI"** (solo en modo `codigo`): abre una terminal nueva y
  comprueba `claude --version`.
