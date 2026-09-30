import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toErrorResponse } from '@/lib/api-errors';
import { deliverHandoffSchema, serializeHandoff } from '@/lib/bridge';
import { isCodeEmpty, splitAiResponse } from '@/lib/preview';
import { ponerFotosTematicas } from '@/lib/fotos';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ code: string }> };

/**
 * POST /api/bridge/handoffs/:code/deliver
 * Aqui entrega Claude Escritorio la landing generada (via el servidor MCP).
 * Acepta html/css/js por separado o la respuesta completa en markdown,
 * que ConvertIA trocea con el mismo separador del Visor de Codigo.
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { code } = await context.params;
    const payload = deliverHandoffSchema.parse(await request.json());

    const handoff = await prisma.handoff.findUnique({ where: { code: code.toUpperCase() } });
    if (!handoff) {
      return NextResponse.json(
        { error: `No existe ningun encargo con el codigo ${code}.` },
        { status: 404 },
      );
    }
    if (handoff.status === 'cancelado') {
      return NextResponse.json(
        { error: `El encargo ${handoff.code} fue cancelado desde ConvertIA.` },
        { status: 409 },
      );
    }

    // Si viene la respuesta entera, la separamos igual que en el visor.
    const parsed = payload.respuesta ? splitAiResponse(payload.respuesta) : { html: '', css: '', js: '' };
    const html = payload.html?.trim() || parsed.html;
    const css = payload.css?.trim() || parsed.css;
    const js = payload.js?.trim() || parsed.js;

    if (isCodeEmpty({ html, css, js })) {
      return NextResponse.json(
        {
          error: 'La entrega no traia codigo.',
          detail: 'Envia el HTML completo en `html`, o la respuesta entera con sus bloques en `respuesta`.',
        },
        { status: 422 },
      );
    }

    // Si hay banco de fotos configurado, cambiamos las de relleno por fotos del tema.
    const fotos = await ponerFotosTematicas(html);

    const updated = await prisma.handoff.update({
      where: { code: handoff.code },
      data: {
        html: fotos.html,
        css,
        js,
        notes: payload.notes?.trim() || null,
        status: 'entregado',
        deliveredAt: new Date(),
      },
    });

    return NextResponse.json({
      handoff: serializeHandoff(updated),
      mensaje: `Landing entregada en ConvertIA. Ya se esta viendo en el Visor de Codigo del encargo ${updated.code}.`,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
