import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Valor entre 0 y 100. */
  value: number;
  barClassName?: string;
}

/** Barra de progreso accesible, sin dependencias. */
export function Progress({ value, className, barClassName, ...props }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-muted', className)}
      {...props}
    >
      <div
        className={cn('h-full rounded-full bg-primary transition-[width] duration-500 ease-out', barClassName)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
