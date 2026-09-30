'use client';

import * as React from 'react';
import { Check, ChevronsDownUp, ChevronsUpDown, Copy, Download, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { openInClaude } from '@/lib/claude';
import { INLINE_CLASS, LINE_CLASS, highlightPrompt } from '@/lib/highlight';
import { copyToClipboard, countWords, downloadTextFile, estimateTokens, slugify } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface PromptViewerProps {
  prompt: string;
  title: string;
  subtitle?: string;
  /** Nombre base del archivo al descargar. */
  filename?: string;
  /** Muestra el boton "Ejecutar en Claude". */
  showExecute?: boolean;
  /** Altura maxima colapsada, en px. */
  collapsedHeight?: number;
  badge?: React.ReactNode;
}

export function PromptViewer({
  prompt,
  title,
  subtitle,
  filename,
  showExecute = true,
  collapsedHeight = 460,
  badge,
}: PromptViewerProps) {
  const [copied, setCopied] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);

  const lines = React.useMemo(() => highlightPrompt(prompt), [prompt]);
  const stats = React.useMemo(
    () => ({
      chars: prompt.length,
      words: countWords(prompt),
      tokens: estimateTokens(prompt),
      lines: lines.length,
    }),
    [prompt, lines.length],
  );

  async function handleCopy() {
    const ok = await copyToClipboard(prompt);
    if (!ok) {
      toast.error('No se pudo copiar', {
        description: 'Tu navegador bloqueo el portapapeles. Selecciona el texto y usa Ctrl+C.',
      });
      return;
    }
    setCopied(true);
    toast.success('Prompt copiado', {
      description: 'Pegalo en Claude, ChatGPT, Gemini o DeepSeek.',
    });
    window.setTimeout(() => setCopied(false), 2200);
  }

  function handleDownload() {
    downloadTextFile(`${slugify(filename ?? title) || 'prompt'}.md`, prompt, 'text/markdown');
    toast.success('Prompt descargado');
  }

  async function handleExecute() {
    const result = await openInClaude(prompt);

    if (result.status === 'failed') {
      toast.error('El navegador bloqueo la ventana nueva', {
        description: 'El prompt quedo copiado: abre Claude y pegalo con Ctrl+V.',
      });
      return;
    }

    if (result.status === 'prefilled') {
      toast.success('Claude abierto con el prompt precargado', {
        description: 'Revisa el mensaje y envialo. Tambien quedo copiado por si acaso.',
      });
      return;
    }

    toast.info('Claude abierto en una conversacion nueva', {
      description: 'El prompt es largo para la URL, asi que quedo copiado: pegalo con Ctrl+V.',
    });
  }

  return (
    <section className="rounded-lg border border-border bg-card">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 p-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold">{title}</h3>
            {badge}
          </div>
          {subtitle ? <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p> : null}
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[0.68rem] text-muted-foreground">
            <span>{stats.chars.toLocaleString('es-CO')} caracteres</span>
            <span aria-hidden>|</span>
            <span>{stats.words.toLocaleString('es-CO')} palabras</span>
            <span aria-hidden>|</span>
            <span>~{stats.tokens.toLocaleString('es-CO')} tokens</span>
            <span aria-hidden>|</span>
            <span>{stats.lines} lineas</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={copied ? 'success' : 'default'} onClick={handleCopy}>
            {copied ? <Check /> : <Copy />}
            {copied ? 'Copiado' : 'Copiar Prompt Maestro'}
          </Button>
          {showExecute ? (
            <Button size="sm" variant="outline" onClick={handleExecute}>
              <ExternalLink />
              Ejecutar en Claude
            </Button>
          ) : null}
          <Button size="sm" variant="ghost" onClick={handleDownload} title="Descargar como .md">
            <Download />
            <span className="sr-only sm:not-sr-only">Descargar</span>
          </Button>
        </div>
      </header>

      <div className="relative">
        <pre
          className={cn(
            'prompt-surface scrollbar-thin overflow-auto p-4 text-foreground/85',
            !expanded && 'max-h-[var(--collapsed)]',
          )}
          style={{ '--collapsed': `${collapsedHeight}px` } as React.CSSProperties}
          tabIndex={0}
          aria-label={`Contenido de ${title}`}
        >
          <code className="block">
            {lines.map((line, lineIndex) => (
              <span key={lineIndex} className={cn('block whitespace-pre-wrap', LINE_CLASS[line.kind])}>
                {line.raw.length === 0
                  ? ' '
                  : line.tokens.map((token, tokenIndex) => (
                      <span key={tokenIndex} className={INLINE_CLASS[token.kind]}>
                        {token.text}
                      </span>
                    ))}
              </span>
            ))}
          </code>
        </pre>

        {!expanded ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 rounded-b-lg bg-gradient-to-t from-card to-transparent"
          />
        ) : null}
      </div>

      <footer className="flex items-center justify-between gap-3 border-t border-border/60 px-4 py-2">
        <Badge variant="outline" className="font-mono text-[0.65rem]">
          compilado localmente | sin API
        </Badge>
        <Button size="sm" variant="ghost" onClick={() => setExpanded((prev) => !prev)}>
          {expanded ? <ChevronsDownUp /> : <ChevronsUpDown />}
          {expanded ? 'Colapsar' : 'Ver completo'}
        </Button>
      </footer>
    </section>
  );
}
