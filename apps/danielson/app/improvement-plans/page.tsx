import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { getImprovementPlanList } from "@/lib/improvement-plans/improvement-plan-page";

export default async function ImprovementPlansPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string }>;
}) {
  const { cursor } = await searchParams;
  const { session, page } = await getImprovementPlanList(cursor ?? null);
  const roles = session.account.danielsonRoles as string[];
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
        <h1>Performance improvement plans</h1>
        <p className="lede">
          Review plans in your current teacher scope. Start a plan from the teacher portfolio.
        </p>
        {page.page.length === 0 ? (
          <p>No scoped improvement plans are available.</p>
        ) : (
          <div className="table-wrap card">
            <table>
              <thead>
                <tr>
                  <th scope="col">Teacher</th>
                  <th scope="col">Status</th>
                  <th scope="col">Version</th>
                </tr>
              </thead>
              <tbody>
                {page.page.map((plan) => {
                  const version = plan.pendingVersion ?? plan.activeVersion;
                  return (
                    <tr key={plan.planId}>
                      <th scope="row">
                        <Link href={`/improvement-plans/${encodeURIComponent(plan.planId)}`}>
                          {version?.teacherName ?? plan.teacherProfileId}
                        </Link>
                      </th>
                      <td>{plan.state}</td>
                      <td>{version?.version ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!page.isDone ? (
          <p>
            <Link href={`/improvement-plans?cursor=${encodeURIComponent(page.continueCursor)}`}>
              Next page
            </Link>
          </p>
        ) : null}
      </main>
    </>
  );
}
