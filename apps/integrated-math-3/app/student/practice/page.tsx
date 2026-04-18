import { requireStudentSessionClaims } from '@/lib/auth/server';
import {
  fetchInternalQuery,
  fetchInternalMutation,
  internal,
} from '@/lib/convex/server';
import { PracticeSessionProvider } from '@/components/student/PracticeSessionProvider';
import type { SrsSession } from '@/lib/srs/contract';
import type { ResolvedQueueItem } from '@/convex/queue/queue';

interface SessionData {
  session: SrsSession;
  queue: ResolvedQueueItem[];
}

export default async function StudentPracticePage() {
  const claims = await requireStudentSessionClaims('/auth/login');

  const sessionData: SessionData | null = await fetchInternalQuery(
    internal.queue.sessions.getActiveSession,
    { studentId: claims.sub },
  );

  const activeSessionData: SessionData | null = sessionData ?? await fetchInternalMutation(
    internal.queue.sessions.startDailySession,
    { studentId: claims.sub },
  );

  if (!activeSessionData) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-display font-bold text-foreground">
          Daily Practice
        </h1>
        <p className="mt-4 text-muted-foreground">
          Unable to start a practice session. Please try again later.
        </p>
      </div>
    );
  }

  const { session, queue } = activeSessionData;

  return (
    <PracticeSessionProvider
      session={session}
      queue={queue}
      studentId={claims.sub}
    />
  );
}
