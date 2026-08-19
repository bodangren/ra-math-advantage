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
  return 'Proficient';
}

function reasonLabel(value: LeadershipPortfolioRow['attentionReasons'][number]) {
  return value === 'below_proficient' ? 'Below Proficient' : 'overdue evidence';
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
              <th scope="col">IP</th>
              <th scope="col">GBF</th>
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
                  {row.attentionReasons.length > 0 ? (
                    <span className="attention-reasons">
                      {row.attentionReasons.map(reasonLabel).join('; ')}
                    </span>
                  ) : null}
                </th>
                <td>{statusLabel(row.danielson.state)}</td>
                <td>{statusLabel(row.improvementPlan.state)}</td>
                <td>{statusLabel(row.gbf.state)}</td>
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
