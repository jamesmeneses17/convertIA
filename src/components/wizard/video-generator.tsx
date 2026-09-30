'use client';

import * as React from 'react';
import { CircleStop, Clapperboard, Loader2, TriangleAlert, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { extraerPromptVideo, insertarVideoGenerado } from '@/lib/preview';
import type { EventoVideo } from '@/lib/gemini-video';
import type { PastedCode } from '@/lib/types';

interface EstadoModulo {
  activo: boolean;
  claves: number;
  modelo: string;
}

interface VideoGeneratorProps {
  code: PastedCode;
  onChange: (code: PastedCode) => void;
  projectName: string;
  onInserted: () => void;
}

export function VideoGenerator({ code, onChange, projectName, onInserted }: VideoGeneratorProps) {
  const [estado, setEstado] = React.useState<EstadoModulo>({ activo: false, claves: 0, modelo: '' });
  const [prompt, setPrompt] = React.useState('');
  const [generando, setGenerando] = React.useState(false);
  const [progreso, setProgreso] = React.useState('');
  const [clip, setClip] = React.useState<string | null>(null);
  const [error, setError] = React.useState<{ mensaje: string; detalle?: string } | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    let activo = true;
    void fetch('/api/assets/video')
      .then((respuesta) => (respuesta.ok ? respuesta.json() : null))
      .then((datos: EstadoModulo | null) => {
        if (activo && datos) setEstado(datos);
      })
      .catch(() => undefined);
    return () => {
      activo = false;
      abortRef.current?.abort();
    };
  }, []);

  /** Precarga el prompt que la propia landing dejo documentado. */
  React.useEffect(() => {
    if (prompt.trim()) return;
    const encontrado = extraerPromptVideo(code.html);
    if (encontrado) setPrompt(encontrado);
  }, [code.html, prompt]);

  async function generar() {
    if (generando || !prompt.trim()) return;

    const controlador = new AbortController();
    abortRef.current = controlador;
    setGenerando(true);
    setError(null);
    setClip(null);
    setProgreso('Enviando el encargo a Veo...');

    try {
      const respuesta = await fetch('/api/assets/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, nombre: projectName.slice(0, 60) }),
        signal: controlador.signal,
      });

      if (!respuesta.ok || !respuesta.body) {
        const payload = (await respuesta.json().catch(() => null)) as
          | { error?: string; detail?: string }
          | null;
        setError({
          mensaje: payload?.error ?? 'No se pudo iniciar la generacion.',
          detalle: payload?.detail,
        });
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
          let evento: EventoVideo;
          try {
            evento = JSON.parse(linea) as EventoVideo;
          } catch {
            continue;
          }

          if (evento.tipo === 'inicio') {
            setProgreso(`Generando con ${evento.modelo}...`);
          } else if (evento.tipo === 'progreso') {
            setProgreso(`${evento.mensaje} (${evento.segundos}s)`);
          } else if (evento.tipo === 'error') {
            setError({ mensaje: evento.mensaje, detalle: evento.detalle });
          } else if (evento.tipo === 'listo') {
            setClip(evento.url);
            setProgreso('');
            toast.success('Clip generado', {
              description: `${evento.segundos}s de espera · ${evento.modelo}`,
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
    if (!clip) return;
    const { html, cambiado } = insertarVideoGenerado(code.html, clip);
    if (!cambiado) {
      toast.error('La landing no tiene ninguna etiqueta de video', {
        description: 'Activa la tecnica Activos de Video y vuelve a compilar.',
      });
      return;
    }
    onChange({ ...code, html });
    onInserted();
    toast.success('Clip insertado en la landing');
  }

  if (!estado.activo) return null;

  const sinLanding = !code.html.trim();

  return (
    <div className="rounded-lg border border-border bg-muted/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Clapperboard className="h-4 w-4 text-primary" />
            Video del hero con Veo
            <Badge variant="outline" className="font-mono text-[0.62rem]">
              {estado.claves} {estado.claves === 1 ? 'clave' : 'claves'}
            </Badge>
          </p>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground">
            Genera el clip a partir del prompt que la propia landing dejo escrito. Se factura{' '}
            <span className="font-medium text-foreground">por segundo de video</span>, asi que un clip
            cuesta bastante mas que una imagen. Tarda entre 1 y 3 minutos.
          </p>
        </div>
        <div className="flex gap-2">
          {generando ? (
            <Button size="sm" variant="outline" onClick={() => abortRef.current?.abort()}>
              <CircleStop />
              Detener
            </Button>
          ) : null}
          <Button size="sm" onClick={generar} disabled={generando || sinLanding || !prompt.trim()}>
            {generando ? <Loader2 className="animate-spin" /> : <Clapperboard />}
            {generando ? 'Generando...' : 'Generar clip'}
          </Button>
        </div>
      </div>

      {sinLanding ? (
        <div className="mt-3 rounded-md border border-dashed border-border bg-background/50 p-3">
          <p className="text-xs font-medium">Primero necesitas la landing</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            El prompt del clip sale de la seccion <span className="font-mono">ACTIVOS DE VIDEO</span> que
            Claude escribe dentro de la landing. Pide la landing con el puente de arriba y este cuadro se
            rellenara solo.
          </p>
        </div>
      ) : (
        <Textarea
          value={prompt}
          onChange={(evento) => setPrompt(evento.target.value)}
          rows={4}
          readOnly={generando}
          spellCheck={false}
          aria-label="Prompt del video"
          placeholder="Prompt en ingles del clip."
          className="scrollbar-thin mt-3 font-mono text-xs"
        />
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

      {clip ? (
        <div className="mt-3 space-y-3 rounded-md border border-success/40 bg-success/5 p-3">
          <video
            src={clip}
            controls
            muted
            loop
            playsInline
            className="w-full rounded border border-border"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={insertar}>
              <Wand2 />
              Insertar en la landing
            </Button>
            <a
              href={clip}
              download
              className="font-mono text-[0.68rem] text-muted-foreground underline underline-offset-2"
            >
              descargar mp4
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
