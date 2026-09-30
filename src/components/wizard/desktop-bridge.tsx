'use client';

import * as React from 'react';
import { Check, Copy, Loader2, MonitorSmartphone, TriangleAlert, X } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BridgeError,
  cancelHandoff,
  createHandoff,
  fetchBridgeMode,
  fetchHandoff,
  listPendingHandoffs,
  type BridgeMode,
} from '@/lib/bridge-client';
import type { PastedCode } from '@/lib/types';
import { copyToClipboard } from '@/lib/utils';

const POLL_MS = 3000;
/** El buzon deja de consultarse tras 20 minutos sin respuesta. */
const MAX_WAIT_MS = 20 * 60 * 1000;

/** Convierte segundos en algo legible: 45 s, 3 min 20 s, 1 h 04 min. */
function duracion(segundos: number): string {
  if (segundos < 60) return `${segundos} s`;
  const minutos = Math.floor(segundos / 60);
  const resto = segundos % 60;
  if (minutos < 60) return `${minutos} min ${String(resto).padStart(2, '0')} s`;
  const horas = Math.floor(minutos / 60);
  return `${horas} h ${String(minutos % 60).padStart(2, '0')} min`;
}

interface DesktopBridgeProps {
  prompt: string;
  projectName: string;
  onDelivered: (code: PastedCode, handoffCode: string, notes: string | null) => void;
}

export function DesktopBridge({ prompt, projectName, onDelivered }: DesktopBridgeProps) {
  const [code, setCode] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [waiting, setWaiting] = React.useState(false);
  const [error, setError] = React.useState<BridgeError | null>(null);
  const [copied, setCopied] = React.useState(false);

  const [modo, setModo] = React.useState<BridgeMode | null>(null);

  /** Momento en que se dejo el encargo, para cronometrar la espera. */
  const [iniciadoEn, setIniciadoEn] = React.useState<number | null>(null);
  const [transcurrido, setTranscurrido] = React.useState(0);
  /** Cuanto tardo en llegar la ultima landing, una vez entregada. */
  const [tardanza, setTardanza] = React.useState<number | null>(null);

  const deliveredRef = React.useRef(false);

  /**
   * Instruccion fija. Cambia segun el puente disponible:
   * por carpeta compartida (lo que admite cualquier version de Claude Escritorio)
   * o por servidor MCP, donde la herramienta ya sabe cual es el encargo pendiente.
   */
  const instruction = 'Genera la landing pendiente de ConvertIA y entregala.';

  /** Alternativa por carpeta, para quien no tenga el conector MCP puesto. */
  const instruccionCarpeta = modo?.carpeta
    ? `Lee el encargo pendiente de esta carpeta y escribe la landing completa en ${modo.archivoEntrega}.`
    : null;

  /** Averigua que puente ofrece el servidor. */
  React.useEffect(() => {
    let active = true;
    void fetchBridgeMode().then((next) => {
      if (active) setModo(next);
    });
    return () => {
      active = false;
    };
  }, []);

  /**
   * Si al abrir la pantalla ya habia un encargo pendiente (por ejemplo porque
   * recargaste el navegador mientras esperabas), lo retoma en lugar de perderlo.
   */
  React.useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const pendientes = await listPendingHandoffs();
        if (!active || pendientes.length === 0) return;
        const pendiente = pendientes[0];
        if (!pendiente) return;
        setCode(pendiente.code);
        setIniciadoEn(new Date(pendiente.createdAt).getTime());
        setWaiting(true);
      } catch {
        /* sin base de datos no hay buzon que recuperar */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  /** Reloj de la espera: avanza cada segundo mientras el encargo siga pendiente. */
  React.useEffect(() => {
    if (!waiting || iniciadoEn === null) return;

    setTranscurrido(Math.floor((Date.now() - iniciadoEn) / 1000));
    const reloj = window.setInterval(() => {
      setTranscurrido(Math.floor((Date.now() - iniciadoEn) / 1000));
    }, 1000);

    return () => window.clearInterval(reloj);
  }, [waiting, iniciadoEn]);

  /** Sondea el buzon hasta que Claude Escritorio entregue la landing. */
  React.useEffect(() => {
    if (!code || !waiting) return;

    let cancelled = false;
    const startedAt = Date.now();

    const timer = window.setInterval(async () => {
      if (cancelled) return;

      if (Date.now() - startedAt > MAX_WAIT_MS) {
        window.clearInterval(timer);
        setWaiting(false);
        toast.info('Dejo de esperar al encargo', {
          description: `Sigue activo: el codigo ${code} seguira valido en Claude Escritorio.`,
        });
        return;
      }

      try {
        const handoff = await fetchHandoff(code);
        if (cancelled || handoff.status !== 'entregado' || deliveredRef.current) return;

        deliveredRef.current = true;
        window.clearInterval(timer);
        setWaiting(false);
        setTardanza(iniciadoEn ? Math.floor((Date.now() - iniciadoEn) / 1000) : null);
        onDelivered(
          { html: handoff.html, css: handoff.css, js: handoff.js },
          handoff.code,
          handoff.notes,
        );
      } catch {
        /* fallo puntual de red: se reintenta en el siguiente ciclo */
      }
    }, POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [code, waiting, onDelivered, iniciadoEn]);

  async function handleCreate() {
    setCreating(true);
    setError(null);
    deliveredRef.current = false;

    try {
      const handoff = await createHandoff(projectName || 'Landing sin titulo', prompt);
      setCode(handoff.code);
      setIniciadoEn(Date.now());
      setTranscurrido(0);
      setTardanza(null);
      setWaiting(true);

      const ok = await copyToClipboard(instruction);
      toast.success(`Encargo ${handoff.code} en el buzon`, {
        description: ok
          ? 'La frase quedo copiada: pegala en Claude Escritorio.'
          : 'Dile a Claude Escritorio que genere la landing pendiente de ConvertIA.',
      });
    } catch (cause) {
      const bridgeError =
        cause instanceof BridgeError ? cause : new BridgeError('No se pudo crear el encargo.');
      setError(bridgeError);
    } finally {
      setCreating(false);
    }
  }

  async function handleCancel() {
    if (!code) return;
    try {
      await cancelHandoff(code);
    } catch {
      /* da igual: dejamos de escuchar de todos modos */
    }
    setWaiting(false);
    setCode(null);
    toast.info('Encargo cancelado');
  }

  async function handleCopyInstruction() {
    const ok = await copyToClipboard(instruction);
    if (!ok) {
      toast.error('No se pudo copiar');
      return;
    }
    setCopied(true);
    toast.success('Instruccion copiada');
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-lg border border-border bg-muted/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <MonitorSmartphone className="h-4 w-4 text-primary" />
            Puente con Claude Escritorio
            <Badge variant="outline" className="font-mono text-[0.62rem]">
              sin coste por uso
            </Badge>
          </p>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground">
            Deja el Prompt Maestro en el buzon y pideselo a Claude Escritorio. Lo genera con tu suscripcion y
            lo devuelve aqui solo: la landing aparece en el visor sin que copies el codigo.
          </p>
        </div>

        {!code ? (
          <Button size="sm" onClick={handleCreate} disabled={creating || !prompt.trim()}>
            {creating ? <Loader2 className="animate-spin" /> : <MonitorSmartphone />}
            {creating ? 'Creando...' : 'Enviar a Claude Escritorio'}
          </Button>
        ) : null}
      </div>

      {error ? (
        <Alert variant={error.dbUnavailable ? 'warning' : 'destructive'} className="mt-3">
          <TriangleAlert />
          <AlertTitle>{error.message}</AlertTitle>
          <AlertDescription>
            {error.detail ?? 'El puente necesita PostgreSQL levantado para guardar el encargo.'}
          </AlertDescription>
        </Alert>
      ) : null}

      {code ? (
        <div className="mt-4 space-y-3 rounded-md border border-primary/40 bg-background/60 p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-lg font-semibold tracking-[0.12em] text-primary">{code}</span>
              {waiting ? (
                <span className="flex items-center gap-2 text-xs text-muted-foreground" aria-live="polite">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Esperando a Claude Escritorio
                  <span className="font-mono tabular-nums text-foreground">{duracion(transcurrido)}</span>
                </span>
              ) : tardanza !== null ? (
                <span className="flex items-center gap-2 text-xs font-medium text-success">
                  <Check className="h-3.5 w-3.5" />
                  Entregada en {duracion(tardanza)}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">Encargo cerrado</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleCopyInstruction}>
                {copied ? <Check /> : <Copy />}
                Copiar instruccion
              </Button>
              {waiting ? (
                <Button size="sm" variant="ghost" onClick={handleCancel}>
                  <X />
                  Cancelar
                </Button>
              ) : null}
            </div>
          </div>

          <ol className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">1.</span> Abre Claude Escritorio y dile esta
              frase (siempre la misma):
              <span className="mt-1 block rounded bg-muted px-2 py-1.5 font-mono text-[0.68rem] text-foreground/85">
                {instruction}
              </span>
              <span className="mt-1 block text-[0.68rem]">
                Necesita el conector <code className="rounded bg-muted px-1 py-0.5 font-mono">convertia</code>{' '}
                instalado. La herramienta coge sola el encargo pendiente.
              </span>
            </li>
            <li>
              <span className="font-medium text-foreground">2.</span> No cierres esta pantalla: en cuanto
              Claude entregue, la landing aparece abajo renderizada.
            </li>
            {instruccionCarpeta ? (
              <li className="border-t border-border/60 pt-2">
                <span className="font-medium text-foreground">Sin conector:</span> tambien vale por carpeta.
                Conectala en Claude con <span className="font-medium">Agregar carpeta</span>:
                <span className="mt-1 block rounded bg-muted px-2 py-1.5 font-mono text-[0.68rem] text-foreground/85">
                  {modo?.rutaCarpeta}
                </span>
                <span className="mt-1 block rounded bg-muted px-2 py-1.5 font-mono text-[0.68rem] text-foreground/85">
                  {instruccionCarpeta}
                </span>
              </li>
            ) : null}
          </ol>

          <p className="rounded-md bg-muted px-2 py-1.5 text-[0.68rem] leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Atajo sin escribir nada:</span> en Claude Escritorio
            ve a <span className="font-medium">Rutinas</span>, abre{' '}
            <span className="font-medium">ConvertIA · generar landing (a mano)</span> y pulsa{' '}
            <span className="font-medium">Ejecutar ahora</span>. Va al buzon en ese momento y genera lo que
            encuentre. No revisa sola, asi que no consume nada mientras no lo pulses.
          </p>
        </div>
      ) : null}
    </div>
  );
}
