'use client';

import React, { useCallback, Suspense, useMemo, useState } from 'react';
import { getActivityComponent } from '@/lib/activities/registry';
import { usePracticeTiming } from '@/components/practice-timing';
import {
  practiceSubmissionEnvelopeSchema,
  type PracticeSubmissionEnvelope,
} from '@math-platform/practice-core/contract';

export interface ActivityRendererProps {
  componentKey: string;
  activityId: string;
  lessonId?: string;
  phaseNumber?: number;
  mode?: 'teaching' | 'guided' | 'practice';
  onSubmit?: (payload: unknown) => void | Promise<void>;
  onComplete?: () => void;
  onCheckDiscriminant?: (rawAnswer: string) => Promise<boolean>;
  /** Optional activity-specific configuration props (e.g. equation, questions,
   *  template). Forwarded to the registered activity component via spread, so
   *  authored/previewed content reaches the same rendering path a student sees. */
  activityProps?: Record<string, unknown>;
}

/**
 * Delegates to the activity registry by componentKey.
 * Shows a placeholder if the component is not yet registered.
 * In student contexts (mode !== 'teaching'), injects timing telemetry
 * into practice.v1 submission envelopes.
 */
export function ActivityRenderer({
  componentKey,
  activityId,
  mode = 'practice',
  onSubmit,
  onComplete,
  onCheckDiscriminant,
  activityProps,
}: ActivityRendererProps) {
  const isStudentContext = mode !== 'teaching';
  const { getTiming } = usePracticeTiming();
  const [quadraticAttempt, setQuadraticAttempt] = useState<{
    identity: string;
    input: object;
    envelope: PracticeSubmissionEnvelope;
  }>();
  const quadraticIdentity = `${activityId}:${mode}`;

  const handleSubmit = useCallback(
    (payload: unknown): void | Promise<void> => {
      if (!onSubmit) return;
      const parsed = practiceSubmissionEnvelopeSchema.safeParse(payload);
      if (isStudentContext && parsed.success) {
        const payloadObject = typeof payload === 'object' && payload !== null ? payload : undefined;
        if (
          componentKey === 'quadratic-formula'
          && payloadObject
          && quadraticAttempt?.identity === quadraticIdentity
          && quadraticAttempt.input === payloadObject
        ) return onSubmit(quadraticAttempt.envelope);
        if (!parsed.data.timing) {
          const timing = getTiming();
          const envelope: PracticeSubmissionEnvelope = timing
            ? { ...parsed.data, timing }
            : parsed.data;
          if (componentKey === 'quadratic-formula' && payloadObject) {
            setQuadraticAttempt({ identity: quadraticIdentity, input: payloadObject, envelope });
          }
          return onSubmit(envelope);
        }
      }
      return onSubmit(payload);
    },
    [componentKey, getTiming, isStudentContext, onSubmit, quadraticAttempt, quadraticIdentity],
  );

  const ActivityComponent = useMemo(() => getActivityComponent(componentKey), [componentKey]);

  if (!ActivityComponent) {
    return (
      <div className="my-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <p className="text-sm text-yellow-700">This activity is not available.</p>
      </div>
    );
  }

  return (
    <div className="my-4">
      <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Loading activity…</div>}>
        {React.createElement(ActivityComponent, {
          ...(activityProps ?? {}),
          key: componentKey === 'quadratic-formula' ? quadraticIdentity : undefined,
          activityId,
          mode,
          onSubmit: onSubmit ? handleSubmit : undefined,
          onComplete,
          onCheckDiscriminant,
        })}
      </Suspense>
    </div>
  );
}
