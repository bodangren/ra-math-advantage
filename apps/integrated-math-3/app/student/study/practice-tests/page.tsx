import { requireStudentSessionClaims } from '@/lib/auth/server';
import { PracticeTestSelection } from '@/components/student/PracticeTestSelection';

export const dynamic = 'force-dynamic';

/**
 * Renders the practice tests hub where students select a module to begin
 * a practice test.
 *
 * @returns The rendered PracticeTestsHubPage JSX.
 */
export default async function PracticeTestsHubPage() {
  await requireStudentSessionClaims('/auth/login');

  return <PracticeTestSelection />;
}
