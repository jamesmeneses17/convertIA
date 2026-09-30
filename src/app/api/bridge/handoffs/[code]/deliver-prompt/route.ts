import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toErrorResponse } from '@/lib/api-errors';
import { deliverPromptSchema, serializeHandoff } from '@/lib/bridge';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ code: string }> };

/**
 * POST /api/bridge/handoffs/:code/deliver-prompt
 * Aqui entrega la IA el Prompt Maestro que ha redactado para un encargo
 * de tipo `prompt`. No lleva HTML: solo el texto del encargo.
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { code } = await context.params;
    const payload = deliverPromptSchema.parse(await request.json());

    const handoff = await prisma.handoff.findUnique({ where: { code: code.toUpperCase() } });
    if (!handoff) {
      return NextResponse.json(
        { error: `No existe ningun encargo con el codigo ${code}.` },
        { status: 404 },
      );
    }
    if (handoff.tipo !== 'prompt') {
      return NextResponse.json(
        {
          error: `El encargo ${handoff.code} pide una landing, no un Prompt Maestro.`,
          detail: 'Usa entregar_landing para ese tipo de encargo.',
        },
        { status: 409 },
      );
    }
    if (handoff.status === 'cancelado') {
      return NextResponse.json(
        { error: `El encargo ${handoff.code} fue cancelado desde ConvertIA.` },
        { status: 409 },
      );
    }

    const updated = await prisma.handoff.update({
      where: { code: handoff.code },
      data: {
        resultado: payload.prompt_maestro,
        notes: payload.notes?.trim() || null,
        status: 'entregado',
        deliveredAt: new Date(),
      },
    });

    return NextResponse.json({
      handoff: serializeHandoff(updated),
      mensaje: `Prompt Maestro entregado. Ya se esta viendo en ConvertIA (encargo ${updated.code}).`,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
