'use client';

import { useCallback } from 'react';
import { ActivityRenderer } from '@/components/lesson/ActivityRenderer';
import { CardProgressBar } from './CardProgressBar';
import type { ResolvedQueueItem } from '@/convex/queue/queue';
import {
  buildPracticeSubmissionEnvelope,
  practiceSubmissionEnvelopeSchema,
  type PracticeSubmissionEnvelope,
} from '@math-platform/practice-core/contract';
import { usePracticeTiming } from '@/components/practice-timing';

export interface PracticeCardRendererProps {
  queueItem: ResolvedQueueItem;
  currentIndex: number;
  totalCount: number;
  onSubmit: (envelope: PracticeSubmissionEnvelope) => void;
  onComplete: () => void;
}

/**
 * Renders a single practice card with progress bar and activity renderer.
 *
 * @param {PracticeCardRendererProps} props - Practice card renderer configuration.
 * @returns {JSX.Element} A practice card with submission handling.
 */
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
      const existingEnvelope = practiceSubmissionEnvelopeSchema.safeParse(payload);
      if (existingEnvelope.success) {
        onSubmit(existingEnvelope.data);
        return;
      }
      const envelope = buildPracticeSubmissionEnvelope({
        activityId,
        mode: queueItem.props.practiceMode === 'guided_practice'
          ? 'guided_practice'
          : 'independent_practice',
        answers: payload as Record<string, unknown>,
        timing: getTiming() ?? undefined,
      });
      onSubmit(envelope);
    },
    [queueItem.props.activityId, queueItem.props.practiceMode, getTiming, onSubmit],
  );

  return (
    <div className="space-y-6" data-testid="practice-card-renderer">
      <CardProgressBar currentIndex={currentIndex} totalCount={totalCount} />
      <div className="rounded-xl border border-border bg-card p-6">
        <ActivityRenderer
          componentKey={queueItem.componentKey}
          activityId={typeof queueItem.props.activityId === 'string' ? queueItem.props.activityId : ''}
          mode={queueItem.props.practiceMode === 'guided_practice' ? 'guided' : 'practice'}
          activityProps={queueItem.props}
          onSubmit={handleSubmit}
          onComplete={onComplete}
        />
      </div>
    </div>
  );
}
