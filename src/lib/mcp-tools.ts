import { prisma } from '@/lib/prisma';
import { serializeHandoff, serializeHandoffWithCode } from '@/lib/bridge';
import { isCodeEmpty, splitAiResponse } from '@/lib/preview';
import { ponerFotosTematicas } from '@/lib/fotos';

/**
 * ============================================================================
 *  ConvertIA :: herramientas MCP (implementacion compartida)
 * ----------------------------------------------------------------------------
 *  Las mismas cuatro herramientas que expone `mcp/server.mjs`, pero resueltas
 *  dentro del propio servidor: hablan con PostgreSQL directamente, sin salto
 *  HTTP intermedio. Las consume /api/mcp, que es lo que se pega en el dialogo
 *  "Agregar conector personalizado" de Claude Escritorio.
 * ============================================================================
 */

export interface McpToolDefinition {
  name: string;
  title: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: (args: Record<string, unknown>) => Promise<string>;
}

/** Error de herramienta: se devuelve a Claude como `isError`, no como excepcion. */
export class McpToolError extends Error {}

function readString(args: Record<string, unknown>, key: string): string | undefined {
  const value = args[key];
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

export const MCP_TOOLS: readonly McpToolDefinition[] = [
  {
    name: 'listar_encargos',
    title: 'Listar encargos de ConvertIA',
    description:
      'Muestra los encargos de landing page que estan esperando en ConvertIA. ' +
      'Usalo cuando el usuario pida generar una landing y no indique un codigo concreto.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    handler: async () => {
      const handoffs = await prisma.handoff.findMany({
        where: { status: 'pendiente' },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      if (handoffs.length === 0) {
        return (
          'No hay encargos pendientes en ConvertIA. Pide al usuario que pulse ' +
          '"Enviar a Claude Escritorio" en la Etapa 03 y vuelva a intentarlo.'
        );
      }

      const lista = handoffs
        .map((item) => {
          const dto = serializeHandoff(item);
          return `- ${dto.code} :: ${dto.name} (creado ${dto.createdAt})`;
        })
        .join('\n');

      return `Encargos pendientes en ConvertIA:\n${lista}`;
    },
  },

  {
    name: 'obtener_encargo',
    title: 'Obtener el Prompt Maestro de un encargo',
    description:
      'Devuelve el Prompt Maestro completo de un encargo de ConvertIA. ' +
      'Si no se indica codigo, toma el encargo pendiente mas reciente. ' +
      'Lee el prompt entero y cumplelo al pie de la letra antes de entregar.',
    inputSchema: {
      type: 'object',
      properties: {
        codigo: {
          type: 'string',
          description: 'Codigo del encargo, por ejemplo LP-7K2Q. Si se omite, se usa el mas reciente.',
        },
      },
      additionalProperties: false,
    },
    handler: async (args) => {
      const codigo = readString(args, 'codigo')?.toUpperCase();

      const handoff = codigo
        ? await prisma.handoff.findUnique({ where: { code: codigo } })
        : await prisma.handoff.findFirst({
            where: { status: 'pendiente' },
            orderBy: { createdAt: 'desc' },
          });

      if (!handoff) {
        if (codigo) throw new McpToolError(`No existe ningun encargo con el codigo ${codigo}.`);
        return (
          'No hay encargos pendientes en ConvertIA. Pide al usuario que pulse ' +
          '"Enviar a Claude Escritorio" en la Etapa 03.'
        );
      }

      const dto = serializeHandoffWithCode(handoff);

      return [
        `ENCARGO ${dto.code} :: ${dto.name}`,
        `Estado: ${dto.status}`,
        '',
        'Cumple el siguiente Prompt Maestro y, cuando tengas el codigo final,',
        `llama a la herramienta entregar_landing con codigo "${dto.code}".`,
        'Entrega el documento HTML completo y autocontenido.',
        '',
        '--- INICIO DEL PROMPT MAESTRO ---',
        dto.prompt,
        '--- FIN DEL PROMPT MAESTRO ---',
      ].join('\n');
    },
  },

  {
    name: 'entregar_landing',
    title: 'Entregar la landing generada a ConvertIA',
    description:
      'Envia el codigo de la landing a ConvertIA, que lo renderiza al instante en su Visor de Codigo. ' +
      'Manda el documento HTML completo en `html`. Si separaste hojas de estilo o scripts, ' +
      'usa tambien `css` y `js`. Llama a esta herramienta una sola vez por encargo.',
    inputSchema: {
      type: 'object',
      properties: {
        codigo: { type: 'string', description: 'Codigo del encargo, por ejemplo LP-7K2Q.' },
        html: { type: 'string', description: 'Documento HTML completo (o el fragmento principal).' },
        css: { type: 'string', description: 'CSS aparte, solo si no va embebido en el HTML.' },
        js: { type: 'string', description: 'JavaScript aparte, solo si no va embebido en el HTML.' },
        notas: { type: 'string', description: 'Resumen de una linea sobre las decisiones de diseno.' },
      },
      required: ['codigo', 'html'],
      additionalProperties: false,
    },
    handler: async (args) => {
      const codigo = readString(args, 'codigo')?.toUpperCase();
      if (!codigo) throw new McpToolError('Falta el codigo del encargo.');

      const handoff = await prisma.handoff.findUnique({ where: { code: codigo } });
      if (!handoff) throw new McpToolError(`No existe ningun encargo con el codigo ${codigo}.`);
      if (handoff.status === 'cancelado') {
        throw new McpToolError(`El encargo ${codigo} fue cancelado desde ConvertIA.`);
      }

      const respuesta = readString(args, 'respuesta');
      const parsed = respuesta ? splitAiResponse(respuesta) : { html: '', css: '', js: '' };
      const html = readString(args, 'html') ?? parsed.html;
      const css = readString(args, 'css') ?? parsed.css;
      const js = readString(args, 'js') ?? parsed.js;

      if (isCodeEmpty({ html, css, js })) {
        throw new McpToolError(
          'La entrega no traia codigo. Envia el documento HTML completo en el campo `html`.',
        );
      }

      const fotos = await ponerFotosTematicas(html);

      await prisma.handoff.update({
        where: { code: codigo },
        data: {
          html: fotos.html,
          css,
          js,
          notes: readString(args, 'notas') ?? null,
          status: 'entregado',
          deliveredAt: new Date(),
        },
      });

      const nota = fotos.cambiadas > 0 ? ` Se cambiaron ${fotos.cambiadas} fotos por imagenes del tema.` : '';
      return `Landing entregada en ConvertIA. Ya se esta viendo en el Visor de Codigo del encargo ${codigo}.${nota}`;
    },
  },

  {
    name: 'estado_convertia',
    title: 'Comprobar la conexion con ConvertIA',
    description: 'Dice si ConvertIA responde y si su base de datos esta conectada.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    handler: async () => {
      const pendientes = await prisma.handoff.count({ where: { status: 'pendiente' } });
      return (
        `ConvertIA responde correctamente y la base de datos esta conectada. ` +
        `Encargos pendientes ahora mismo: ${pendientes}.`
      );
    },
  },
] as const;

export function findTool(name: string): McpToolDefinition | undefined {
  return MCP_TOOLS.find((tool) => tool.name === name);
}

/** Forma de la herramienta tal y como viaja en `tools/list`. */
export function toWireTool(tool: McpToolDefinition) {
  return {
    name: tool.name,
    title: tool.title,
    description: tool.description,
    inputSchema: tool.inputSchema,
  };
}
