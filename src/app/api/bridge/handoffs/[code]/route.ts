import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toErrorResponse } from '@/lib/api-errors';
import { serializeHandoff, serializeHandoffWithCode } from '@/lib/bridge';
import { archivarEntrega, leerEntrega, limpiarBuzon } from '@/lib/buzon';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ code: string }> };

/**
 * GET /api/bridge/handoffs/:code
 * Lo usan las dos puntas del puente:
 *  - el servidor MCP, para leer el Prompt Maestro del encargo;
 *  - la pantalla de ConvertIA, que consulta cada pocos segundos si ya llego
 *    la landing generada por Claude Escritorio.
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { code } = await context.params;
    const handoff = await prisma.handoff.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!handoff) {
      return NextResponse.json({ error: `No existe ningun encargo con el codigo ${code}.` }, { status: 404 });
    }

    // Puente por carpeta: si Claude dejo el archivo ENTREGA.html, lo recogemos aqui.
    if (handoff.status === 'pendiente') {
      const entregado = await leerEntrega();
      if (entregado) {
        const actualizado = await prisma.handoff.update({
          where: { code: handoff.code },
          data: {
            html: entregado,
            css: '',
            js: '',
            notes: 'Entregada desde la carpeta compartida.',
            status: 'entregado',
            deliveredAt: new Date(),
          },
        });
        await archivarEntrega(handoff.code);
        return NextResponse.json({ handoff: serializeHandoffWithCode(actualizado) });
      }
    }

    return NextResponse.json({ handoff: serializeHandoffWithCode(handoff) });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/** DELETE /api/bridge/handoffs/:code :: cancela un encargo pendiente. */
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { code } = await context.params;
    const handoff = await prisma.handoff.update({
      where: { code: code.toUpperCase() },
      data: { status: 'cancelado' },
    });
    await limpiarBuzon();
    return NextResponse.json({ handoff: serializeHandoff(handoff) });
  } catch (error) {
    return toErrorResponse(error);
  }
}
