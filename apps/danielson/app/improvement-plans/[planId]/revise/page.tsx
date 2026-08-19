import { ImprovementPlanProposalForm } from '@/components/improvement-plan-proposal-form';
import { SiteHeader } from '@/components/site-header';
import {
  getImprovementPlan,
  getImprovementPlanProposalWorkspace,
} from '@/lib/improvement-plans/improvement-plan-page';

export default async function ReviseImprovementPlanPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = await params;
  const planResult = await getImprovementPlan(planId);
  const workspaceResult = await getImprovementPlanProposalWorkspace(planResult.plan.teacherProfileId);
  const version = planResult.plan.pendingVersion ?? planResult.plan.activeVersion;
  if (!version) throw new Error('The plan has no proposal version.');
  const roles = planResult.session.account.danielsonRoles as string[];
  return (
    <>
      <SiteHeader isAuthenticated showReports showImprovementPlans showMyReport={roles.includes('teacher')} />
      <main id="main-content" className="page-shell report-stack">
        <p className="eyebrow">Restricted personnel record</p>
        <h1>Create a revised proposal</h1>
        <p className="lede">The approved version stays active until SLT approves this version.</p>
        <ImprovementPlanProposalForm
          teacherProfileId={planResult.plan.teacherProfileId}
          teacherDisplayName={version.teacherName}
          position={version.position}
          departmentId={version.departmentId}
          departmentName={version.departmentName}
          departmentOptions={workspaceResult.workspace.departments}
          targetOptions={workspaceResult.workspace.targetOptions}
          planId={planId}
          expectedRevision={planResult.plan.revision}
          initial={{
            requestedPlanEndDate: version.requestedPlanEndDate,
            reviewMeetingDate: version.reviewMeetingDate,
            purpose: version.purpose,
            areasOfConcern: version.areasOfConcern,
            expectedStandard: version.expectedStandard,
            requiredActions: version.requiredActions,
            evidenceOfImprovement: version.evidenceOfImprovement,
            schoolSupport: version.schoolSupport,
            successfulCompletionCriteria: version.successfulCompletionCriteria,
            targets: version.targets.map((target) => ({
              skillId: target.skillId,
              expectedRating: target.expectedRating,
            })),
          }}
        />
      </main>
    </>
  );
}
