import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeProject } from '@/lib/serialize';
import { toErrorResponse } from '@/lib/api-errors';
import { createProjectSchema } from '@/lib/validation';
import type { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

/** GET /api/projects :: lista el Banco de Proyectos (mas recientes primero). */
export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get('q')?.trim();
    const take = Math.min(Number(request.nextUrl.searchParams.get('take') ?? 60), 200);

    const where: Prisma.ProjectWhereInput = query
      ? {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { topic: { contains: query, mode: 'insensitive' } },
            { offer: { contains: query, mode: 'insensitive' } },
            { audience: { contains: query, mode: 'insensitive' } },
          ],
        }
      : {};

    const projects = await prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
    });

    return NextResponse.json({ projects: projects.map(serializeProject) });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/** POST /api/projects :: guarda brief + tecnicas + Prompt Maestro. */
export async function POST(request: NextRequest) {
  try {
    const payload = createProjectSchema.parse(await request.json());

    const project = await prisma.project.create({
      data: {
        name: payload.name,
        topic: payload.topic,
        offer: payload.offer,
        audience: payload.audience,
        tone: payload.tone,
        cta: payload.cta?.trim() ? payload.cta.trim() : null,
        techniques: payload.techniques,
        masterPrompt: payload.masterPrompt,
        pastedCode: payload.pastedCode ?? undefined,
      },
    });

    return NextResponse.json({ project: serializeProject(project) }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
