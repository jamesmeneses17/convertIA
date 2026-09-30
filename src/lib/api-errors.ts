import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

/** Codigos de Prisma que significan "no se pudo hablar con la base de datos". */
const CONNECTION_CODES = new Set(['P1000', 'P1001', 'P1002', 'P1003', 'P1010', 'P1017', 'P2021']);

function prismaCode(error: unknown): string | undefined {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === 'string') return code;
  }
  return undefined;
}

export function isDbConnectionError(error: unknown): boolean {
  const code = prismaCode(error);
  if (code && CONNECTION_CODES.has(code)) return true;
  const message = error instanceof Error ? error.message : '';
  return /Can't reach database|ECONNREFUSED|does not exist|ENOTFOUND/i.test(message);
}

/** Traduce cualquier excepcion en una respuesta JSON coherente. */
export function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    const first = error.issues[0];
    return NextResponse.json(
      {
        error: 'Datos invalidos.',
        detail: first ? `${first.path.join('.') || 'campo'}: ${first.message}` : undefined,
      },
      { status: 422 },
    );
  }

  if (isDbConnectionError(error)) {
    return NextResponse.json(
      {
        error: 'Base de datos no disponible.',
        detail:
          'Levanta PostgreSQL (docker-compose up db) o revisa DATABASE_URL. El Prompt Maestro sigue funcionando: copialo al portapapeles.',
        dbUnavailable: true,
      },
      { status: 503 },
    );
  }

  if (prismaCode(error) === 'P2025') {
    return NextResponse.json({ error: 'El proyecto no existe.' }, { status: 404 });
  }

  console.error('[ConvertIA][api]', error);
  return NextResponse.json(
    { error: 'Error interno.', detail: error instanceof Error ? error.message : undefined },
    { status: 500 },
  );
}
