import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';


/**
 * Renders a horizontal separator line.
 *
 * @param props - Standard HTML div attributes with optional className
 * @returns A styled separator div element
 */
export function Separator({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div role="separator" className={cn('h-px w-full bg-border/60', className)} {...props} />;
}
