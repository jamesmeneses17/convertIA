import { PrismaClient } from '@prisma/client';

/**
 * Cliente Prisma unico (singleton) para evitar agotar el pool de conexiones
 * con el hot-reload de Next.js en desarrollo.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/** true cuando hay cadena de conexion configurada. */
export function isDatabaseConfigured(): boolean {
  return typeof process.env.DATABASE_URL === 'string' && process.env.DATABASE_URL.length > 0;
}

/** Ping ligero para el endpoint de salud y el aviso de la interfaz. */
export async function checkDatabase(): Promise<{ ok: boolean; detail?: string }> {
  if (!isDatabaseConfigured()) {
    return { ok: false, detail: 'DATABASE_URL no configurada' };
  }
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true };
  } catch (error) {
    return { ok: false, detail: error instanceof Error ? error.message : 'error desconocido' };
  }
}
