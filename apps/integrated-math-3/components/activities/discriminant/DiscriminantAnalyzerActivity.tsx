'use client';

import React from 'react';
import { DiscriminantAnalyzer } from '@/components/activities/discriminant/DiscriminantAnalyzer';
import type { DiscriminantAnalyzerProps } from '@/lib/activities/schemas/discriminant-analyzer.schema';

export interface DiscriminantAnalyzerActivityProps extends DiscriminantAnalyzerProps {
  activityId: string;
  mode: 'teaching' | 'guided' | 'practice';
  onSubmit?: (payload: unknown) => void;
  onComplete?: () => void;
}

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
