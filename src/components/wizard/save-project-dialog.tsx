'use client';

import * as React from 'react';
import { Database, FilePlus2, Loader2, Save, TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getTechnique } from '@/lib/techniques';
import type { ApiError, Brief, PastedCode, ProjectDTO, TechniqueSlug } from '@/lib/types';
import { isCodeEmpty } from '@/lib/preview';
import { estimateTokens } from '@/lib/utils';

interface SaveProjectDialogProps {
  brief: Brief;
  techniques: TechniqueSlug[];
  masterPrompt: string;
  pastedCode: PastedCode;
  suggestedName: string;
  /** Si existe, el guardado actualiza ese proyecto en lugar de crear uno nuevo. */
  existingId: string | null;
  onSaved: (project: ProjectDTO) => void;
}

export function SaveProjectDialog({
  brief,
  techniques,
  masterPrompt,
  pastedCode,
  suggestedName,
  existingId,
  onSaved,
}: SaveProjectDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState(suggestedName);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<ApiError | null>(null);

  React.useEffect(() => {
    if (open) setName((current) => (current.trim() ? current : suggestedName));
  }, [open, suggestedName]);

  async function handleSave(forzarNuevo = false) {
    if (!name.trim()) {
      setError({ error: 'Ponle un nombre al proyecto para poder encontrarlo despues.' });
      return;
    }

    setSaving(true);
    setError(null);

    const body = {
      name: name.trim(),
      topic: brief.topic.trim(),
      offer: brief.offer.trim(),
      audience: brief.audience.trim(),
      tone: brief.tone.trim(),
      cta: brief.cta.trim() || null,
      techniques,
      masterPrompt,
      pastedCode: isCodeEmpty(pastedCode) ? null : pastedCode,
    };

    try {
      const actualizar = Boolean(existingId) && !forzarNuevo;
      const response = await fetch(actualizar ? `/api/projects/${existingId}` : '/api/projects', {
        method: actualizar ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const payload = (await response.json()) as { project?: ProjectDTO } & ApiError;

      if (!response.ok || !payload.project) {
        setError({
          error: payload.error ?? 'No se pudo guardar el proyecto.',
          detail: payload.detail,
          dbUnavailable: payload.dbUnavailable,
        });
        return;
      }

      onSaved(payload.project);
      setOpen(false);
      toast.success(actualizar ? 'Proyecto actualizado' : 'Proyecto guardado', {
        description: `"${payload.project.name}" esta en tu Banco de Proyectos.`,
      });
    } catch (cause) {
      setError({
        error: 'No se pudo contactar con el servidor.',
        detail: cause instanceof Error ? cause.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  const summary: { label: string; value: string }[] = [
    { label: 'Tema', value: brief.topic || '(vacio)' },
    { label: 'Publico', value: brief.audience || '(vacio)' },
    { label: 'Tecnicas', value: techniques.length > 0 ? techniques.map((slug) => getTechnique(slug).name).join(', ') : 'ninguna' },
    { label: 'Prompt', value: `${masterPrompt.length.toLocaleString('es-CO')} caracteres (~${estimateTokens(masterPrompt).toLocaleString('es-CO')} tokens)` },
    { label: 'Codigo pegado', value: isCodeEmpty(pastedCode) ? 'sin codigo' : 'incluido (HTML/CSS/JS)' },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <Save />
          {existingId ? 'Actualizar proyecto' : 'Guardar proyecto'}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            {existingId ? 'Actualizar en el Banco de Proyectos' : 'Guardar en el Banco de Proyectos'}
          </DialogTitle>
          <DialogDescription>
            Se almacenan el brief, las tecnicas activas, el Prompt Maestro y el codigo pegado en PostgreSQL.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Nombre del proyecto</Label>
            <Input
              id="project-name"
              value={name}
              invalid={Boolean(error && !name.trim())}
              maxLength={120}
              placeholder="Landing curso finanzas 30 dias"
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !saving) void handleSave(!existingId);
              }}
            />
          </div>

          <dl className="grid gap-2 rounded-lg border border-border bg-muted/40 p-3 text-xs">
            {summary.map((item) => (
              <div key={item.label} className="grid grid-cols-[6.5rem_1fr] gap-2">
                <dt className="font-mono uppercase tracking-wide text-muted-foreground">{item.label}</dt>
                <dd className="min-w-0 truncate text-foreground/85" title={item.value}>
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>

          {error ? (
            <Alert variant={error.dbUnavailable ? 'warning' : 'destructive'}>
              <TriangleAlert />
              <AlertTitle>{error.error}</AlertTitle>
              {error.detail ? <AlertDescription>{error.detail}</AlertDescription> : null}
            </Alert>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          {existingId ? (
            <Button variant="outline" onClick={() => handleSave(true)} disabled={saving}>
              <FilePlus2 />
              Guardar como nuevo
            </Button>
          ) : null}
          <Button onClick={() => handleSave(!existingId)} disabled={saving}>
            {saving ? <Loader2 className="animate-spin" /> : <Save />}
            {saving ? 'Guardando...' : existingId ? 'Actualizar el existente' : 'Guardar proyecto'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
