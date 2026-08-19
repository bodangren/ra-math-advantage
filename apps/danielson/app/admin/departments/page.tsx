import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { getAdministrationDirectory, getDirectoryPageHref } from '@/lib/foundation/admin-page';
import { AdminChangeForm } from '@/components/admin-change-form';

export default async function DepartmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ accountCursor?: string; departmentCursor?: string }>;
}) {
  const cursors = await searchParams;
  const directory = await getAdministrationDirectory('/admin/departments', cursors);
  const accounts = directory.accountPage.items;
  const departments = directory.departmentPage.items;
  const departmentOptions = departments.map((department) => ({
    value: department.departmentId,
    label: `${department.name} (${department.key})`,
  }));
  const accountOptions = accounts.map((account) => ({
    value: account.accountId,
    label: `${account.displayName} (${account.username})`,
  }));
  const teacherOptions = accounts.filter((account) => account.isTeacher).map((account) => ({
    value: account.accountId,
    label: `${account.displayName} (${account.username})`,
  }));
  return (
    <>
      <SiteHeader isAuthenticated showAdministration />
      <main id="main-content" className="page-shell">
        <p className="eyebrow">Administration / departments</p>
        <h1>Departments</h1>
        <p className="lede">Create and maintain department records. Assign teachers to departments before you assign HOD access.</p>
        <section className="card" aria-labelledby="department-directory-heading">
          <h2 id="department-directory-heading">Current departments</h2>
          <div className="table-wrap"><table>
            <thead><tr><th scope="col">Department</th><th scope="col">Key</th><th scope="col">Status</th><th scope="col">Department ID</th></tr></thead>
            <tbody>{departments.map((department) => <tr key={department.departmentId}>
              <td>{department.name}</td><td>{department.key}</td>
              <td>{department.isActive ? 'Active' : 'Inactive'}</td>
              <td><code>{department.departmentId}</code></td>
            </tr>)}</tbody>
          </table></div>
          <nav aria-label="Directory pages">
            {directory.accountPage.nextCursor ? <p><Link href={getDirectoryPageHref('/admin/departments', {
              accountCursor: directory.accountPage.nextCursor,
              departmentCursor: cursors.departmentCursor,
            })}>Next account page</Link></p> : null}
            {directory.departmentPage.nextCursor ? <p><Link href={getDirectoryPageHref('/admin/departments', {
              accountCursor: cursors.accountCursor,
              departmentCursor: directory.departmentPage.nextCursor,
            })}>Next department page</Link></p> : null}
          </nav>
        </section>
        <div className="card narrow">
          <AdminChangeForm endpoint="/api/admin/departments" title="Create department" submitLabel="Create department" fields={[
            { name: 'kind', label: 'Action', type: 'select', required: true, options: [{ value: 'department.create', label: 'Create department' }] },
            { name: 'key', label: 'Department key', required: true },
            { name: 'name', label: 'Department name', required: true },
          ]} />
        </div>
        <div className="card-grid" style={{ marginTop: '1rem' }}>
          <div className="card"><AdminChangeForm endpoint="/api/admin/departments" title="Update department" submitLabel="Save department" fields={[
            { name: 'kind', label: 'Action', type: 'select', required: true, options: [{ value: 'department.update', label: 'Update' }] },
            { name: 'departmentId', label: 'Department', type: 'select', required: true, options: departmentOptions },
            { name: 'key', label: 'Department key' },
            { name: 'name', label: 'Department name' },
          ]} /></div>
          <div className="card"><AdminChangeForm endpoint="/api/admin/departments" title="Change department status" submitLabel="Save status" fields={[
            { name: 'kind', label: 'Action', type: 'select', required: true, options: [{ value: 'department.activate', label: 'Activate' }, { value: 'department.deactivate', label: 'Deactivate' }] },
            { name: 'departmentId', label: 'Department', type: 'select', required: true, options: departmentOptions },
          ]} /></div>
          <div className="card"><AdminChangeForm endpoint="/api/admin/departments" title="Manage teacher membership" submitLabel="Save membership" fields={[
            { name: 'kind', label: 'Action', type: 'select', required: true, options: [{ value: 'department_membership.assign', label: 'Assign teacher' }, { value: 'department_membership.revoke', label: 'Revoke teacher' }] },
            { name: 'departmentId', label: 'Department', type: 'select', required: true, options: departmentOptions },
            { name: 'teacherAccountId', label: 'Teacher', type: 'select', required: true, options: teacherOptions },
          ]} /></div>
          <div className="card"><AdminChangeForm endpoint="/api/admin/departments" title="Manage HOD assignment" submitLabel="Save HOD assignment" fields={[
            { name: 'kind', label: 'Action', type: 'select', required: true, options: [{ value: 'hod_assignment.assign', label: 'Assign HOD' }, { value: 'hod_assignment.revoke', label: 'Revoke HOD' }] },
            { name: 'departmentId', label: 'Department', type: 'select', required: true, options: departmentOptions },
            { name: 'accountId', label: 'HOD account', type: 'select', required: true, options: accountOptions },
          ]} /></div>
        </div>
        <p><Link href="/admin">Back to administration</Link></p>
      </main>
    </>
  );
}
