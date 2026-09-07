import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { AdminChangeForm } from '@/components/admin-change-form';
import { requireSysadminPage, getAdministrationDirectory, getDirectoryPageHref } from '@/lib/foundation/admin-page';
import { fetchInternalQuery, internal } from '@/lib/convex/server';
import { DANIELSON_ROLES } from '@/lib/foundation/authorization';

type Assignment = { kind: string; label: string; departmentId?: string; coachAccountId?: string; teacherAccountId?: string };
export default async function AccountDetailPage({ params, searchParams }: {
  params: Promise<{ accountId: string }>;
  searchParams: Promise<{ accountCursor?: string; departmentCursor?: string; search?: string }>;
}) {
  const { accountId } = await params; const cursors = await searchParams;
  const path = `/admin/accounts/${encodeURIComponent(accountId)}`;
  const session = await requireSysadminPage(path);
  const result = await fetchInternalQuery(internal.foundation.readAdministrationAccount, { actorAccountId: session.claims.sub, accountId });
  if (result.kind === 'capacity_exceeded') throw new Error('This account exceeds the assignment display capacity.');
  if (result.kind !== 'allowed') redirect('/unauthorized');
  const directory = await getAdministrationDirectory(path, cursors);
  const account = result.account;
  const assignments = result.assignments as Assignment[];
  const fixed = (name: string, value: string) => ({ name, label: name, type: 'hidden' as const, defaultValue: value });
  const departments = directory.departmentPage.items.filter(row => row.isActive).map(row => ({ value: row.departmentId, label: row.name }));
  const people = directory.accountPage.items.filter(row => row.isActive && row.accountId !== accountId);
  return <><SiteHeader isAuthenticated showAdministration /><main id="main-content" className="page-shell report-stack">
    <h1>Manage {account.displayName}</h1><p>{account.username} · {account.isActive ? 'Active' : 'Inactive'}</p>
    <p>Roles: {account.roles.join(', ') || 'None'}</p><Link href="/admin/accounts">Back to accounts</Link>
    <details><summary>Account details</summary><p>Account ID: <code>{accountId}</code></p></details>
    <div className="card-grid">
      <section className="card"><AdminChangeForm key={`${account.displayName}-${account.username}`} endpoint="/api/admin/accounts" method="PATCH" title="Update account" submitLabel="Save account" fields={[
        fixed('kind', 'account.update'), fixed('targetAccountId', accountId), { name: 'displayName', label: 'Display name', defaultValue: account.displayName, required: true }, { name: 'username', label: 'Username', defaultValue: account.username, required: true },
      ]} /></section>
      <section className="card"><AdminChangeForm key={String(account.isActive)} endpoint="/api/admin/accounts" method="PATCH" title="Change account status" submitLabel={account.isActive ? 'Deactivate account' : 'Activate account'} fields={[
        fixed('kind', account.isActive ? 'account.deactivate' : 'account.activate'), fixed('targetAccountId', accountId),
      ]} /></section>
      {session.claims.sub !== accountId ? <section className="card"><AdminChangeForm endpoint="/api/admin/accounts" method="PATCH" title="Reset password" submitLabel="Reset password" fields={[fixed('kind', 'account.reset_password'), fixed('targetAccountId', accountId)]} /></section> : null}
      <section className="card"><AdminChangeForm endpoint="/api/admin/assignments" title="Manage role" submitLabel="Save role" fields={[
        fixed('targetAccountId', accountId), { name: 'kind', label: 'Role action', type: 'select', options: [{ value: 'role.assign', label: 'Assign role' }, { value: 'role.revoke', label: 'Revoke role' }] },
        { name: 'role', label: 'Role', type: 'select', options: DANIELSON_ROLES.map(value => ({ value, label: value.replaceAll('_', ' ') })) },
      ]} /></section>
    </div>
    <section className="card"><h2>Current assignments</h2>
      {account.isTeacher && !assignments.some(a => a.kind === 'department_membership') ? <p>No department membership.</p> : null}
      {account.isTeacher && !assignments.some(a => a.kind === 'assigned_coach') ? <p>No coach assigned.</p> : null}
      {account.roles.includes('coach') ? <p>Assigned teacher count: {assignments.filter(a => a.kind === 'coaches_teacher').length}</p> : null}
      {assignments.length === 0 ? <p>No current assignments.</p> : null}
      {assignments.map((assignment, i) => <details key={`${assignment.kind}-${i}`}><summary>{assignment.kind.replaceAll('_', ' ')}: {assignment.label}</summary>
        <AdminChangeForm endpoint={assignment.departmentId ? '/api/admin/departments' : '/api/admin/coaches'} title={`Remove assignment: ${assignment.label}`} submitLabel="Remove assignment" fields={assignment.departmentId ? [
          fixed('kind', `${assignment.kind}.revoke`), fixed('departmentId', assignment.departmentId), fixed(assignment.kind === 'department_membership' ? 'teacherAccountId' : 'accountId', accountId),
        ] : [fixed('kind', 'coach_assignment.revoke'), fixed('coachAccountId', assignment.coachAccountId!), fixed('teacherAccountId', assignment.teacherAccountId!)]} />
      </details>)}
    </section>
    <section className="card"><h2>Add assignments</h2>
      <form method="get" className="form-stack"><label htmlFor="assignment-person-search">Find a coach or teacher by name</label><input id="assignment-person-search" name="search" defaultValue={cursors.search} /><button>Find people</button></form>
      {account.isTeacher ? <AdminChangeForm endpoint="/api/admin/departments" title="Assign department" submitLabel="Assign department" fields={[
        fixed('kind', 'department_membership.assign'), fixed('teacherAccountId', accountId), { name: 'departmentId', label: 'Department', type: 'select', required: true, options: departments },
      ]} /> : null}
      {account.roles.includes('hod') ? <AdminChangeForm endpoint="/api/admin/departments" title="Assign department leadership" submitLabel="Assign department leadership" fields={[
        fixed('kind', 'hod_assignment.assign'), fixed('accountId', accountId), { name: 'departmentId', label: 'Department', type: 'select', required: true, options: departments },
      ]} /> : null}
      {account.isTeacher ? <AdminChangeForm endpoint="/api/admin/coaches" title="Assign coach" submitLabel="Assign coach" fields={[
        fixed('kind', 'coach_assignment.assign'), fixed('teacherAccountId', accountId), { name: 'coachAccountId', label: 'Coach', type: 'select', required: true, options: people.filter(p => p.roles.includes('coach')).map(p => ({ value: p.accountId, label: p.displayName })) },
      ]} /> : null}
      {account.roles.includes('coach') ? <AdminChangeForm endpoint="/api/admin/coaches" title="Assign teacher" submitLabel="Assign teacher" fields={[
        fixed('kind', 'coach_assignment.assign'), fixed('coachAccountId', accountId), { name: 'teacherAccountId', label: 'Teacher', type: 'select', required: true, options: people.filter(p => p.isTeacher).map(p => ({ value: p.accountId, label: p.displayName })) },
      ]} /> : null}
      {directory.accountPage.nextCursor ? <p><Link href={getDirectoryPageHref(path, { ...cursors, accountCursor: directory.accountPage.nextCursor })}>Next people page</Link></p> : null}
      {directory.departmentPage.nextCursor ? <p><Link href={getDirectoryPageHref(path, { ...cursors, departmentCursor: directory.departmentPage.nextCursor })}>Next department page</Link></p> : null}
    </section>
  </main></>;
}
