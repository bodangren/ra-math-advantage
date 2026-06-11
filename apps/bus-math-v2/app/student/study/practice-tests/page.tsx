import { requireStudentSessionClaims } from "@/lib/auth/server";
import { PracticeTestSelection } from "@/components/student/PracticeTestSelection";

export const dynamic = 'force-dynamic';

/**
 * Page wrapper for the practice tests selection hub.
 *
 * @returns The practice test selection component.
 */
export default async function PracticeTestsHubPage() {
  await requireStudentSessionClaims("/student/study/practice-tests");

  return <PracticeTestSelection />;
}
