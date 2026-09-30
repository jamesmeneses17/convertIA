import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toErrorResponse } from '@/lib/api-errors';
import { createHandoffSchema, generateHandoffCode, serializeHandoff } from '@/lib/bridge';
import { escribirEncargo } from '@/lib/buzon';

export const dynamic = 'force-dynamic';

/**
 * GET /api/bridge/handoffs
 * Buzon de encargos. Lo consulta el servidor MCP para que Claude Escritorio
 * vea que hay pendiente sin que le dictes el codigo.
 */
export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get('status') ?? 'pendiente';
    const take = Math.min(Number(request.nextUrl.searchParams.get('take') ?? 20), 100);

    const handoffs = await prisma.handoff.findMany({
      where: status === 'todos' ? {} : { status },
      orderBy: { createdAt: 'desc' },
      take,
    });

    return NextResponse.json({ handoffs: handoffs.map(serializeHandoff) });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/**
 * POST /api/bridge/handoffs
 * La Etapa 03 deja aqui el Prompt Maestro y recibe un codigo corto
 * para dictarselo a Claude Escritorio.
 */
export async function POST(request: NextRequest) {
  try {
    const payload = createHandoffSchema.parse(await request.json());

    // Reintenta si el codigo aleatorio ya existia (colision improbable).
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const code = generateHandoffCode();
      const existing = await prisma.handoff.findUnique({ where: { code } });
      if (existing) continue;

      const handoff = await prisma.handoff.create({
        data: { code, name: payload.name, prompt: payload.prompt },
      });

      // Puente por carpeta: deja el encargo escrito para Claude Escritorio.
      await escribirEncargo(handoff.code, handoff.name, handoff.prompt).catch((error) => {
        console.error('[ConvertIA][buzon] no se pudo escribir el encargo', error);
      });

      return NextResponse.json({ handoff: serializeHandoff(handoff) }, { status: 201 });
    }

    return NextResponse.json(
      { error: 'No se pudo generar un codigo libre. Reintenta.' },
      { status: 503 },
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}
