'use client';

import * as React from 'react';
import {
  ClipboardPaste,
  CircleStop,
  Download,
  Eraser,
  Loader2,
  Monitor,
  RefreshCw,
  Smartphone,
  Sparkles,
  SquareArrowOutUpRight,
  Tablet,
  Wand2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DesktopBridge } from '@/components/wizard/desktop-bridge';
import { VideoGenerator } from '@/components/wizard/video-generator';
import { PresenterGenerator } from '@/components/wizard/presenter-generator';
import { Textarea } from '@/components/ui/textarea';
import { codeStats, composePreviewDocument, isCodeEmpty, splitAiResponse } from '@/lib/preview';
import {
  GenerationError,
  fetchGenerationStatus,
  streamGeneration,
  type GenerationStatus,
} from '@/lib/generate-client';
import type { Brief, PastedCode } from '@/lib/types';
import { cn, downloadTextFile, slugify } from '@/lib/utils';

type Viewport = 'mobile' | 'tablet' | 'desktop';

const VIEWPORTS: Record<Viewport, { label: string; width: string; icon: typeof Monitor }> = {
  mobile: { label: '375px', width: '375px', icon: Smartphone },
  tablet: { label: '768px', width: '768px', icon: Tablet },
  desktop: { label: '100%', width: '100%', icon: Monitor },
};

interface CodePreviewProps {
  code: PastedCode;
  onChange: (code: PastedCode) => void;
  /** Nombre base para el archivo descargado. */
  projectName: string;
  /** Prompt que se envia si esta activo el modo de generacion integrada. */
  prompt: string;
  brief: Brief;
}

export function CodePreview({ code, onChange, projectName, prompt, brief }: CodePreviewProps) {
  const [aiResponse, setAiResponse] = React.useState('');
  const [viewport, setViewport] = React.useState<Viewport>('desktop');
  const [reloadKey, setReloadKey] = React.useState(0);

  /**
   * Sube cada vez que se pide una landing. El generador de presentador lo
   * escucha para empezar a grabar el video EN PARALELO, en vez de esperar a que
   * la pagina este lista.
   */
  const [pedidoLanding, setPedidoLanding] = React.useState(0);

  // --- Modo de generacion integrada (solo si el servidor tiene API key) ---
  const [status, setStatus] = React.useState<GenerationStatus>({ enabled: false, model: null });
  const [generating, setGenerating] = React.useState(false);
  const abortRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    let active = true;
    void fetchGenerationStatus().then((next) => {
      if (active) setStatus(next);
    });
    return () => {
      active = false;
      abortRef.current?.abort();
    };
  }, []);

  async function handleGenerate() {
    if (generating) return;

    const controller = new AbortController();
    abortRef.current = controller;
    setGenerating(true);
    setAiResponse('');
    setPedidoLanding((n) => n + 1);

    const toastId = toast.loading('Generando la landing...', {
      description: `Claude esta escribiendo el codigo (${status.model ?? 'modelo por defecto'}).`,
    });

    try {
      const result = await streamGeneration(prompt, {
        signal: controller.signal,
        onDelta: (fullText) => setAiResponse(fullText),
      });

      const parsed = splitAiResponse(result.text);
      if (isCodeEmpty(parsed)) {
        toast.error('La respuesta no traia codigo utilizable', {
          id: toastId,
          description: 'Revisa el cuadro de texto: la respuesta quedo ahi para que la ajustes.',
        });
        return;
      }

      onChange(parsed);
      setReloadKey((key) => key + 1);
      toast.success('Landing generada y previsualizada', {
        id: toastId,
        description: `${result.outputTokens.toLocaleString('es-CO')} tokens de salida | ${result.model || status.model}`,
      });
    } catch (error) {
      if (controller.signal.aborted) {
        toast.info('Generacion detenida', {
          id: toastId,
          description: 'Lo que llego se queda en el cuadro de texto.',
        });
        return;
      }
      toast.error(error instanceof GenerationError ? error.message : 'Fallo la generacion', {
        id: toastId,
        description: error instanceof GenerationError ? error.detail : undefined,
      });
    } finally {
      setGenerating(false);
      abortRef.current = null;
    }
  }

  /**
   * El documento se recalcula 400 ms despues de la ultima tecla. Editar el HTML
   * actualiza la vista sola, sin pulsar nada y sin gastar tokens, pero sin
   * rehacer el iframe en cada pulsacion.
   */
  const [codigoEstable, setCodigoEstable] = React.useState(code);

  React.useEffect(() => {
    const espera = window.setTimeout(() => setCodigoEstable(code), 400);
    return () => window.clearTimeout(espera);
  }, [code]);

  const previewDoc = React.useMemo(() => composePreviewDocument(codigoEstable), [codigoEstable]);
  const empty = isCodeEmpty(code);
  const stats = React.useMemo(() => codeStats(code), [code]);

  function handleSplit() {
    const parsed = splitAiResponse(aiResponse);
    if (isCodeEmpty(parsed)) {
      toast.error('No se encontro codigo', {
        description: 'Pega la respuesta de la IA incluyendo los bloques de codigo.',
      });
      return;
    }
    onChange(parsed);
    setReloadKey((key) => key + 1);
    const parts = [
      parsed.html ? 'HTML' : null,
      parsed.css ? 'CSS' : null,
      parsed.js ? 'JS' : null,
    ].filter(Boolean);
    toast.success('Codigo separado y previsualizado', { description: `Detectado: ${parts.join(' + ')}` });
  }

  function handleDownload() {
    if (!previewDoc) return;
    downloadTextFile(`${slugify(projectName) || 'landing'}.html`, previewDoc, 'text/html');
    toast.success('index.html descargado');
  }

  function handleOpenInTab() {
    if (!previewDoc) return;
    const blob = new Blob([previewDoc], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank', 'noopener,noreferrer');
    if (!win) {
      toast.error('El navegador bloqueo la ventana nueva');
    }
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  function handleClear() {
    onChange({ html: '', css: '', js: '' });
    setAiResponse('');
    setReloadKey((key) => key + 1);
  }

  const editors: { key: keyof PastedCode; label: string; placeholder: string }[] = [
    { key: 'html', label: 'HTML', placeholder: '<!DOCTYPE html> ... o solo el fragmento del body' },
    { key: 'css', label: 'CSS', placeholder: ':root { --color-base: #0b0b0b; } ...' },
    { key: 'js', label: 'JS', placeholder: "document.querySelector('form').addEventListener(...)" },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="stage-index">Visor de codigo integrado</span>
            <CardTitle className="mt-1 text-lg">Previsualiza lo que devolvio la IA</CardTitle>
            <CardDescription className="mt-1.5 max-w-2xl">
              Pega la respuesta completa (con sus bloques de codigo) y ConvertIA separa HTML, CSS y JS,
              ensambla el documento y lo renderiza aqui mismo.
            </CardDescription>
          </div>
          {!empty ? (
            <Badge variant="success" className="font-mono text-[0.65rem]">
              {stats.lines} lineas | {stats.weightKb} KB
            </Badge>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <Tabs defaultValue="paste">
          <TabsList>
            <TabsTrigger value="paste">
              <ClipboardPaste className="h-3.5 w-3.5" />
              Respuesta de la IA
            </TabsTrigger>
            {editors.map((editor) => (
              <TabsTrigger key={editor.key} value={editor.key}>
                {editor.label}
                {code[editor.key].trim() ? (
                  <span aria-hidden className="ml-1 h-1.5 w-1.5 rounded-full bg-success" />
                ) : null}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="paste" className="space-y-3">
            <DesktopBridge
              prompt={prompt}
              projectName={projectName}
              onEncargoCreado={() => setPedidoLanding((n) => n + 1)}
              onDelivered={(delivered, handoffCode, notes) => {
                onChange(delivered);
                setReloadKey((key) => key + 1);
                toast.success(`Landing recibida de Claude Escritorio (${handoffCode})`, {
                  description: notes ?? 'Ya esta renderizada en el visor.',
                });
              }}
            />

            {status.enabled ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/40 bg-primary/[0.05] px-4 py-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Generar aqui mismo
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Envia el Prompt Maestro a Claude sin salir de ConvertIA. Consume creditos de tu API key.
                  </p>
                </div>
                <div className="flex gap-2">
                  {generating ? (
                    <Button size="sm" variant="outline" onClick={() => abortRef.current?.abort()}>
                      <CircleStop />
                      Detener
                    </Button>
                  ) : null}
                  <Button size="sm" onClick={handleGenerate} disabled={generating || !prompt.trim()}>
                    {generating ? <Loader2 className="animate-spin" /> : <Sparkles />}
                    {generating ? 'Generando...' : 'Generar landing'}
                  </Button>
                </div>
              </div>
            ) : null}

            <VideoGenerator
              code={code}
              onChange={onChange}
              projectName={projectName}
              onInserted={() => setReloadKey((key) => key + 1)}
            />

            <PresenterGenerator
              brief={brief}
              code={code}
              onChange={onChange}
              projectName={projectName}
              arrancarEn={pedidoLanding}
              onInserted={() => setReloadKey((key) => key + 1)}
            />

            <Textarea
              value={aiResponse}
              onChange={(event) => setAiResponse(event.target.value)}
              rows={8}
              spellCheck={false}
              readOnly={generating}
              placeholder={'Pega aqui la respuesta completa de Claude / ChatGPT / Gemini, con sus bloques de codigo.'}
              className="scrollbar-thin font-mono text-xs"
            />

            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" onClick={handleSplit} disabled={!aiResponse.trim() || generating}>
                <Wand2 />
                Separar y previsualizar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setAiResponse('')}
                disabled={!aiResponse || generating}
              >
                <Eraser />
                Limpiar cuadro
              </Button>
              {generating ? (
                <span className="font-mono text-[0.68rem] text-muted-foreground" aria-live="polite">
                  {aiResponse.length.toLocaleString('es-CO')} caracteres recibidos
                </span>
              ) : null}
            </div>
          </TabsContent>

          {editors.map((editor) => (
            <TabsContent key={editor.key} value={editor.key} className="space-y-2">
              {editor.key !== 'html' && !code[editor.key].trim() && code.html.trim() ? (
                <p className="rounded-md border border-dashed border-border bg-muted/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                  Esta pestana esta vacia porque la landing es un{' '}
                  <span className="font-medium text-foreground">archivo unico</span>: el{' '}
                  {editor.label} va dentro del HTML, en su etiqueta{' '}
                  <code className="rounded bg-muted px-1 py-0.5 font-mono">
                    {editor.key === 'css' ? '<style>' : '<script>'}
                  </code>
                  . Editalo desde la pestana HTML. Lo que escribas aqui se anadira aparte.
                </p>
              ) : null}
              <Textarea
                value={code[editor.key]}
                onChange={(event) => onChange({ ...code, [editor.key]: event.target.value })}
                rows={10}
                spellCheck={false}
                placeholder={editor.placeholder}
                aria-label={`Editor de ${editor.label}`}
                className="scrollbar-thin font-mono text-xs"
              />
            </TabsContent>
          ))}
        </Tabs>

        {/* ---------- Barra del visor ---------- */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-t-lg border border-border bg-muted/50 px-3 py-2">
          <div className="flex items-center gap-1">
            {(Object.keys(VIEWPORTS) as Viewport[]).map((key) => {
              const item = VIEWPORTS[key];
              const Icon = item.icon;
              return (
                <Button
                  key={key}
                  size="sm"
                  variant={viewport === key ? 'secondary' : 'ghost'}
                  onClick={() => setViewport(key)}
                  aria-pressed={viewport === key}
                  title={`Ancho ${item.label}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="font-mono text-[0.68rem]">{item.label}</span>
                </Button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setReloadKey((key) => key + 1)}
              disabled={empty}
              title="Recargar la previsualizacion"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleOpenInTab} disabled={empty} title="Abrir en pestana nueva">
              <SquareArrowOutUpRight className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDownload} disabled={empty} title="Descargar index.html">
              <Download className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleClear} disabled={empty} title="Vaciar el visor">
              <Eraser className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* ---------- Iframe ---------- */}
        <div className="-mt-5 overflow-hidden rounded-b-lg border border-t-0 border-border bg-[hsl(var(--muted))] p-3">
          {empty ? (
            <div className="grid h-[420px] place-items-center rounded-md border border-dashed border-border bg-background/40 text-center">
              <div className="max-w-sm px-6">
                <p className="text-sm font-medium">Todavia no hay nada que previsualizar</p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  Copia el Prompt Maestro, ejecutalo en tu IA y pega la respuesta arriba. El visor ensambla el
                  documento y lo renderiza sin salir de ConvertIA.
                </p>
              </div>
            </div>
          ) : (
            <div className="mx-auto transition-[width] duration-300" style={{ width: VIEWPORTS[viewport].width }}>
              <iframe
                key={reloadKey}
                title="Previsualizacion de la landing generada"
                srcDoc={previewDoc}
                sandbox="allow-scripts allow-forms allow-popups allow-modals"
                referrerPolicy="no-referrer"
                className={cn(
                  'h-[560px] w-full rounded-md border border-border bg-white',
                  'shadow-sm',
                )}
              />
            </div>
          )}
        </div>

        <p className="text-[0.7rem] leading-relaxed text-muted-foreground">
          La previsualizacion corre aislada en un iframe con sandbox: el codigo pegado no puede acceder a
          ConvertIA ni a tus datos.
        </p>
      </CardContent>
    </Card>
  );
}
