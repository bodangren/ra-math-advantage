import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { requireSysadminPage } from '@/lib/foundation/admin-page';
import { fetchInternalQuery, internal } from '@/lib/convex/server';

const labels = { department_memberships: 'Teacher memberships', hod_assignments: 'HOD assignments', coach_assignments: 'Coach assignments' };

export default async function RelationshipsPage({ searchParams }: {
  searchParams: Promise<{ kind?: string; cursor?: string }>;
}) {
  const session = await requireSysadminPage('/admin/relationships');
  const parameters = await searchParams;
  const kind = parameters.kind === 'hod_assignments' || parameters.kind === 'coach_assignments'
    ? parameters.kind : 'department_memberships';
  const result = await fetchInternalQuery(internal.foundation.listAdministrationAssignments, {
    actorAccountId: session.claims.sub, kind, paginationOpts: { cursor: parameters.cursor ?? null, numItems: 25 },
  });
  return <>
    <SiteHeader isAuthenticated showAdministration />
    <main id="main-content" className="page-shell">
      <h1>Current assignments</h1>
      <nav aria-label="Assignment type">{Object.entries(labels).map(([value, label]) => (
        <p key={value}><Link href={`/admin/relationships?kind=${value}`}>{label}</Link></p>
      ))}</nav>
      <h2>{labels[kind]}</h2>
      {result.kind === 'allowed' ? <>
        <div className="table-wrap"><table><thead><tr><th scope="col">Person</th><th scope="col">Assigned to</th></tr></thead>
          <tbody>{result.items.map((item: { assignmentId: string; person: string; assignment: string }) => (
            <tr key={item.assignmentId}><td>{item.person}</td><td>{item.assignment}</td></tr>
          ))}</tbody></table></div>
        {result.items.length === 0 ? <p>No active assignments on this page.</p> : null}
        {result.nextCursor ? <p><Link href={`/admin/relationships?kind=${kind}&cursor=${encodeURIComponent(result.nextCursor)}`}>Next assignment page</Link></p> : null}
      </> : <p>Assignments are not available.</p>}
      <p><Link href={kind === 'coach_assignments' ? '/admin/coaches' : '/admin/departments'}>Manage these assignments</Link></p>
    </main>
  </>;
}
