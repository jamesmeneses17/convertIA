import { NextResponse } from 'next/server';
import { checkDatabase } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/** Salud del servicio; usada por el healthcheck de docker-compose y por la UI. */
export async function GET() {
  const db = await checkDatabase();
  return NextResponse.json(
    {
      status: 'ok',
      app: process.env.NEXT_PUBLIC_APP_NAME ?? 'ConvertIA',
      database: db.ok ? 'connected' : 'unavailable',
      detail: db.detail,
      timestamp: new Date().toISOString(),
    },
    { status: 200 },
  );
}
