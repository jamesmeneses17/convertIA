#!/usr/bin/env node
/**
 * ============================================================================
 *  ConvertIA :: servidor MCP para Claude Escritorio
 * ----------------------------------------------------------------------------
 *  Este puente NO usa ninguna API de pago. Claude Escritorio (tu suscripcion)
 *  llama a estas herramientas, lee el Prompt Maestro que dejaste en ConvertIA,
 *  genera la landing y la devuelve. ConvertIA la renderiza sola en el visor.
 *
 *  Se registra en el archivo de configuracion de Claude Escritorio:
 *
 *    "mcpServers": {
 *      "convertia": {
 *        "command": "node",
 *        "args": ["<ruta>/PROYECTO-PAGE/mcp/server.mjs"],
 *        "env": { "CONVERTIA_URL": "http://localhost:3300" }
 *      }
 *    }
 * ============================================================================
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const BASE_URL = (process.env.CONVERTIA_URL ?? 'http://localhost:3300').replace(/\/+$/, '');

/** Respuesta de texto para Claude. */
function texto(message) {
  return { content: [{ type: 'text', text: message }] };
}

/** Respuesta de error legible (Claude la lee y puede reintentar). */
function fallo(message) {
  return { content: [{ type: 'text', text: message }], isError: true };
}

/** Llama a la API de ConvertIA y traduce los fallos de red a algo entendible. */
async function api(path, init) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    });
  } catch (cause) {
    throw new Error(
      `No se pudo contactar con ConvertIA en ${BASE_URL}. ` +
        `Comprueba que el contenedor esta levantado (docker compose up -d). Detalle: ${cause.message}`,
    );
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = payload?.detail ? ` ${payload.detail}` : '';
    throw new Error(`${payload?.error ?? `Error HTTP ${response.status}`}${detail}`);
  }
  return payload;
}

const server = new McpServer({
  name: 'convertia',
  version: '1.0.0',
});

// ---------------------------------------------------------------------------
//  1. Ver que hay pendiente
// ---------------------------------------------------------------------------
server.registerTool(
  'listar_encargos',
  {
    title: 'Listar encargos de ConvertIA',
    description:
      'Muestra los encargos de landing page que estan esperando en ConvertIA. ' +
      'Usalo cuando el usuario pida generar una landing y no indique un codigo concreto.',
    inputSchema: {},
  },
  async () => {
    try {
      const { handoffs } = await api('/api/bridge/handoffs?status=pendiente');
      if (!handoffs || handoffs.length === 0) {
        return texto(
          'No hay encargos pendientes en ConvertIA. Pide al usuario que pulse ' +
            '"Enviar a Claude Escritorio" en la Etapa 03 y vuelva a intentarlo.',
        );
      }
      const lista = handoffs
        .map((item) => `- ${item.code} :: ${item.name} (creado ${item.createdAt})`)
        .join('\n');
      return texto(`Encargos pendientes en ConvertIA:\n${lista}`);
    } catch (error) {
      return fallo(error.message);
    }
  },
);

// ---------------------------------------------------------------------------
//  2. Leer el Prompt Maestro
// ---------------------------------------------------------------------------
server.registerTool(
  'obtener_encargo',
  {
    title: 'Obtener el Prompt Maestro de un encargo',
    description:
      'Devuelve el Prompt Maestro completo de un encargo de ConvertIA. ' +
      'Si no se indica codigo, toma el encargo pendiente mas reciente. ' +
      'Lee el prompt entero y cumplelo al pie de la letra antes de entregar.',
    inputSchema: {
      codigo: z
        .string()
        .optional()
        .describe('Codigo del encargo, por ejemplo LP-7K2Q. Si se omite, se usa el mas reciente.'),
    },
  },
  async ({ codigo }) => {
    try {
      let code = codigo?.trim().toUpperCase();

      if (!code) {
        const { handoffs } = await api('/api/bridge/handoffs?status=pendiente&take=1');
        if (!handoffs || handoffs.length === 0) {
          return texto(
            'No hay encargos pendientes en ConvertIA. Pide al usuario que pulse ' +
              '"Enviar a Claude Escritorio" en la Etapa 03.',
          );
        }
        code = handoffs[0].code;
      }

      const { handoff } = await api(`/api/bridge/handoffs/${encodeURIComponent(code)}`);

      return texto(
        [
          `ENCARGO ${handoff.code} :: ${handoff.name}`,
          `Estado: ${handoff.status}`,
          '',
          'Cumple el siguiente Prompt Maestro y, cuando tengas el codigo final,',
          `llama a la herramienta entregar_landing con codigo "${handoff.code}".`,
          'Entrega el documento HTML completo y autocontenido.',
          '',
          '--- INICIO DEL PROMPT MAESTRO ---',
          handoff.prompt,
          '--- FIN DEL PROMPT MAESTRO ---',
        ].join('\n'),
      );
    } catch (error) {
      return fallo(error.message);
    }
  },
);

// ---------------------------------------------------------------------------
//  3. Devolver la landing generada
// ---------------------------------------------------------------------------
server.registerTool(
  'entregar_landing',
  {
    title: 'Entregar la landing generada a ConvertIA',
    description:
      'Envia el codigo de la landing a ConvertIA, que lo renderiza al instante en su Visor de Codigo. ' +
      'Manda el documento HTML completo en `html`. Si separaste hojas de estilo o scripts, ' +
      'usa tambien `css` y `js`. Llama a esta herramienta una sola vez por encargo.',
    inputSchema: {
      codigo: z.string().describe('Codigo del encargo, por ejemplo LP-7K2Q.'),
      html: z.string().describe('Documento HTML completo (o el fragmento principal).'),
      css: z.string().optional().describe('CSS aparte, solo si no va embebido en el HTML.'),
      js: z.string().optional().describe('JavaScript aparte, solo si no va embebido en el HTML.'),
      notas: z
        .string()
        .optional()
        .describe('Resumen de una linea sobre las decisiones de diseno tomadas.'),
    },
  },
  async ({ codigo, html, css, js, notas }) => {
    try {
      const { mensaje } = await api(
        `/api/bridge/handoffs/${encodeURIComponent(codigo.trim().toUpperCase())}/deliver`,
        {
          method: 'POST',
          body: JSON.stringify({ html, css, js, notes: notas }),
        },
      );
      return texto(mensaje ?? 'Landing entregada en ConvertIA.');
    } catch (error) {
      return fallo(error.message);
    }
  },
);

// ---------------------------------------------------------------------------
//  4. Diagnostico
// ---------------------------------------------------------------------------
server.registerTool(
  'estado_convertia',
  {
    title: 'Comprobar la conexion con ConvertIA',
    description: 'Dice si ConvertIA responde y si su base de datos esta conectada.',
    inputSchema: {},
  },
  async () => {
    try {
      const health = await api('/api/health');
      return texto(
        `ConvertIA responde en ${BASE_URL}. Base de datos: ${health.database}. App: ${health.app}.`,
      );
    } catch (error) {
      return fallo(error.message);
    }
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);

// El log va a stderr: stdout es el canal del protocolo MCP y debe quedar limpio.
console.error(`[convertia-mcp] conectado. ConvertIA en ${BASE_URL}`);
