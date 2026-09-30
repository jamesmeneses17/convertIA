'use client';

import * as React from 'react';
import { ArrowLeft, BrainCircuit, Combine, Copy, FolderOpen, SplitSquareHorizontal } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CodePreview } from '@/components/wizard/code-preview';
import { PromptViewer } from '@/components/wizard/prompt-viewer';
import { SaveProjectDialog } from '@/components/wizard/save-project-dialog';
import { joinIndividualPrompts } from '@/lib/prompt-builder';
import { TECHNIQUES, getTechnique } from '@/lib/techniques';
import type {
  Brief,
  CompilationMode,
  IndividualPrompt,
  PastedCode,
  ProjectDTO,
  TechniqueSlug,
} from '@/lib/types';
import { copyToClipboard } from '@/lib/utils';

interface StepPromptsProps {
  brief: Brief;
  techniques: TechniqueSlug[];
  mode: CompilationMode;
  masterPrompt: string;
  /** Prompt redactado por la IA, si se pidio. */
  promptIA: string | null;
  /** Version retocada a mano, si el usuario edito el prompt. */
  promptEditado: string | null;
  onPromptEditado: (prompt: string | null) => void;
  individualPrompts: IndividualPrompt[];
  pastedCode: PastedCode;
  savedProjectId: string | null;
  onPastedCodeChange: (code: PastedCode) => void;
  onModeChange: (mode: CompilationMode) => void;
  onBack: () => void;
  onSaved: (project: ProjectDTO) => void;
}

export function StepPrompts({
  brief,
  techniques,
  mode,
  masterPrompt,
  promptIA,
  promptEditado,
  onPromptEditado,
  individualPrompts,
  pastedCode,
  savedProjectId,
  onPastedCodeChange,
  onModeChange,
  onBack,
  onSaved,
}: StepPromptsProps) {
  /**
   * El prompt que se usa de verdad, por orden de prioridad:
   * lo que el usuario edito a mano > lo que escribio la IA > el compilado.
   */
  const promptBase = mode === 'ia' ? (promptIA ?? masterPrompt) : masterPrompt;
  const promptEfectivo = promptEditado ?? promptBase;
  const escritoPorIA = mode === 'ia' && promptIA !== null;

  const suggestedName = React.useMemo(() => {
    const base = brief.offer.trim() || brief.topic.trim() || 'Proyecto sin titulo';
    return base.length > 70 ? `${base.slice(0, 67)}...` : base;
  }, [brief.offer, brief.topic]);

  async function handleCopyAll() {
    const ok = await copyToClipboard(joinIndividualPrompts(individualPrompts));
    if (ok) {
      toast.success(`${individualPrompts.length} prompts copiados en un solo documento`);
    } else {
      toast.error('No se pudo copiar');
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="stage-index">Etapa 03</span>
              <CardTitle className="mt-1 text-2xl">
                {mode === 'ia'
                  ? 'Prompt Maestro redactado por la IA'
                  : mode === 'master'
                    ? 'Prompt Maestro compilado'
                    : 'Prompts por tecnica'}
              </CardTitle>
              <CardDescription className="mt-1.5 max-w-2xl">
                {mode === 'ia'
                  ? 'Escrito a medida para este proyecto: la IA eligio el arquetipo de composicion, la direccion tipografica y las secciones. Revisalo antes de usarlo.'
                  : mode === 'master'
                    ? 'Copialo y pegalo en Claude, ChatGPT, Gemini o DeepSeek. El resultado es equivalente en cualquiera: la calidad vive en el prompt, no en el modelo.'
                    : 'Un prompt independiente por tecnica, con el mismo brief. Ejecutalos por separado y compara que aporta cada una.'}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {promptIA ? (
                <Button
                  size="sm"
                  variant={mode === 'ia' ? 'default' : 'outline'}
                  onClick={() => onModeChange('ia')}
                >
                  <BrainCircuit />
                  Version de la IA
                </Button>
              ) : null}
              <Button
                size="sm"
                variant={mode === 'master' ? 'default' : 'outline'}
                onClick={() => onModeChange('master')}
              >
                <Combine />
                Compilado
              </Button>
              <Button
                size="sm"
                variant={mode === 'separate' ? 'default' : 'outline'}
                onClick={() => onModeChange('separate')}
                disabled={techniques.length === 0}
                title={techniques.length === 0 ? 'Activa al menos una tecnica en la Etapa 02' : undefined}
              >
                <SplitSquareHorizontal />
                Por separado
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[0.7rem] uppercase tracking-wide text-muted-foreground">
              Tecnicas inyectadas
            </span>
            {techniques.length === 0 ? (
              <Badge variant="outline">ninguna</Badge>
            ) : (
              techniques.map((slug) => (
                <Badge key={slug} variant="default" className="font-normal">
                  {getTechnique(slug).name}
                </Badge>
              ))
            )}
          </div>

          <Separator />

          {mode !== 'separate' ? (
            <PromptViewer
              prompt={promptEfectivo}
              title={mode === 'ia' ? 'Prompt Maestro (version IA)' : 'Prompt Maestro'}
              subtitle="Brief + tecnicas + arquitectura + requisitos tecnicos + formato de salida + checklist."
              filename={suggestedName}
              onPromptChange={(texto) => onPromptEditado(texto)}
              editado={promptEditado !== null}
              onReset={() => onPromptEditado(null)}
              nota={escritoPorIA ? 'escrito por la IA' : 'plantilla determinista | sin IA'}
              badge={
                <>
                  <Badge variant="success" className="font-mono text-[0.65rem]">
                    {techniques.length}/{TECHNIQUES.length} tecnicas
                  </Badge>
                  <Badge
                    variant={escritoPorIA ? 'default' : 'secondary'}
                    className="font-mono text-[0.65rem]"
                  >
                    {escritoPorIA ? 'redactado con IA' : 'plantilla fija'}
                  </Badge>
                </>
              }
            />
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  {individualPrompts.length} prompts independientes generados con el mismo brief.
                </p>
                <Button size="sm" variant="outline" onClick={handleCopyAll}>
                  <Copy />
                  Copiar los {individualPrompts.length} en un documento
                </Button>
              </div>

              {individualPrompts.map((item, index) => (
                <PromptViewer
                  key={item.slug}
                  prompt={item.prompt}
                  title={`${String(index + 1).padStart(2, '0')} | ${item.name}`}
                  subtitle={getTechnique(item.slug).soloObjective}
                  filename={`${suggestedName}-${item.slug}`}
                  collapsedHeight={300}
                  badge={
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.65rem] text-muted-foreground">
                      {item.slug}
                    </code>
                  }
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CodePreview
        code={pastedCode}
        onChange={onPastedCodeChange}
        projectName={suggestedName}
        prompt={mode === 'separate' ? joinIndividualPrompts(individualPrompts) : promptEfectivo}
        brief={brief}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft />
          Volver a las tecnicas
        </Button>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/proyectos">
              <FolderOpen />
              Banco de proyectos
            </Link>
          </Button>
          <SaveProjectDialog
            brief={brief}
            techniques={techniques}
            masterPrompt={mode === 'separate' ? joinIndividualPrompts(individualPrompts) : promptEfectivo}
            pastedCode={pastedCode}
            suggestedName={suggestedName}
            existingId={savedProjectId}
            onSaved={onSaved}
          />
        </div>
      </div>
    </div>
  );
}
