'use client';

import * as React from 'react';
import { CircleStop, Loader2, TriangleAlert, UserRound, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { guionDesdeBrief, insertarPresentador } from '@/lib/preview';
import type { EventoTavus, Replica } from '@/lib/tavus';
import type { Brief, PastedCode } from '@/lib/types';

interface EstadoModulo {
  activo: boolean;
  replicaPorDefecto: string;
  replicas?: Replica[];
  error?: string;
}

interface PresenterGeneratorProps {
  brief: Brief;
  code: PastedCode;
  onChange: (code: PastedCode) => void;
  projectName: string;
  onInserted: () => void;
}

export function PresenterGenerator({
  brief,
  code,
  onChange,
  projectName,
  onInserted,
}: PresenterGeneratorProps) {
  const [estado, setEstado] = React.useState<EstadoModulo>({ activo: false, replicaPorDefecto: '' });
  const [guion, setGuion] = React.useState('');
  const [replicaId, setReplicaId] = React.useState('');
  const [generando, setGenerando] = React.useState(false);
  const [progreso, setProgreso] = React.useState('');
  const [video, setVideo] = React.useState<string | null>(null);
  const [error, setError] = React.useState<{ mensaje: string; detalle?: string } | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);

  /** Carga el estado del modulo y las personas digitales disponibles. */
  React.useEffect(() => {
    let activo = true;
    void fetch('/api/assets/presentador?replicas=1')
      .then((respuesta) => (respuesta.ok ? respuesta.json() : null))
      .then((datos: EstadoModulo | null) => {
        if (!activo || !datos) return;
        setEstado(datos);
        const primera = datos.replicaPorDefecto || datos.replicas?.[0]?.id || '';
        setReplicaId((actual) => actual || primera);
      })
      .catch(() => undefined);
    return () => {
      activo = false;
      abortRef.current?.abort();
    };
  }, []);

  /**
   * El guion sale del brief, no de la landing: asi puedes grabar el video
   * mientras Claude escribe la pagina, en vez de esperar a que termine.
   */
  React.useEffect(() => {
    if (guion.trim()) return;
    const propuesto = guionDesdeBrief(brief);
    if (propuesto) setGuion(propuesto);
  }, [brief, guion]);

  /** Solo hace falta la landing para INSERTARLO, no para grabarlo. */
  const sinLanding = !code.html.trim();

  async function generar() {
    if (generando || !guion.trim() || !replicaId) return;

    const controlador = new AbortController();
    abortRef.current = controlador;
    setGenerando(true);
    setError(null);
    setVideo(null);
    setProgreso('Enviando el guion a Tavus...');

    try {
      const respuesta = await fetch('/api/assets/presentador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guion, replicaId, nombre: projectName.slice(0, 120) }),
        signal: controlador.signal,
      });

      if (!respuesta.ok || !respuesta.body) {
        const payload = (await respuesta.json().catch(() => null)) as
          | { error?: string; detail?: string }
          | null;
        setError({ mensaje: payload?.error ?? 'No se pudo iniciar.', detalle: payload?.detail });
        return;
      }

      const lector = respuesta.body.getReader();
      const decodificador = new TextDecoder();
      let resto = '';

      for (;;) {
        const { done, value } = await lector.read();
        if (done) break;

        resto += decodificador.decode(value, { stream: true });
        const lineas = resto.split('\n');
        resto = lineas.pop() ?? '';

        for (const linea of lineas) {
          if (!linea.trim()) continue;
          let evento: EventoTavus;
          try {
            evento = JSON.parse(linea) as EventoTavus;
          } catch {
            continue;
          }

          if (evento.tipo === 'inicio') {
            setProgreso('Tavus esta grabando al presentador...');
          } else if (evento.tipo === 'progreso') {
            setProgreso(`${evento.estado} (${evento.segundos}s)`);
          } else if (evento.tipo === 'error') {
            setError({ mensaje: evento.mensaje, detalle: evento.detalle });
          } else if (evento.tipo === 'listo') {
            setVideo(evento.url);
            setProgreso('');
            toast.success('Video de presentador listo', {
              description: `${evento.segundos}s de espera`,
            });
          }
        }
      }
    } catch (causa) {
      if (!controlador.signal.aborted) {
        setError({
          mensaje: 'Se corto la conexion con el servidor.',
          detalle: causa instanceof Error ? causa.message : undefined,
        });
      }
    } finally {
      setGenerando(false);
      setProgreso('');
      abortRef.current = null;
    }
  }

  function insertar() {
    if (!video) return;
    const { html, cambiado } = insertarPresentador(code.html, video);
    if (!cambiado) {
      toast.error('No se encontro donde colocarlo', {
        description: 'La landing necesita al menos una seccion despues del hero.',
      });
      return;
    }
    onChange({ ...code, html });
    onInserted();
    toast.success('Presentador insertado tras el hero');
  }

  if (!estado.activo) return null;

  const replicas = estado.replicas ?? [];

  return (
    <div className="rounded-lg border border-border bg-muted/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <UserRound className="h-4 w-4 text-primary" />
            Video de presentador con Tavus
            <Badge variant="outline" className="font-mono text-[0.62rem]">
              {replicas.length || 0} personas
            </Badge>
          </p>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground">
            Una persona digital explica tu oferta a camara. Ojo: Tavus{' '}
            <span className="font-medium text-foreground">no crea escenas ni anima fotos</span>, solo
            graba a alguien hablando. Consume minutos de tu cuenta.
          </p>
        </div>
        <div className="flex gap-2">
          {generando ? (
            <Button size="sm" variant="outline" onClick={() => abortRef.current?.abort()}>
              <CircleStop />
              Detener
            </Button>
          ) : null}
          <Button size="sm" onClick={generar} disabled={generando || !guion.trim() || !replicaId}>
            {generando ? <Loader2 className="animate-spin" /> : <UserRound />}
            {generando ? 'Grabando...' : 'Grabar presentador'}
          </Button>
        </div>
      </div>

      {false ? null : (
        <div className="mt-3 space-y-3">
          {replicas.length > 0 ? (
            <div className="space-y-1.5">
              <Label htmlFor="replica" className="text-xs">
                Persona digital
              </Label>
              <select
                id="replica"
                value={replicaId}
                onChange={(evento) => setReplicaId(evento.target.value)}
                disabled={generando}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {replicas.map((replica) => (
                  <option key={replica.id} value={replica.id}>
                    {replica.nombre} ({replica.estado})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <Alert variant="warning">
              <TriangleAlert />
              <AlertTitle>No hay ninguna persona digital en tu cuenta</AlertTitle>
              <AlertDescription>
                {estado.error ??
                  'Crea una replica en tavus.io, o usa una de las que ofrecen de serie, y vuelve aqui.'}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="guion" className="text-xs">
              Guion ({guion.trim().length} caracteres · unos {Math.round(guion.trim().length / 15)} s)
            </Label>
            <Textarea
              id="guion"
              value={guion}
              onChange={(evento) => setGuion(evento.target.value)}
              rows={4}
              readOnly={generando}
              placeholder="Lo que dira el presentador. Escribelo como se habla, no como se escribe."
              className="scrollbar-thin text-xs"
            />
          </div>
        </div>
      )}

      {generando ? (
        <p className="mt-2 font-mono text-[0.68rem] text-muted-foreground" aria-live="polite">
          {progreso || 'Trabajando...'}
        </p>
      ) : null}

      {error ? (
        <Alert variant="destructive" className="mt-3">
          <TriangleAlert />
          <AlertTitle>{error.mensaje}</AlertTitle>
          {error.detalle ? <AlertDescription>{error.detalle}</AlertDescription> : null}
        </Alert>
      ) : null}

      {video ? (
        <div className="mt-3 space-y-3 rounded-md border border-success/40 bg-success/5 p-3">
          <video src={video} controls playsInline className="w-full rounded border border-border" />
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={insertar} disabled={sinLanding}>
              <Wand2 />
              {sinLanding ? 'Esperando a la landing' : 'Insertar tras el hero'}
            </Button>
            <a
              href={video}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-[0.68rem] text-muted-foreground underline underline-offset-2"
            >
              abrir en pestana nueva
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
