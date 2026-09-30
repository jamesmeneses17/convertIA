'use client';

import * as React from 'react';
import { ArrowLeft, CheckCheck, Combine, Info, SplitSquareHorizontal, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TechniqueCard } from '@/components/wizard/technique-card';
import { PromptGenerator } from '@/components/wizard/prompt-generator';
import { TECHNIQUES } from '@/lib/techniques';
import type { Brief, CompilationMode, TechniqueSlug } from '@/lib/types';

interface StepMethodProps {
  brief: Brief;
  projectName: string;
  onPromptListo: (prompt: string, notas: string | null) => void;
  selected: TechniqueSlug[];
  onToggle: (slug: TechniqueSlug, active: boolean) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onCompile: (mode: CompilationMode) => void;
  onBack: () => void;
}

export function StepMethod({
  brief,
  projectName,
  onPromptListo,
  selected,
  onToggle,
  onSelectAll,
  onClearAll,
  onCompile,
  onBack,
}: StepMethodProps) {
  const count = selected.length;
  const none = count === 0;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="stage-index">Etapa 02</span>
              <CardTitle className="mt-1 text-2xl">Metodo</CardTitle>
              <CardDescription className="mt-1.5 max-w-2xl">
                Cada tecnica anade un bloque de directivas verificables al prompt. No son etiquetas
                decorativas: son ordenes concretas que cambian el resultado que devuelve la IA.
              </CardDescription>
            </div>
            <Badge variant={none ? 'outline' : 'default'} className="font-mono">
              {count}/{TECHNIQUES.length} activas
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={onSelectAll} disabled={count === TECHNIQUES.length}>
              <CheckCheck />
              Activar las {TECHNIQUES.length}
            </Button>
            <Button variant="ghost" size="sm" onClick={onClearAll} disabled={none}>
              <X />
              Desactivar todas
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {TECHNIQUES.map((technique, index) => (
              <TechniqueCard
                key={technique.slug}
                technique={technique}
                index={index}
                active={selected.includes(technique.slug)}
                onToggle={(active) => onToggle(technique.slug, active)}
              />
            ))}
          </div>

          {none ? (
            <Alert variant="warning">
              <Info />
              <AlertTitle>Sin tecnicas activas</AlertTitle>
              <AlertDescription>
                Puedes compilar igualmente: obtendras un prompt profesional con brief, arquitectura,
                requisitos tecnicos y checklist. Pero las tecnicas son lo que separa una landing correcta de
                una que convierte.
              </AlertDescription>
            </Alert>
          ) : null}

          <Separator />

          <PromptGenerator
            brief={brief}
            techniques={selected}
            projectName={projectName}
            onPromptListo={onPromptListo}
          />

          <details className="rounded-lg border border-border bg-muted/30 px-4 py-3">
            <summary className="cursor-pointer text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
              Sin IA a mano: compilar con la plantilla
            </summary>

            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              El compilador determinista arma el prompt al instante y siempre igual. Util si Claude no esta
              disponible o si quieres comparar con la version de la IA, pero la estructura sera la misma en
              todos los proyectos.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => onCompile('master')}>
                <Combine />
                Compilar con plantilla
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onCompile('separate')}
                disabled={none}
                title={none ? 'Activa al menos una tecnica' : undefined}
              >
                <SplitSquareHorizontal />
                Un prompt por tecnica
              </Button>
            </div>
          </details>
        </CardContent>
      </Card>

      <div className="flex justify-start">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft />
          Volver al brief
        </Button>
      </div>
    </div>
  );
}
