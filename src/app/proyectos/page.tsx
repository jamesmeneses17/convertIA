import Link from 'next/link';
import { ArrowLeft, DatabaseZap, TriangleAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ProjectBank } from '@/components/projects/project-bank';
import { prisma } from '@/lib/prisma';
import { serializeProject } from '@/lib/serialize';
import type { ProjectDTO } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Banco de proyectos',
  description: 'Briefs, tecnicas, Prompts Maestros y codigo guardados en PostgreSQL.',
};

async function loadProjects(): Promise<{ projects: ProjectDTO[]; error: string | null }> {
  if (!process.env.DATABASE_URL) {
    return {
      projects: [],
      error:
        'DATABASE_URL no esta configurada. Copia .env.example a .env y levanta la base de datos con docker-compose up db.',
    };
  }
  try {
    const rows = await prisma.project.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
    return { projects: rows.map(serializeProject), error: null };
  } catch (cause) {
    console.error('[ConvertIA][proyectos]', cause);
    return {
      projects: [],
      error:
        'No se pudo consultar PostgreSQL. Comprueba que el contenedor `db` esta arriba y que DATABASE_URL apunta a el.',
    };
  }
}

export default async function ProjectsPage() {
  const { projects, error } = await loadProjects();

  return (
    <div className="container py-10 sm:py-14">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="stage-index">Banco de proyectos</span>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Tus proyectos guardados</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Cada tarjeta guarda el brief completo, las tecnicas activadas, el Prompt Maestro compilado y el
            codigo HTML/CSS/JS que devolvio la IA.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft />
            Volver al asistente
          </Link>
        </Button>
      </div>

      <div className="mt-8 space-y-5">
        {error ? (
          <Alert variant="warning">
            <TriangleAlert />
            <AlertTitle>Base de datos no disponible</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>{error}</p>
              <p className="font-mono text-xs">docker-compose up --build</p>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="success">
            <DatabaseZap />
            <AlertTitle>PostgreSQL conectado</AlertTitle>
            <AlertDescription>
              {projects.length} {projects.length === 1 ? 'proyecto' : 'proyectos'} en el banco.
            </AlertDescription>
          </Alert>
        )}

        <ProjectBank initialProjects={projects} />
      </div>
    </div>
  );
}
