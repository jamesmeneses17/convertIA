'use client';

import * as React from 'react';
import { ArrowLeft, CheckCheck, Combine, Info, SplitSquareHorizontal, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TechniqueCard } from '@/components/wizard/technique-card';
import { TECHNIQUES } from '@/lib/techniques';
import type { CompilationMode, TechniqueSlug } from '@/lib/types';

interface StepMethodProps {
  selected: TechniqueSlug[];
  onToggle: (slug: TechniqueSlug, active: boolean) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onCompile: (mode: CompilationMode) => void;
  onBack: () => void;
}

export function StepMethod({
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

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <SplitSquareHorizontal className="h-4 w-4 text-primary" />
                Probar tecnicas por separado
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Genera un prompt independiente por cada tecnica activa, con el mismo brief. Sirve para medir
                el efecto aislado de cada una y comparar resultados (prueba A/B de ingenieria de prompt).
              </p>
              <Button
                variant="outline"
                className="mt-4 w-full"
                onClick={() => onCompile('separate')}
                disabled={none}
                title={none ? 'Activa al menos una tecnica' : undefined}
              >
                Generar {count || ''} {count === 1 ? 'prompt aislado' : 'prompts aislados'}
              </Button>
            </div>

            <div className="rounded-lg border border-primary/50 bg-primary/[0.05] p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Combine className="h-4 w-4 text-primary" />
                Combinar en Prompt Maestro
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Fusiona brief, tecnicas, arquitectura de pagina, requisitos tecnicos, formato de salida y
                checklist de verificacion en un unico super-prompt listo para cualquier IA.
              </p>
              <Button className="mt-4 w-full" onClick={() => onCompile('master')}>
                Compilar Prompt Maestro
              </Button>
            </div>
          </div>
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
