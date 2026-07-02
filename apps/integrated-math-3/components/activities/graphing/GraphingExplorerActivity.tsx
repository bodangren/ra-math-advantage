'use client';

import { GraphingExplorer } from '@math-platform/activity-components/graphing';

export interface ActivityComponentProps {
  activityId: string;
  mode: 'teaching' | 'guided' | 'practice';
  onSubmit?: (payload: unknown) => void;
  onComplete?: () => void;
  /** Optional equation override from authored/previewed configuration. */
  equation?: string;
  /** Optional variant override from authored/previewed configuration. */
  variant?: string;
}

/**
 * Renders a graphing explorer activity wrapping the shared GraphingExplorer component.
 *
 * @param {ActivityComponentProps} props - Activity configuration with mode and callbacks.
 * @returns {JSX.Element} A graphing explorer activity.
 */
export function GraphingExplorerActivity({
  activityId,
  mode,
  onSubmit,
  onComplete,
  equation = 'y = x^2',
  variant = 'plot_from_equation',
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
        variant={variant}
        equation={equation}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
