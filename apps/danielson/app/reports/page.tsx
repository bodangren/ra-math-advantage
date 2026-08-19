import { LeadershipPortfolioTable } from '@/components/leadership-portfolio-table';
import { SiteHeader } from '@/components/site-header';
import { getLeadershipPortfolio } from '@/lib/reporting/reporting-page';

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string }>;
}) {
  const parameters = await searchParams;
  const { session, page } = await getLeadershipPortfolio(parameters.cursor ?? null);
  const roles = session.account.danielsonRoles as string[];
  return (
    <>
      <SiteHeader isAuthenticated showReports showImprovementPlans showMyReport={roles.includes('teacher')} />
      <main id="main-content" className="page-shell">
        <p className="eyebrow">Leadership portfolio</p>
        <h1>Teacher proficiency</h1>
        <p className="lede">Review compact Danielson, improvement-plan, GBF, and evidence-due status. Teachers who need attention appear first.</p>
        <LeadershipPortfolioTable
          rows={page.items}
          nextHref={page.isDone ? null : `/reports?cursor=${encodeURIComponent(page.continueCursor)}`}
        />
      </main>
    </>
  );
}
