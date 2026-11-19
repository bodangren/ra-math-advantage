import Link from "next/link";
import { LeadershipPortfolioTable } from "@/components/leadership-portfolio-table";
import { SiteHeader } from "@/components/site-header";
import { getLeadershipPortfolio } from "@/lib/reporting/reporting-page";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{
    cursor?: string;
    search?: string;
    department?: string;
    attention?: string;
    assignedOnly?: string;
  }>;
}) {
  const parameters = await searchParams;
  const { session, page } = await getLeadershipPortfolio(parameters.cursor ?? null, {
    search: parameters.search,
    department: parameters.department,
    attention: parameters.attention,
    assignedOnly: parameters.assignedOnly === "true",
  });
  const roles = session.account.danielsonRoles as string[];
  return (
    <>
      <SiteHeader
        isAuthenticated
        showReports
        showImprovementPlans
        showMyReport={roles.includes("teacher")}
      />
      <main id="main-content" className="page-shell">
        <p className="eyebrow">Leadership portfolio</p>
        <h1>Teacher proficiency</h1>
        <p className="lede">
          Review compact Danielson, improvement-plan, GBF, and evidence-due status. Teachers who
          need attention appear first.
        </p>
        <form className="card portfolio-filters" method="get">
          <div className="field">
            <label htmlFor="teacher-search">Teacher name</label>
            <input
              id="teacher-search"
              name="search"
              defaultValue={parameters.search}
              maxLength={100}
            />
          </div>
          <div className="field">
            <label htmlFor="department-search">Department name</label>
            <input
              id="department-search"
              name="department"
              defaultValue={parameters.department}
              maxLength={100}
            />
          </div>
          <div className="field">
            <label htmlFor="attention-filter">Attention reason</label>
            <select
              id="attention-filter"
              name="attention"
              defaultValue={parameters.attention ?? ""}
            >
              <option value="">All reasons</option>
              <option value="below_proficient">Below Proficient</option>
              <option value="overdue_evidence">Overdue evidence</option>
              <option value="ip_off_track">Plan off track</option>
              <option value="not_enough_evidence">Not enough evidence</option>
            </select>
          </div>
          <label className="assignment-filter">
            <input
              type="checkbox"
              name="assignedOnly"
              value="true"
              defaultChecked={parameters.assignedOnly === "true"}
            />{" "}
            My department and coach assignments only
          </label>
          <button type="submit">Find teachers</button>
          <Link href="/reports">Clear filters</Link>
        </form>
        <p>
          <Link href="/calibration">Observer calibration</Link>
        </p>
        {page.items.length === 0 ? (
          <p className="card">No teachers match these filters in your current scope.</p>
        ) : null}
        <LeadershipPortfolioTable
          rows={page.items}
          nextHref={
            page.isDone
              ? null
              : `/reports?${new URLSearchParams({ ...(Object.fromEntries(Object.entries(parameters).filter(([key, value]) => key !== "cursor" && value !== undefined)) as Record<string, string>), cursor: page.continueCursor })}`
          }
        />
      </main>
    </>
  );
}
