# Puente MCP de ConvertIA

Conecta **Claude Escritorio** con ConvertIA. Claude lee el Prompt Maestro que dejaste
en el buzon, genera la landing con **tu suscripcion** y la devuelve a ConvertIA,
que la renderiza sola en el Visor de Codigo.

No usa ninguna API de pago.

## Instalacion (una sola vez)

1. Asegurate de tener las dependencias instaladas en el proyecto:

   ```bash
   npm install
   ```

2. Abre el archivo de configuracion de Claude Escritorio:

   - **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
   - **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

3. Copia dentro el contenido de `claude_desktop_config.example.json` (ajusta la ruta
   si moviste el proyecto). Si el archivo ya tenia otros servidores, anade solo la
   entrada `"convertia"` dentro de `"mcpServers"`.

4. Cierra Claude Escritorio del todo y vuelve a abrirlo.

## Uso

1. En ConvertIA, Etapa 03, pulsa **Enviar a Claude Escritorio**. Te da un codigo (p. ej. `LP-7K2Q`)
   y copia la instruccion al portapapeles.
2. Pega esa instruccion en Claude Escritorio.
3. Claude lee el encargo, genera la landing y la entrega. La pantalla de ConvertIA la
   detecta en segundos y la muestra renderizada.

## Herramientas que expone

| Herramienta         | Que hace                                                         |
| ------------------- | ---------------------------------------------------------------- |
| `listar_encargos`   | Lista los encargos pendientes en el buzon                        |
| `obtener_encargo`   | Devuelve el Prompt Maestro completo (por codigo, o el mas reciente) |
| `entregar_landing`  | Envia el HTML/CSS/JS generado a ConvertIA                        |
| `estado_convertia`  | Comprueba que ConvertIA responde y que la base de datos esta viva |

## Si algo falla

- **"No se pudo contactar con ConvertIA"**: levanta el stack con `docker compose up -d`
  y comprueba que `CONVERTIA_URL` apunta al puerto correcto (por defecto `3300`).
- **Claude no ve las herramientas**: revisa que la ruta del `args` existe, y reinicia
  Claude Escritorio por completo (no basta con cerrar la ventana).
- **"No existe ningun encargo"**: el codigo caduca si lo cancelas desde ConvertIA;
  crea uno nuevo con el boton de la Etapa 03.
