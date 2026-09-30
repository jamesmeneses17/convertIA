import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container grid min-h-[60vh] place-items-center py-16 text-center">
      <div className="max-w-md">
        <span className="stage-index">Error 404</span>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Esta pagina no existe</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          El enlace esta roto o el proyecto que buscabas se elimino del banco.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/">Volver al asistente</Link>
        </Button>
      </div>
    </div>
  );
}
