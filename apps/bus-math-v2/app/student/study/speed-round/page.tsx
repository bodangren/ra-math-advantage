import { requireStudentSessionClaims } from "@/lib/auth/server";
import { SpeedRoundGame } from "@/components/student/SpeedRoundGame";

export const dynamic = 'force-dynamic';

/**
 * Page wrapper for the speed round exercise game.
 *
 * @returns The speed round game component.
 */
export default async function SpeedRoundPage() {
  await requireStudentSessionClaims("/student/study/speed-round");

  return <SpeedRoundGame />;
}