import { requireStudentSessionClaims } from "@/lib/auth/server";
import { fetchInternalQuery, internal } from "@/lib/convex/server";
import type { Id } from "@/convex/_generated/dataModel";
import { PerpendicularBisectorPilot } from "@/components/student/PerpendicularBisectorPilot";
export default async function PracticePage() {
  const claims = await requireStudentSessionClaims("/student/practice");
  const items = await fetchInternalQuery(internal.activities.getApprovedPerpendicularBisectorPilot, { userId: claims.sub as Id<"profiles"> });
  return <main className="max-w-3xl mx-auto px-6 py-12"><h1 className="text-3xl font-display mb-6">Perpendicular bisector practice</h1><PerpendicularBisectorPilot items={items} /></main>;
}
