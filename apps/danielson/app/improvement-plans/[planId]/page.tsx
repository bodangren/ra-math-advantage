import { ImprovementPlanView } from "@/components/improvement-plan-view";
import { SiteHeader } from "@/components/site-header";
import { getImprovementPlan } from "@/lib/improvement-plans/improvement-plan-page";

export default async function ImprovementPlanPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = await params;
  const { session, plan, viewer, progress } = await getImprovementPlan(planId);
  const roles = session.account.danielsonRoles as string[];
  const canReport = roles.some((role) => ["hod", "coach", "school_head", "slt"].includes(role));
  return (
    <>
      <SiteHeader
        isAuthenticated
        showReports={canReport}
        showImprovementPlans={canReport}
        showMyReport={roles.includes("teacher")}
      />
      <main id="main-content" className="page-shell report-stack">
        <p className="eyebrow">Restricted personnel record</p>
        <h1>Performance improvement plan</h1>
        <ImprovementPlanView plan={plan} progress={progress} viewer={viewer} roles={roles} />
      </main>
    </>
  );
}
