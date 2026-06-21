'use client';

import React from 'react';
import { DiscriminantAnalyzer } from '@math-platform/activity-components/discriminant';
import type { DiscriminantAnalyzerProps } from '@/lib/activities/schemas/discriminant-analyzer.schema';

export interface DiscriminantAnalyzerActivityProps extends DiscriminantAnalyzerProps {
  activityId: string;
  mode: 'teaching' | 'guided' | 'practice';
  onSubmit?: (payload: unknown) => void;
  onComplete?: () => void;
}

/**
 * Renders a discriminant analyzer activity for quadratic equations.
 *
 * @param {DiscriminantAnalyzerActivityProps} props - Activity configuration with equation and coefficient data.
 * @returns {JSX.Element} A discriminant analyzer activity.
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
