'use client';

import type { SrsSession } from '@math-platform/srs-engine/contract';
import type { ResolvedQueueItem } from '@/convex/queue/queue';

interface PracticeSessionProviderProps {
  session: SrsSession;
  queue: ResolvedQueueItem[];
  studentId: string;
}

export function PracticeSessionProvider({
  session,
  queue,
  studentId,
}: PracticeSessionProviderProps) {
  return (
    <div data-testid="practice-session-provider" data-student-id={studentId} data-queue-length={queue.length}>
      <span data-testid="session-id">{session.sessionId}</span>
      <span data-testid="first-objective-id">{queue[0]?.card.objectiveId ?? ''}</span>
    </div>
  );
}
