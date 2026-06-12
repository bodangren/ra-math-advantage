'use client';

import React from 'react';
import { DiscriminantAnalyzer } from './DiscriminantAnalyzer';
import type { DiscriminantAnalyzerProps } from '../../schemas/discriminant-analyzer.schema';

export interface DiscriminantAnalyzerActivityProps extends DiscriminantAnalyzerProps {
  activityId: string;
  mode: 'teaching' | 'guided' | 'practice';
  onSubmit?: (payload: unknown) => void;
  onComplete?: () => void;
}

/**
 * Render a discriminant analyzer activity with submission handling.
 * @param props - The activity configuration including equation, coefficients, and callbacks
 * @returns The activity component JSX
 */
export function DiscriminantAnalyzerActivity({
  activityId,
  mode,
  equation,
  coefficients,
  onSubmit,
  onComplete,
}: DiscriminantAnalyzerActivityProps) {
  const handleSubmit = (payload: unknown) => {
    onSubmit?.({ ...(payload as Record<string, unknown>), activityId });
  };

  return (
    <DiscriminantAnalyzer
      mode={mode}
      equation={equation}
      coefficients={coefficients}
      onSubmit={handleSubmit}
      onComplete={onComplete}
    />
  );
}
