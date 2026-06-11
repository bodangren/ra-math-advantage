import { requireStudentSessionClaims } from "@/lib/auth/server";
import { MatchingGame } from "@/components/student/MatchingGame";

export const dynamic = 'force-dynamic';

/**
 * Page wrapper for the matching exercise game.
 *
 * @returns The matching game component.
 */
export default async function MatchingPage() {
  await requireStudentSessionClaims("/student/study/matching");

  return <MatchingGame />;
}
