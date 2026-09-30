import { NextResponse, type NextRequest } from 'next/server';
import { MCP_TOOLS, McpToolError, findTool, toWireTool } from '@/lib/mcp-tools';

/**
 * ============================================================================
 *  ConvertIA :: endpoint MCP por HTTP
 * ----------------------------------------------------------------------------
 *  Claude Escritorio solo admite conectores personalizados por URL, asi que
 *  ConvertIA habla MCP tambien por HTTP (JSON-RPC 2.0 sobre POST, sin sesion).
 *
 *  Se registra en Claude Escritorio con:
 *      Configuracion -> Conectores -> Agregar conector personalizado
 *      URL: http://localhost:3300/api/mcp
 * ============================================================================
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Version del protocolo que hablamos si el cliente no pide otra. */
const DEFAULT_PROTOCOL = '2025-06-18';

const SERVER_INFO = { name: 'convertia', title: 'ConvertIA', version: '1.0.0' };

const INSTRUCTIONS = [
  'ConvertIA compila Prompts Maestros para landing pages de alta conversion.',
  'Flujo habitual: llama a obtener_encargo para leer el Prompt Maestro pendiente,',
  'cumplelo al detalle y devuelve el resultado con entregar_landing.',
  'El usuario ve la landing renderizada en ConvertIA en cuanto la entregas.',
].join(' ');

interface JsonRpcRequest {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
}

function result(id: string | number | null | undefined, payload: unknown) {
  return { jsonrpc: '2.0', id: id ?? null, result: payload };
}

function failure(id: string | number | null | undefined, code: number, message: string) {
  return { jsonrpc: '2.0', id: id ?? null, error: { code, message } };
}

async function handleMessage(message: JsonRpcRequest): Promise<object | null> {
  const { method, id, params } = message;

  // Las notificaciones no llevan id y no se responden.
  const isNotification = id === undefined || id === null;

  switch (method) {
    case 'initialize': {
      const requested = params?.protocolVersion;
      return result(id, {
        protocolVersion: typeof requested === 'string' ? requested : DEFAULT_PROTOCOL,
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions: INSTRUCTIONS,
      });
    }

    case 'ping':
      return result(id, {});

    case 'tools/list':
      return result(id, { tools: MCP_TOOLS.map(toWireTool) });

    case 'tools/call': {
      const name = typeof params?.name === 'string' ? params.name : '';
      const args = (params?.arguments ?? {}) as Record<string, unknown>;
      const tool = findTool(name);

      if (!tool) {
        return failure(id, -32602, `La herramienta "${name}" no existe en ConvertIA.`);
      }

      try {
        const text = await tool.handler(args);
        return result(id, { content: [{ type: 'text', text }], isError: false });
      } catch (error) {
        const text =
          error instanceof McpToolError
            ? error.message
            : 'ConvertIA no pudo completar la operacion. Revisa que la base de datos este levantada.';
        if (!(error instanceof McpToolError)) console.error('[ConvertIA][mcp]', error);
        return result(id, { content: [{ type: 'text', text }], isError: true });
      }
    }

    // Listados opcionales del protocolo: respondemos vacio en vez de fallar.
    case 'resources/list':
      return result(id, { resources: [] });
    case 'resources/templates/list':
      return result(id, { resourceTemplates: [] });
    case 'prompts/list':
      return result(id, { prompts: [] });

    default:
      if (isNotification || method?.startsWith('notifications/')) return null;
      return failure(id, -32601, `Metodo no soportado: ${method}`);
  }
}

/** POST :: canal principal del transporte HTTP de MCP. */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(failure(null, -32700, 'JSON invalido.'), { status: 400 });
  }

  const messages: JsonRpcRequest[] = Array.isArray(body) ? body : [body as JsonRpcRequest];
  const responses: object[] = [];

  for (const message of messages) {
    const response = await handleMessage(message);
    if (response) responses.push(response);
  }

  // Solo notificaciones: el protocolo espera 202 sin cuerpo.
  if (responses.length === 0) {
    return new NextResponse(null, { status: 202 });
  }

  const payload = Array.isArray(body) ? responses : responses[0];
  return NextResponse.json(payload, {
    headers: { 'Cache-Control': 'no-store' },
  });
}

/**
 * GET :: algunos clientes abren un canal SSE para notificaciones del servidor.
 * ConvertIA no envia nada por su cuenta, asi que lo declinamos explicitamente.
 */
export function GET() {
  return NextResponse.json(
    { error: 'Este servidor MCP no emite eventos; usa POST con JSON-RPC.' },
    { status: 405, headers: { Allow: 'POST, DELETE' } },
  );
}

/** DELETE :: cierre de sesion. Somos sin estado, asi que siempre va bien. */
export function DELETE() {
  return new NextResponse(null, { status: 204 });
}
