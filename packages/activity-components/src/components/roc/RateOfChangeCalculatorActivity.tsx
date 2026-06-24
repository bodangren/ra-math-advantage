'use client';

import React from 'react';
import { RateOfChangeCalculator } from './RateOfChangeCalculator';
import type { RateOfChangeCalculatorProps } from '../../schemas/rate-of-change-calculator.schema';

export interface RateOfChangeCalculatorActivityProps extends RateOfChangeCalculatorProps {
  activityId: string;
  mode: 'teaching' | 'guided' | 'practice';
  onSubmit?: (payload: unknown) => void;
  onComplete?: () => void;
}

/**
 * Render a rate of change calculator activity with submission handling.
 * @param {RateOfChangeCalculatorActivityProps} props - The activity configuration including source type, data, and callbacks
 * @returns {React.JSX.Element} The activity component JSX
 */
export function RateOfChangeCalculatorActivity({
  activityId,
  mode,
  sourceType,
  data,
  interval,
  onSubmit,
  onComplete,
}: RateOfChangeCalculatorActivityProps) {
  const handleSubmit = (payload: unknown) => {
    onSubmit?.({ ...(payload as Record<string, unknown>), activityId });
  };

  return (
    <RateOfChangeCalculator
      mode={mode}
      sourceType={sourceType}
      data={data}
      interval={interval}
      onSubmit={handleSubmit}
      onComplete={onComplete}
    />
  );
}
