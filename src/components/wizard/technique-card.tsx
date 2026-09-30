'use client';

import * as React from 'react';
import {
  Ban,
  Image as ImageIcon,
  MessageSquareQuote,
  Palette,
  Scissors,
  ShieldCheck,
  Sparkles,
  Target,
  Video,
  type LucideIcon,
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import type { Technique } from '@/lib/types';
import { cn } from '@/lib/utils';

const ICONS: Record<Technique['icon'], LucideIcon> = {
  Palette,
  Target,
  ShieldCheck,
  Image: ImageIcon,
  Video,
  Scissors,
  Ban,
  MessageSquareQuote,
  Sparkles,
};

interface TechniqueCardProps {
  technique: Technique;
  index: number;
  active: boolean;
  onToggle: (active: boolean) => void;
}

export function TechniqueCard({ technique, index, active, onToggle }: TechniqueCardProps) {
  const Icon = ICONS[technique.icon];
  const checkboxId = `technique-${technique.slug}`;

  return (
    <article
      className={cn(
        'group relative flex flex-col rounded-lg border bg-card transition-all',
        active ? 'border-primary/60 bg-primary/[0.04] shadow-sm' : 'border-border hover:border-primary/30',
      )}
    >
      {/* Numeracion de tecnica: firma visual repetida del sistema */}
      <span
        aria-hidden
        className={cn(
          'absolute right-3 top-3 font-mono text-[0.68rem] font-semibold tabular-nums transition-colors',
          active ? 'text-primary' : 'text-muted-foreground/45',
        )}
      >
        {String(index + 1).padStart(2, '0')}
      </span>

      <div className="flex items-start gap-3 p-4 pr-10">
        <Checkbox
          id={checkboxId}
          checked={active}
          onCheckedChange={(value) => onToggle(value === true)}
          aria-describedby={`${checkboxId}-tagline`}
          className="mt-0.5"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'grid h-7 w-7 shrink-0 place-items-center rounded-md border transition-colors',
                active
                  ? 'border-primary/40 bg-primary/12 text-primary'
                  : 'border-border bg-muted text-muted-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <label htmlFor={checkboxId} className="cursor-pointer text-sm font-semibold leading-tight">
              {technique.name}
            </label>
          </div>

          <p id={`${checkboxId}-tagline`} className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {technique.tagline}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant={active ? 'default' : 'outline'} className="font-normal">
              {technique.category}
            </Badge>
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.68rem] text-muted-foreground">
              {technique.slug}
            </code>
          </div>
        </div>
      </div>

      <div className="px-4">
        <Accordion type="single" collapsible>
          <AccordionItem value="detail" className="border-b-0">
            <AccordionTrigger className="py-2.5 text-xs uppercase tracking-wide text-muted-foreground hover:text-primary">
              Que hara en tu prompt
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <ul className="space-y-2">
                {technique.whatItDoes.map((item) => (
                  <li key={item} className="flex gap-2 text-xs leading-relaxed text-foreground/80">
                    <span aria-hidden className="mt-[0.35rem] h-1 w-1 shrink-0 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </article>
  );
}
