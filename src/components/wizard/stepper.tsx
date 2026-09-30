'use client';

import { Check, FileText, Layers, Terminal } from 'lucide-react';
import { TECHNIQUES } from '@/lib/techniques';
import { cn } from '@/lib/utils';

export type StepId = 1 | 2 | 3;

interface StepDefinition {
  id: StepId;
  code: string;
  title: string;
  subtitle: string;
  icon: typeof FileText;
}

const STEPS: readonly StepDefinition[] = [
  { id: 1, code: 'ETAPA 01', title: 'Brief', subtitle: 'Variables del proyecto', icon: FileText },
  { id: 2, code: 'ETAPA 02', title: 'Metodo', subtitle: `${TECHNIQUES.length} tecnicas avanzadas`, icon: Layers },
  { id: 3, code: 'ETAPA 03', title: 'Prompts', subtitle: 'Compilar, ejecutar, guardar', icon: Terminal },
] as const;

interface StepperProps {
  current: StepId;
  /** Etapas ya validadas: permiten navegacion hacia atras o adelante. */
  unlocked: Record<StepId, boolean>;
  onNavigate: (step: StepId) => void;
}

export function Stepper({ current, unlocked, onNavigate }: StepperProps) {
  return (
    <nav aria-label="Progreso del asistente" className="w-full">
      <ol className="grid gap-3 sm:grid-cols-3">
        {STEPS.map((step) => {
          const isCurrent = step.id === current;
          const isDone = step.id < current && unlocked[step.id];
          const isReachable = unlocked[step.id];
          const Icon = step.icon;

          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => isReachable && onNavigate(step.id)}
                disabled={!isReachable}
                aria-current={isCurrent ? 'step' : undefined}
                className={cn(
                  'group flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all',
                  isCurrent
                    ? 'border-primary/60 bg-primary/8 shadow-sm'
                    : 'border-border bg-card hover:border-border',
                  isReachable ? 'cursor-pointer' : 'cursor-not-allowed opacity-55',
                )}
              >
                <span
                  className={cn(
                    'grid h-9 w-9 shrink-0 place-items-center rounded-md border text-sm font-semibold transition-colors',
                    isDone
                      ? 'border-success/40 bg-success/15 text-success'
                      : isCurrent
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-muted text-muted-foreground',
                  )}
                >
                  {isDone ? <Check className="h-4 w-4 stroke-[3]" /> : <Icon className="h-4 w-4" />}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="stage-index block">{step.code}</span>
                  <span className="block truncate text-sm font-semibold">{step.title}</span>
                  <span className="block truncate text-xs text-muted-foreground">{step.subtitle}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
