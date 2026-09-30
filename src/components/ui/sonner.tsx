'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      closeButton
      richColors
      toastOptions={{
        classNames: {
          toast: 'border-border bg-card text-card-foreground shadow-lg',
          description: 'text-muted-foreground',
        },
      }}
    />
  );
}
