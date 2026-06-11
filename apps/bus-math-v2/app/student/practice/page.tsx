import { requireStudentSessionClaims } from '@/lib/auth/server';
import { DailyPracticeSession } from '@/components/student/DailyPracticeSession';

export const dynamic = 'force-dynamic';

/**
 * Page wrapper for the daily practice session.
 *
 * @returns The daily practice session component.
 */
export default async function DailyPracticePage() {
  const claims = await requireStudentSessionClaims('/student/practice');

  return <DailyPracticeSession studentId={claims.sub} />;
}