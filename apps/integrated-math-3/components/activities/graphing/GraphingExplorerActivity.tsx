'use client';

import {
  GraphingExplorerActivity as SharedGraphingExplorerActivity,
  type GraphingExplorerActivityProps as SharedGraphingExplorerActivityProps,
} from '@math-platform/activity-components/graphing';
import { IM3_MASTERY_ADVANTAGE_ACTIVITY_ID } from '../../../lib/practice/learning-evidence-pilot';

export interface ActivityComponentProps extends SharedGraphingExplorerActivityProps {
  /** Stable activity identity supplied by the server-owned queue. */
  stableActivityId?: string;
  masteryNodeId?: string;
  srsEligible?: boolean;
  answerSchema?: Record<string, string>;
}

/**
 * Bind the exact IM3 pilot identity to the shared table-and-graph response.
 */
export function GraphingExplorerActivity({
  activityId,
  mode,
  onSubmit,
  onComplete,
  equation,
  originalEquation,
  variant,
  domain,
  range,
  points,
  comparisonEquation,
  comparisonQuestion,
  comparisonAnswer,
  linearEquation,
  responseVariant,
  vertex,
  yIntercept,
  sum,
  product,
  stableActivityId,
}: ActivityComponentProps) {
  return (
    <SharedGraphingExplorerActivity
      activityId={activityId}
      mode={mode}
      onSubmit={onSubmit}
      onComplete={onComplete}
      equation={equation}
      originalEquation={originalEquation}
      variant={variant}
      domain={domain}
      range={range}
      points={points}
      comparisonEquation={comparisonEquation}
      comparisonQuestion={comparisonQuestion}
      comparisonAnswer={comparisonAnswer}
      linearEquation={linearEquation}
      responseVariant={responseVariant ?? (
        stableActivityId === IM3_MASTERY_ADVANTAGE_ACTIVITY_ID
          ? 'table_graph'
          : undefined
      )}
      vertex={vertex}
      yIntercept={yIntercept}
      sum={sum}
      product={product}
    />
  );
}
