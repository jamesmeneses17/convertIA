'use client';

import * as React from 'react';
import { BrainCircuit, Check, Copy, Loader2, TriangleAlert, X } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BridgeError,
  cancelHandoff,
  createPromptHandoff,
  fetchHandoff,
  listPendingHandoffs,
} from '@/lib/bridge-client';
import { buildMetaPrompt } from '@/lib/meta-prompt';
import type { Brief, TechniqueSlug } from '@/lib/types';
import { copyToClipboard } from '@/lib/utils';

const POLL_MS = 3000;
const MAX_ESPERA_MS = 20 * 60 * 1000;

/** Segundos en formato legible. */
function duracion(segundos: number): string {
  if (segundos < 60) return `${segundos} s`;
  return `${Math.floor(segundos / 60)} min ${String(segundos % 60).padStart(2, '0')} s`;
}

interface PromptGeneratorProps {
  brief: Brief;
  techniques: TechniqueSlug[];
  projectName: string;
  /** Se llama cuando la IA devuelve el Prompt Maestro redactado. */
  onPromptListo: (prompt: string, notas: string | null) => void;
}

export function PromptGenerator({
  brief,
  techniques,
  projectName,
  onPromptListo,
}: PromptGeneratorProps) {
  const [code, setCode] = React.useState<string | null>(null);
  const [creando, setCreando] = React.useState(false);
  const [esperando, setEsperando] = React.useState(false);
  const [transcurrido, setTranscurrido] = React.useState(0);
  const [error, setError] = React.useState<BridgeError | null>(null);
  const [copiado, setCopiado] = React.useState(false);

  const iniciadoRef = React.useRef<number | null>(null);
  const entregadoRef = React.useRef(false);

  const instruccion = 'Genera el prompt pendiente de ConvertIA y entregalo.';

  /**
   * Si al montar ya habia un encargo de prompt pendiente (porque te fuiste al
   * banco de proyectos y volviste, o recargaste), lo retoma en vez de perderlo.
   */
  React.useEffect(() => {
    let activo = true;
    void (async () => {
      try {
        const pendientes = await listPendingHandoffs('prompt');
        const pendiente = pendientes[0];
        if (!activo || !pendiente) return;
        setCode(pendiente.code);
        iniciadoRef.current = new Date(pendiente.createdAt).getTime();
        setEsperando(true);
      } catch {
        /* sin base de datos no hay nada que recuperar */
      }
    })();
    return () => {
      activo = false;
    };
  }, []);

  /** Reloj de la espera. */
  React.useEffect(() => {
    if (!esperando || iniciadoRef.current === null) return;
    const inicio = iniciadoRef.current;
    setTranscurrido(Math.floor((Date.now() - inicio) / 1000));
    const reloj = window.setInterval(() => {
      setTranscurrido(Math.floor((Date.now() - inicio) / 1000));
    }, 1000);
    return () => window.clearInterval(reloj);
  }, [esperando]);

  /** Sondeo hasta que la IA entregue el Prompt Maestro. */
  React.useEffect(() => {
    if (!code || !esperando) return;

    let cancelado = false;
    const arranque = Date.now();

    const timer = window.setInterval(async () => {
      if (cancelado) return;

      if (Date.now() - arranque > MAX_ESPERA_MS) {
        window.clearInterval(timer);
        setEsperando(false);
        toast.info('Dejo de esperar el prompt', {
          description: `El encargo ${code} sigue valido en Claude.`,
        });
        return;
      }

      try {
        const handoff = await fetchHandoff(code);
        if (cancelado || handoff.status !== 'entregado' || entregadoRef.current) return;
        if (!handoff.resultado.trim()) return;

        entregadoRef.current = true;
        window.clearInterval(timer);
        setEsperando(false);
        onPromptListo(handoff.resultado, handoff.notes);
      } catch {
        /* fallo puntual: se reintenta en el siguiente ciclo */
      }
    }, POLL_MS);

    return () => {
      cancelado = true;
      window.clearInterval(timer);
    };
  }, [code, esperando, onPromptListo]);

  async function pedirPrompt() {
    setCreando(true);
    setError(null);
    entregadoRef.current = false;

    try {
      const meta = buildMetaPrompt(brief, techniques, { projectName });
      const handoff = await createPromptHandoff(
        `Prompt para: ${projectName || 'proyecto sin titulo'}`.slice(0, 120),
        meta,
      );

      setCode(handoff.code);
      iniciadoRef.current = Date.now();
      setTranscurrido(0);
      setEsperando(true);

      const ok = await copyToClipboard(instruccion);
      toast.success(`Encargo ${handoff.code} en el buzon`, {
        description: ok
          ? 'La frase quedo copiada: pegala en Claude Escritorio.'
          : 'Dile a Claude que genere el prompt pendiente de ConvertIA.',
      });
    } catch (causa) {
      setError(
        causa instanceof BridgeError ? causa : new BridgeError('No se pudo crear el encargo.'),
      );
    } finally {
      setCreando(false);
    }
  }

  async function cancelar() {
    if (!code) return;
    try {
      await cancelHandoff(code);
    } catch {
      /* da igual: dejamos de escuchar igualmente */
    }
    setEsperando(false);
    setCode(null);
    toast.info('Encargo cancelado');
  }

  async function copiarInstruccion() {
    const ok = await copyToClipboard(instruccion);
    if (!ok) {
      toast.error('No se pudo copiar');
      return;
    }
    setCopiado(true);
    toast.success('Instruccion copiada');
    window.setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="rounded-lg border border-primary/50 bg-primary/[0.05] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <BrainCircuit className="h-4 w-4 text-primary" />
            Que lo escriba la IA
            <Badge variant="outline" className="font-mono text-[0.62rem]">
              sin coste por uso
            </Badge>
          </p>
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-muted-foreground">
            En vez de rellenar la plantilla, la IA redacta un Prompt Maestro a medida: elige el
            arquetipo de composicion, la direccion tipografica y las secciones que pide{' '}
            <span className="font-medium text-foreground">esta</span> oferta. Asi dos proyectos dejan de
            parecerse.
          </p>
        </div>

        {!code ? (
          <Button size="sm" onClick={pedirPrompt} disabled={creando}>
            {creando ? <Loader2 className="animate-spin" /> : <BrainCircuit />}
            {creando ? 'Creando...' : 'Redactar con IA'}
          </Button>
        ) : null}
      </div>

      {error ? (
        <Alert variant={error.dbUnavailable ? 'warning' : 'destructive'} className="mt-3">
          <TriangleAlert />
          <AlertTitle>{error.message}</AlertTitle>
          {error.detail ? <AlertDescription>{error.detail}</AlertDescription> : null}
        </Alert>
      ) : null}

      {code ? (
        <div className="mt-4 space-y-3 rounded-md border border-primary/40 bg-background/60 p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-base font-semibold tracking-[0.12em] text-primary">
                {code}
              </span>
              {esperando ? (
                <span className="flex items-center gap-2 text-xs text-muted-foreground" aria-live="polite">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Redactando
                  <span className="font-mono tabular-nums text-foreground">{duracion(transcurrido)}</span>
                </span>
              ) : (
                <span className="flex items-center gap-2 text-xs font-medium text-success">
                  <Check className="h-3.5 w-3.5" />
                  Prompt recibido
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={copiarInstruccion}>
                {copiado ? <Check /> : <Copy />}
                Copiar instruccion
              </Button>
              {esperando ? (
                <Button size="sm" variant="ghost" onClick={cancelar}>
                  <X />
                  Cancelar
                </Button>
              ) : null}
            </div>
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">
            Dile esto a Claude Escritorio (o lanza la rutina, o el vigilante lo cogera solo):
          </p>
          <p className="rounded bg-muted px-2 py-1.5 font-mono text-[0.68rem] text-foreground/85">
            {instruccion}
          </p>
          <p className="text-[0.68rem] leading-relaxed text-muted-foreground">
            Cuando termine, el prompt aparece en la Etapa 03 y desde ahi pides la landing como siempre.
          </p>
        </div>
      ) : null}
    </div>
  );
}
