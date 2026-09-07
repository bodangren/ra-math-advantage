'use client';

import { GraphingExplorer } from './GraphingExplorer';

export interface GraphingExplorerActivityProps {
  activityId: string;
  mode: 'teaching' | 'guided' | 'practice';
  onSubmit?: (payload: unknown) => void | Promise<void>;
  equation?: string;
  variant?: 'plot_from_equation' | 'compare_functions' | 'find_intercepts' | 'graph_system';
  domain?: [number, number];
  range?: [number, number];
  responseVariant?: 'table_graph';
  onComplete?: () => void;
}

/**
 * Render a graphing explorer activity with default equation and submission handling.
 * @param {GraphingExplorerActivityProps} props - The activity configuration including ID, mode, and callbacks
 * @returns {import("react").JSX.Element} The activity component JSX
 */
export function GraphingExplorerActivity({
  activityId,
  mode,
  onSubmit,
  onComplete,
  equation = 'y = x^2',
  variant = 'plot_from_equation',
  domain,
  range,
  responseVariant,
}: GraphingExplorerActivityProps) {
  const handleSubmit = (payload: unknown) => {
    onSubmit?.(payload);
    onComplete?.();
  };

  return (
    <GraphingExplorer
      activityId={activityId}
      mode={mode}
      variant={variant}
      equation={equation}
      domain={domain}
      range={range}
      responseVariant={responseVariant}
      onSubmit={responseVariant === 'table_graph' ? async (payload) => {
        if (!onSubmit) throw new Error('Missing submission handler');
        await onSubmit(payload);
        onComplete?.();
      } : handleSubmit}
    />
  );
}
