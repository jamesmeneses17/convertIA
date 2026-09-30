'use client';

import * as React from 'react';
import {
  Check,
  ChevronsDownUp,
  ChevronsUpDown,
  Copy,
  Download,
  ExternalLink,
  Pencil,
  Undo2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
  /**
   * Si se pasa, aparece el boton "Editar" y el prompt se puede retocar a mano
   * antes de enviarlo. Lo que se copie, descargue o mande a Claude sera ya la
   * version editada.
   */
  onPromptChange?: (prompt: string) => void;
  /** true cuando el texto mostrado ya es una edicion manual. */
  editado?: boolean;
  /** Devuelve el prompt a la version original. */
  onReset?: () => void;
  /** Texto del sello inferior izquierdo. */
  nota?: string;
}

export function PromptViewer({
  prompt,
  title,
  subtitle,
  filename,
  showExecute = true,
  collapsedHeight = 460,
  badge,
  onPromptChange,
  editado = false,
  onReset,
  nota = 'compilado localmente | sin API',
}: PromptViewerProps) {
  const [copied, setCopied] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);
  const [editando, setEditando] = React.useState(false);

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
          {onPromptChange ? (
            <Button
              size="sm"
              variant={editando ? 'success' : 'outline'}
              onClick={() => setEditando((prev) => !prev)}
            >
              {editando ? <Check /> : <Pencil />}
              {editando ? 'Listo' : 'Editar'}
            </Button>
          ) : null}
          {editado && onReset ? (
            <Button size="sm" variant="ghost" onClick={onReset} title="Volver al prompt original">
              <Undo2 />
              Descartar cambios
            </Button>
          ) : null}
          <Button size="sm" variant="ghost" onClick={handleDownload} title="Descargar como .md">
            <Download />
            <span className="sr-only sm:not-sr-only">Descargar</span>
          </Button>
        </div>
      </header>

      <div className="relative">
        {editando && onPromptChange ? (
          <div className="space-y-2 p-4">
            <Textarea
              value={prompt}
              onChange={(event) => onPromptChange(event.target.value)}
              spellCheck={false}
              aria-label={`Editar ${title}`}
              className="scrollbar-thin min-h-[420px] font-mono text-xs leading-relaxed"
              style={{ height: `${collapsedHeight}px` }}
            />
            <p className="text-[0.68rem] leading-relaxed text-muted-foreground">
              Cambia lo que quieras: secciones, paleta, tono, lo que sea. Lo que copies, descargues o
              mandes a Claude sera esta version. Pulsa{' '}
              <span className="font-medium text-foreground">Listo</span> para volver a la vista con
              colores.
            </p>
          </div>
        ) : (
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
        )}

        {!expanded && !editando ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 rounded-b-lg bg-gradient-to-t from-card to-transparent"
          />
        ) : null}
      </div>

      <footer className="flex items-center justify-between gap-3 border-t border-border/60 px-4 py-2">
        <Badge variant={editado ? 'secondary' : 'outline'} className="font-mono text-[0.65rem]">
          {editado ? 'editado a mano' : nota}
        </Badge>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setExpanded((prev) => !prev)}
          disabled={editando}
        >
          {expanded ? <ChevronsDownUp /> : <ChevronsUpDown />}
          {expanded ? 'Colapsar' : 'Ver completo'}
        </Button>
      </footer>
    </section>
  );
}
