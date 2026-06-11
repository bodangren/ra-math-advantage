'use client';

import { GraphingExplorer } from '@math-platform/activity-components/graphing';

export interface ActivityComponentProps {
  activityId: string;
  mode: 'teaching' | 'guided' | 'practice';
  onSubmit?: (payload: unknown) => void;
  onComplete?: () => void;
}

/**
 * Renders a graphing explorer activity wrapping the shared GraphingExplorer component.
 *
 * @param props - Activity configuration with mode and callbacks.
 * @returns A graphing explorer activity.
 */
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
    <div data-testid="graphing-explorer">
      <GraphingExplorer
        activityId={activityId}
        mode={mode}
        variant="plot_from_equation"
        equation="y = x^2"
        onSubmit={handleSubmit}
      />
    </div>
  );
}
