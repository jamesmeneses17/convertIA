# Vigilante de ConvertIA

Mira el buzon de ConvertIA cada 10 segundos y, **solo cuando hay un encargo pendiente**,
despierta a Claude Code para que genere la landing y la entregue.

## Por que no consume cuota

Vigilar es una peticion HTTP a tu propio ordenador: no cuesta nada. Claude solo
se despierta cuando de verdad hay trabajo. Es lo contrario de una tarea programada,
donde era Claude quien miraba el buzon una y otra vez.

## Arrancarlo

Doble clic en `iniciar-vigilante.cmd`, o desde una terminal:

```
node vigilante/vigilante.mjs
```

Deja la ventana abierta. Para pararlo, cierrala.

## Que necesita

- El CLI de Claude Code instalado (`npm install -g @anthropic-ai/claude-code`)
- ConvertIA levantado (`docker compose up -d`)
- El archivo `mcp-convertia.json` de esta carpeta, que le dice a Claude como
  hablar con ConvertIA

## Arrancarlo con Windows

1. Pulsa `Win + R`, escribe `shell:startup` y pulsa Enter.
2. Copia ahi un acceso directo a `iniciar-vigilante.cmd`.

A partir de ahi arranca solo al encender el ordenador.

## Ajustes

| Variable | Para que sirve | Por defecto |
| --- | --- | --- |
| `CONVERTIA_URL` | Donde esta ConvertIA | `http://localhost:3300` |
| `VIGILANTE_INTERVALO` | Cada cuanto mira, en milisegundos | `10000` |

## Si algo falla

- **"No veo ConvertIA"**: levanta el contenedor con `docker compose up -d`.
- **"No se pudo lanzar el CLI"**: abre una terminal nueva y comprueba `claude --version`.
- **Claude pide permisos**: el vigilante ya autoriza solo las cuatro herramientas de
  ConvertIA. Si aun asi pregunta, ejecuta una vez `claude` a mano y acepta.
