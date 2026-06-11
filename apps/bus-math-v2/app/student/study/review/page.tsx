import { requireStudentSessionClaims } from "@/lib/auth/server";
import { ReviewSession } from "@/components/student/ReviewSession";

export const dynamic = 'force-dynamic';

/**
 * Page wrapper for the review session.
 *
 * @returns The review session component.
 */
export default async function ReviewPage() {
  await requireStudentSessionClaims("/student/study/review");

  return <ReviewSession />;
}
