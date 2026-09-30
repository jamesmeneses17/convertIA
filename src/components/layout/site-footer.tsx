import { Separator } from '@/components/ui/separator';

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'ConvertIA';

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border/60 bg-card/40">
      <div className="container py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{APP_NAME}</span> | la calidad del resultado
            depende de la calidad de la ingenieria del prompt.
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            Next.js + Prisma + PostgreSQL | Dockerizado
          </p>
        </div>
        <Separator className="my-6 opacity-60" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          No consume APIs de pago: el Prompt Maestro se copia a tu portapapeles o se abre en tu sesion activa
          de Claude. Funciona igual en ChatGPT, Gemini o DeepSeek.
        </p>
      </div>
    </footer>
  );
}
