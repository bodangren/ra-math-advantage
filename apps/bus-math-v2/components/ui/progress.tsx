import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value?: number;
}


/**
 * Renders a progress bar clamped between 0 and 100.
 *
 * @param props - Progress value and standard HTML div attributes
 * @returns A styled progress bar element
 */
export function Progress({ value = 0, className, ...props }: ProgressProps) {
  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clampedValue)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('h-2 w-full rounded-full bg-muted', className)}
      {...props}
    >
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}
