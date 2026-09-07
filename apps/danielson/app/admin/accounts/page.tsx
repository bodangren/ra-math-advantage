import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { getAdministrationDirectory, getDirectoryPageHref } from '@/lib/foundation/admin-page';
import { AccountCreateForm } from '@/components/account-create-form';
import { AdminChangeForm } from '@/components/admin-change-form';

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ accountCursor?: string }>;
}) {
  const cursors = await searchParams;
  const directory = await getAdministrationDirectory('/admin/accounts', cursors);
  const accounts = directory.accountPage.items;
  const accountOptions = accounts.map((account) => ({
    value: account.accountId,
    label: `${account.displayName} (${account.username})`,
  }));
  return (
    <>
      <SiteHeader isAuthenticated showAdministration />
      <main id="main-content" className="page-shell">
        <p className="eyebrow">Administration / accounts</p>
        <h1>Accounts and roles</h1>
        <p className="lede">Create an account or manage an existing account. The temporary password appears once after account creation.</p>
        <section className="card" aria-labelledby="account-directory-heading">
          <h2 id="account-directory-heading">Current accounts</h2>
          <div className="table-wrap"><table>
            <thead><tr><th scope="col">Name</th><th scope="col">Username</th><th scope="col">Status</th><th scope="col">Roles</th><th scope="col">Account ID</th></tr></thead>
            <tbody>{accounts.map((account) => <tr key={account.accountId}>
              <td>{account.displayName}</td><td>{account.username}</td>
              <td>{account.isActive ? 'Active' : 'Inactive'}</td>
              <td>{account.roles.length ? account.roles.join(', ') : 'None'}</td>
              <td><code>{account.accountId}</code></td>
            </tr>)}</tbody>
          </table></div>
          {directory.accountPage.nextCursor ? <p><Link href={getDirectoryPageHref('/admin/accounts', {
            accountCursor: directory.accountPage.nextCursor,
          })}>Next account page</Link></p> : null}
        </section>
        <div className="card narrow"><AccountCreateForm /></div>
        <div className="card-grid" style={{ marginTop: '1rem' }}>
          <div className="card"><AdminChangeForm endpoint="/api/admin/accounts" method="PATCH" title="Reset another account password" submitLabel="Reset password" fields={[
            { name: 'kind', label: 'Action', type: 'select', required: true, options: [{ value: 'account.reset_password', label: 'Reset password' }] },
            { name: 'targetAccountId', label: 'Account', type: 'select', required: true, options: accountOptions.filter((option) => option.value !== directory.actorAccountId) },
          ]} /></div>
          <div className="card"><AdminChangeForm endpoint="/api/admin/accounts" method="PATCH" title="Update account" submitLabel="Save account" fields={[
            { name: 'kind', label: 'Action', type: 'select', required: true, options: [{ value: 'account.update', label: 'Update account' }] },
            { name: 'targetAccountId', label: 'Account', type: 'select', required: true, options: accountOptions },
            { name: 'displayName', label: 'Display name' },
            { name: 'username', label: 'Username' },
          ]} /></div>
          <div className="card"><AdminChangeForm endpoint="/api/admin/accounts" method="PATCH" title="Change account status" submitLabel="Save status" fields={[
            { name: 'kind', label: 'Action', type: 'select', required: true, options: [{ value: 'account.activate', label: 'Activate' }, { value: 'account.deactivate', label: 'Deactivate' }] },
            { name: 'targetAccountId', label: 'Account', type: 'select', required: true, options: accountOptions },
          ]} /></div>
          <div className="card"><AdminChangeForm endpoint="/api/admin/assignments" title="Manage role" submitLabel="Save role" fields={[
            { name: 'kind', label: 'Action', type: 'select', required: true, options: [{ value: 'role.assign', label: 'Assign role' }, { value: 'role.revoke', label: 'Revoke role' }] },
            { name: 'targetAccountId', label: 'Account', type: 'select', required: true, options: accountOptions },
            { name: 'role', label: 'Danielson role', type: 'select', required: true, options: [{ value: 'teacher', label: 'Teacher' }, { value: 'hod', label: 'HOD' }, { value: 'coach', label: 'Coach' }, { value: 'school_head', label: 'School head' }, { value: 'slt', label: 'SLT' }, { value: 'sysadmin', label: 'System administrator' }] },
          ]} /></div>
        </div>
        <p><Link href="/admin">Back to administration</Link></p>
      </main>
    </>
  );
}
