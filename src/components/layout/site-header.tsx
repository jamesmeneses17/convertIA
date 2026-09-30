import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { TECHNIQUES } from '@/lib/techniques';

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'ConvertIA';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background shadow-[0_1px_0_0_hsl(var(--border))]">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="group flex items-center gap-3 rounded-md">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-base font-semibold tracking-tight">{APP_NAME}</span>
            <span className="mt-0.5 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
              Prompt Maestro Engine
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="hidden font-mono text-[0.65rem] sm:inline-flex">
            {TECHNIQUES.length} tecnicas avanzadas
          </Badge>
          <Link
            href="/proyectos"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Banco de proyectos
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
