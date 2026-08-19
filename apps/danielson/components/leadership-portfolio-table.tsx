import Link from 'next/link';

import type { PortfolioRow } from '@/lib/reporting/contracts';

type LeadershipPortfolioRow = Omit<PortfolioRow, 'attentionReasons'> & {
  attentionReasons: readonly PortfolioRow['attentionReasons'][number][];
};

function statusLabel(value: string) {
  if (value === 'below_proficient') return 'Below Proficient';
  if (value === 'not_enough_evidence') return 'Not enough evidence';
  if (value === 'not_configured') return 'Not configured';
  if (value === 'overdue') return 'Overdue';
  if (value === 'due') return 'Due';
  if (value === 'pending_approval') return 'Pending approval';
  if (value === 'active') return 'Active';
  if (value === 'closed') return 'Closed';
  if (value === 'in_progress') return 'In progress';
  return 'Proficient';
}

function reasonLabel(value: LeadershipPortfolioRow['attentionReasons'][number]) {
  if (value === 'below_proficient') return 'Below Proficient';
  if (value === 'ip_off_track') return 'Improvement plan off track';
  return 'overdue evidence';
}

function phaseLabel(value: string) {
  if (value === 'complete') return 'Complete';
  const match = /^phase_(\d+)$/.exec(value);
  return match ? `Phase ${match[1]}` : value.replaceAll('_', ' ');
}

export function LeadershipPortfolioTable({
  rows,
  nextHref,
}: {
  rows: readonly LeadershipPortfolioRow[];
  nextHref?: string | null;
}) {
  return (
    <>
      <div className="table-wrap card">
        <table>
          <thead>
            <tr>
              <th scope="col">Teacher</th>
              <th scope="col">Danielson</th>
              <th scope="col">Performance Improvement Plan</th>
              <th scope="col">Get Better Faster (GBF)</th>
              <th scope="col">Evidence due</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.teacherProfileId}>
                <th scope="row">
                  <Link href={`/reports/teachers/${encodeURIComponent(row.teacherProfileId)}`}>
                    {row.displayName}
                  </Link>
                  {row.improvementPlan.state === 'not_configured'
                    || row.improvementPlan.state === 'closed' ? (
                      <>
                        {' · '}
                        <Link href={`/improvement-plans/new?teacherProfileId=${encodeURIComponent(row.teacherProfileId)}`}>
                          Start improvement plan
                        </Link>
                      </>
                    ) : null}
                  {row.attentionReasons.length > 0 ? (
                    <span className="attention-reasons">
                      {row.attentionReasons.map(reasonLabel).join('; ')}
                    </span>
                  ) : null}
                </th>
                <td>{statusLabel(row.danielson.state)}</td>
                <td>{statusLabel(row.improvementPlan.state)}</td>
                <td>
                  {statusLabel(row.gbf.state)}
                  {row.gbf.state !== 'not_configured' ? (
                    <>
                      <br />
                      <span>Due skills: {row.gbf.dueSkillCount}</span>
                      <br />
                      <span>Unresolved gaps: {row.gbf.unresolvedGapSkillCount}</span>
                      <br />
                      <span>Management phase: {phaseLabel(row.gbf.managementPhaseId)}</span>
                      <br />
                      <span>Rigor phase: {phaseLabel(row.gbf.rigorPhaseId)}</span>
                    </>
                  ) : null}
                </td>
                <td>
                  {statusLabel(row.evidenceDue.state)}
                  {row.evidenceDue.dueCount > 0 ? ` (${row.evidenceDue.dueCount})` : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {nextHref ? <p><Link href={nextHref}>Next page</Link></p> : null}
    </>
  );
}
