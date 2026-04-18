'use client';

import { useCallback } from 'react';
import { ActivityRenderer } from '@/components/lesson/ActivityRenderer';
import { CardProgressBar } from './CardProgressBar';
import type { ResolvedQueueItem } from '@/convex/queue/queue';
import {
  buildPracticeSubmissionEnvelope,
  type PracticeSubmissionEnvelope,
} from '@/lib/practice/contract';
import { usePracticeTiming } from '@/components/practice-timing';

export interface PracticeCardRendererProps {
  queueItem: ResolvedQueueItem;
  currentIndex: number;
  totalCount: number;
  onSubmit: (envelope: PracticeSubmissionEnvelope) => void;
  onComplete: () => void;
}

export function PracticeCardRenderer({
  queueItem,
  currentIndex,
  totalCount,
  onSubmit,
  onComplete,
}: PracticeCardRendererProps) {
  const { getTiming } = usePracticeTiming();

  const handleSubmit = useCallback(
    (payload: unknown) => {
      const activityId = queueItem.props.activityId;
      if (typeof activityId !== 'string' || !activityId) {
        console.error('PracticeCardRenderer: missing or invalid activityId in queue item props');
        return;
      }
      const envelope = buildPracticeSubmissionEnvelope({
        activityId,
        mode: 'independent_practice',
        answers: payload as Record<string, unknown>,
        timing: getTiming() ?? undefined,
      });
      onSubmit(envelope);
    },
    [queueItem.props.activityId, getTiming, onSubmit],
  );

  return (
    <div className="space-y-6" data-testid="practice-card-renderer">
      <CardProgressBar currentIndex={currentIndex} totalCount={totalCount} />
      <div className="rounded-xl border border-border bg-card p-6">
        <ActivityRenderer
          componentKey={queueItem.componentKey}
          activityId={typeof queueItem.props.activityId === 'string' ? queueItem.props.activityId : ''}
          mode="practice"
          onSubmit={handleSubmit}
          onComplete={onComplete}
        />
      </div>
    </div>
  );
}