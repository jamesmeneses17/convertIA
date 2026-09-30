import { NextResponse, type NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { serializeProject } from '@/lib/serialize';
import { toErrorResponse } from '@/lib/api-errors';
import { updateProjectSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

/** GET /api/projects/:id */
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json({ error: 'El proyecto no existe.' }, { status: 404 });
    }
    return NextResponse.json({ project: serializeProject(project) });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/** PATCH /api/projects/:id :: actualiza el proyecto o el codigo pegado. */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const payload = updateProjectSchema.parse(await request.json());

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(payload.name !== undefined ? { name: payload.name } : {}),
        ...(payload.topic !== undefined ? { topic: payload.topic } : {}),
        ...(payload.offer !== undefined ? { offer: payload.offer } : {}),
        ...(payload.audience !== undefined ? { audience: payload.audience } : {}),
        ...(payload.tone !== undefined ? { tone: payload.tone } : {}),
        ...(payload.cta !== undefined ? { cta: payload.cta?.trim() ? payload.cta.trim() : null } : {}),
        ...(payload.techniques !== undefined ? { techniques: payload.techniques } : {}),
        ...(payload.masterPrompt !== undefined ? { masterPrompt: payload.masterPrompt } : {}),
        // Prisma exige Prisma.DbNull para vaciar una columna Json nullable.
        ...(payload.pastedCode !== undefined
          ? { pastedCode: payload.pastedCode === null ? Prisma.DbNull : payload.pastedCode }
          : {}),
      },
    });

    return NextResponse.json({ project: serializeProject(project) });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/** DELETE /api/projects/:id */
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
