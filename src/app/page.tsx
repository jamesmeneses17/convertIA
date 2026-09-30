import { Blocks, Clipboard, Cpu, Database } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { WizardShell } from '@/components/wizard/wizard-shell';
import { TECHNIQUES } from '@/lib/techniques';

const PRINCIPLES = [
  {
    icon: Cpu,
    title: 'Sin APIs de pago',
    body: 'El sistema no llama a ningun modelo. Compila el prompt en tu maquina y lo entrega listo para tu sesion activa.',
  },
  {
    icon: Blocks,
    title: `${TECHNIQUES.length} tecnicas acumulables`,
    body: 'Cada tecnica inyecta directivas verificables: direccion de arte, psicologia de conversion, auditoria y recorte.',
  },
  {
    icon: Clipboard,
    title: 'Portable entre IAs',
    body: 'El mismo Prompt Maestro rinde igual en Claude, ChatGPT, Gemini o DeepSeek. La calidad vive en la ingenieria.',
  },
  {
    icon: Database,
    title: 'Banco de proyectos',
    body: 'Brief, tecnicas, prompt y codigo resultante guardados en PostgreSQL, local o en la nube.',
  },
] as const;

export default function HomePage() {
  return (
    <div className="container py-10 sm:py-14">
      {/* ---------- Hero ---------- */}
      <section className="mx-auto max-w-4xl">
        <Badge variant="outline" className="font-mono text-[0.68rem]">
          Sistema experto de ingenieria de prompts
        </Badge>

        <h1 className="mt-4 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
          Prompts Maestros para landing pages{' '}
          <span className="text-primary">que convierten</span>
        </h1>

        <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          Recoge las variables de tu proyecto, activa las tecnicas avanzadas que necesites y obten un
          super-prompt de nivel experto. Ejecutalo en tu sesion de Claude o pegalo en cualquier otra IA: el
          resultado es una landing page completa en HTML, CSS y JavaScript.
        </p>

        <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PRINCIPLES.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-lg border border-border bg-card/70 p-4">
                <dt className="flex items-center gap-2 text-sm font-semibold">
                  <Icon className="h-4 w-4 text-primary" />
                  {item.title}
                </dt>
                <dd className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.body}</dd>
              </div>
            );
          })}
        </dl>
      </section>

      {/* ---------- Asistente de 3 etapas ---------- */}
      <div className="mt-12 sm:mt-16">
        <WizardShell />
      </div>
    </div>
  );
}
