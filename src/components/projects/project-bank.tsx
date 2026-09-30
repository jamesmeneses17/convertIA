'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Code2,
  Copy,
  Eye,
  FolderOpen,
  Loader2,
  Search,
  SquarePen,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { PromptViewer } from '@/components/wizard/prompt-viewer';
import { TECHNIQUES, getTechnique } from '@/lib/techniques';
import type { ProjectDTO } from '@/lib/types';
import { copyToClipboard, formatDate } from '@/lib/utils';

interface ProjectBankProps {
  initialProjects: ProjectDTO[];
}

export function ProjectBank({ initialProjects }: ProjectBankProps) {
  const [projects, setProjects] = React.useState(initialProjects);
  const [query, setQuery] = React.useState('');
  const [inspected, setInspected] = React.useState<ProjectDTO | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<ProjectDTO | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const filtered = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return projects;
    return projects.filter((project) =>
      [project.name, project.topic, project.offer, project.audience, project.tone]
        .join(' ')
        .toLowerCase()
        .includes(needle),
    );
  }, [projects, query]);

  async function handleCopyPrompt(project: ProjectDTO) {
    const ok = await copyToClipboard(project.masterPrompt);
    if (ok) {
      toast.success('Prompt copiado', { description: project.name });
    } else {
      toast.error('No se pudo copiar');
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/projects/${pendingDelete.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        toast.error(payload.error ?? 'No se pudo eliminar el proyecto.');
        return;
      }
      setProjects((prev) => prev.filter((item) => item.id !== pendingDelete.id));
      toast.success('Proyecto eliminado', { description: pendingDelete.name });
      setPendingDelete(null);
    } catch {
      toast.error('No se pudo contactar con el servidor.');
    } finally {
      setDeleting(false);
    }
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="grid place-items-center gap-4 py-16 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-lg border border-dashed border-border text-muted-foreground">
            <FolderOpen className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-medium">El banco esta vacio</p>
            <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-muted-foreground">
              Compila tu primer Prompt Maestro en el asistente y pulsa Guardar proyecto. Aqui quedaran el
              brief, las tecnicas, el prompt y el codigo que devolvio la IA.
            </p>
          </div>
          <Button asChild>
            <Link href="/">Ir al asistente</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nombre, tema, oferta o publico"
          className="pl-9"
          aria-label="Buscar proyectos"
        />
      </div>

      <p className="font-mono text-xs text-muted-foreground">
        {filtered.length} de {projects.length} {projects.length === 1 ? 'proyecto' : 'proyectos'}
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((project) => (
          <Card key={project.id} className="flex min-w-0 flex-col">
            <CardHeader className="gap-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="truncate text-base" title={project.name}>
                    {project.name}
                  </CardTitle>
                  <CardDescription className="mt-1 font-mono text-[0.68rem]">
                    {formatDate(project.createdAt)}
                  </CardDescription>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  {project.pastedCode ? (
                    <Badge variant="success" className="font-mono text-[0.62rem]">
                      <Code2 className="h-3 w-3" />
                      codigo
                    </Badge>
                  ) : null}
                  <Badge variant="outline" className="font-mono text-[0.62rem]">
                    {project.techniques.length}/{TECHNIQUES.length}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col gap-4">
              <dl className="grid gap-1.5 text-xs">
                {[
                  { label: 'Tema', value: project.topic },
                  { label: 'Oferta', value: project.offer },
                  { label: 'Publico', value: project.audience },
                  { label: 'Tono', value: project.tone },
                  { label: 'CTA', value: project.cta ?? 'a propuesta de la IA' },
                ].map((row) => (
                  <div key={row.label} className="grid grid-cols-[4.5rem_1fr] gap-2">
                    <dt className="font-mono uppercase tracking-wide text-muted-foreground">{row.label}</dt>
                    <dd className="min-w-0 truncate text-foreground/85" title={row.value}>
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>

              {project.techniques.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {project.techniques.map((slug) => (
                    <Badge key={slug} variant="secondary" className="font-normal text-[0.68rem]">
                      {getTechnique(slug).name}
                    </Badge>
                  ))}
                </div>
              ) : null}

              <div className="mt-auto flex flex-wrap gap-2 pt-1">
                <Button size="sm" variant="outline" onClick={() => setInspected(project)}>
                  <Eye />
                  Ver prompt
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleCopyPrompt(project)}>
                  <Copy />
                  Copiar
                </Button>
                <Button size="sm" variant="ghost" asChild>
                  <Link href={`/?project=${project.id}`}>
                    <SquarePen />
                    Abrir en el asistente
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setPendingDelete(project)}
                >
                  <Trash2 />
                  <span className="sr-only">Eliminar {project.name}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ---------- Visor del prompt guardado ---------- */}
      <Dialog open={inspected !== null} onOpenChange={(open) => !open && setInspected(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{inspected?.name}</DialogTitle>
            <DialogDescription>
              Prompt guardado el {inspected ? formatDate(inspected.createdAt) : ''}
            </DialogDescription>
          </DialogHeader>
          {inspected ? (
            <PromptViewer
              prompt={inspected.masterPrompt}
              title="Prompt guardado"
              filename={inspected.name}
              collapsedHeight={360}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      {/* ---------- Confirmacion de borrado ---------- */}
      <Dialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar proyecto</DialogTitle>
            <DialogDescription>
              Vas a borrar <span className="font-medium text-foreground">{pendingDelete?.name}</span> del
              banco, con su prompt y su codigo. Esta accion no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPendingDelete(null)} disabled={deleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
              {deleting ? 'Eliminando...' : 'Si, eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
