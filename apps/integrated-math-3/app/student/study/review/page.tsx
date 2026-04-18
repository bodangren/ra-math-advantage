import { requireStudentSessionClaims } from '@/lib/auth/server';
import { ReviewPageClient } from './ReviewPageClient';

export default async function ReviewPage() {
  const claims = await requireStudentSessionClaims('/auth/login');

  return <ReviewPageClient studentId={claims.sub} />;
}