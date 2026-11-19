import Link from "next/link";

import { ImprovementPlanProposalForm } from "@/components/improvement-plan-proposal-form";
import { SiteHeader } from "@/components/site-header";
import { requireDanielsonSession } from "@/lib/auth/server";
import { getImprovementPlanProposalWorkspace } from "@/lib/improvement-plans/improvement-plan-page";

export default async function NewImprovementPlanPage({
  searchParams,
}: {
  searchParams: Promise<{ teacherProfileId?: string }>;
}) {
  await requireDanielsonSession("/improvement-plans/new");
  const { teacherProfileId } = await searchParams;
  if (!teacherProfileId) {
    return (
      <main id="main-content" className="page-shell">
        <h1>Select a teacher</h1>
        <p>Start a plan from the leadership teacher portfolio.</p>
        <Link href="/reports">Open teacher portfolio</Link>
      </main>
    );
  }
  const { session, workspace } = await getImprovementPlanProposalWorkspace(teacherProfileId);
  const roles = session.account.danielsonRoles as string[];
  const firstDepartment = workspace.departments[0];
  if (!firstDepartment) throw new Error("The teacher has no active department.");
  return (
    <>
      <SiteHeader
        isAuthenticated
        showReports
        showImprovementPlans
        showMyReport={roles.includes("teacher")}
      />
      <main id="main-content" className="page-shell report-stack">
        <p className="eyebrow">Restricted personnel record</p>
        <h1>Propose a performance improvement plan</h1>
        <p className="lede">The proposal stays inactive until an SLT member approves it.</p>
        <ImprovementPlanProposalForm
          teacherProfileId={workspace.teacher.teacherProfileId}
          teacherDisplayName={workspace.teacher.displayName}
          position={workspace.teacher.position}
          departmentId={firstDepartment.departmentId}
          departmentName={firstDepartment.departmentName}
          departmentOptions={workspace.departments}
          targetOptions={workspace.targetOptions}
        />
      </main>
    </>
  );
}
