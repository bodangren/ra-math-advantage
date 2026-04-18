'use client';

import { GraphingExplorer } from '@/components/activities/graphing/GraphingExplorer';

export interface ActivityComponentProps {
  activityId: string;
  mode: 'teaching' | 'guided' | 'practice';
  onSubmit?: (payload: unknown) => void;
  onComplete?: () => void;
}

export function GraphingExplorerActivity({
  activityId,
  mode,
  onSubmit,
  onComplete,
}: ActivityComponentProps) {
  const handleSubmit = (payload: unknown) => {
    onSubmit?.(payload);
    onComplete?.();
  };

  return (
    <GraphingExplorer
      activityId={activityId}
      mode={mode}
      variant="plot_from_equation"
      equation="y = x^2"
      onSubmit={handleSubmit}
    />
  );
}
