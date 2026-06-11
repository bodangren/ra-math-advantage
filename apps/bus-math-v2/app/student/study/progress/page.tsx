import { requireStudentSessionClaims } from "@/lib/auth/server";
import { ProgressDashboard } from "@/components/student/ProgressDashboard";

export const dynamic = 'force-dynamic';

/**
 * Page wrapper for the study progress dashboard.
 *
 * @returns The progress dashboard component.
 */
export default async function ProgressPage() {
  await requireStudentSessionClaims("/student/study/progress");

  return <ProgressDashboard />;
}
