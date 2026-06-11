import { requireStudentSessionClaims } from "@/lib/auth/server";
import { PracticeTestPage } from "@/components/student/PracticeTestPage";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

/**
 * Page wrapper for a unit-specific practice test.
 *
 * @param props - The page props.
 * @param props.params - The route parameters containing the unit number.
 * @returns The practice test page component or a not-found response.
 */
export default async function PracticeTestUnitPage({ params }: { params: { unitNumber: string } }) {
  const unitNumber = parseInt(params.unitNumber, 10);
  if (!Number.isInteger(unitNumber) || unitNumber < 1 || unitNumber > 8) {
    notFound();
  }

  await requireStudentSessionClaims(`/student/study/practice-tests/${unitNumber}`);

  return <PracticeTestPage unitNumber={unitNumber} />;
}
