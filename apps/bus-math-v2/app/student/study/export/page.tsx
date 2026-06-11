import { requireStudentSessionClaims } from "@/lib/auth/server";
import { ExportPage } from "@/components/student/ExportPage";

export const dynamic = 'force-dynamic';

/**
 * Page wrapper for the study data export view.
 *
 * @returns The export page component.
 */
export default async function ExportStudyDataPage() {
  await requireStudentSessionClaims("/student/study/export");

  return <ExportPage />;
}
