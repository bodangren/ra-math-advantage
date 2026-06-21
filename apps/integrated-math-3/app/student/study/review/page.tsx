import { requireStudentSessionClaims } from '@/lib/auth/server';
import { ReviewPageClient } from './ReviewPageClient';

/**
 * Server wrapper for the spaced-repetition review page that authenticates
 * the student and passes their ID to the client component.
 *
 * @returns {JSX.Element} The rendered ReviewPage JSX.
 */
export default async function ReviewPage() {
  const claims = await requireStudentSessionClaims('/auth/login');

  return <ReviewPageClient studentId={claims.sub} />;
}