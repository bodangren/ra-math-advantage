import { requireStudentSessionClaims } from "@/lib/auth/server";
import { StudyHubHome } from "@/components/student/StudyHubHome";

export const dynamic = 'force-dynamic';

/**
 * Page wrapper for the study hub home view.
 *
 * @returns The study hub home component.
 */
export default async function StudyHubPage() {
  await requireStudentSessionClaims("/student/study");

  return <StudyHubHome />;
}
