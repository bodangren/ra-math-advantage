import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { requireSysadminPage } from '@/lib/foundation/admin-page';

export default async function AdminPage() {
  const { account } = await requireSysadminPage('/admin');
  return (
    <>
      <SiteHeader isAuthenticated showAdministration />
      <main id="main-content" className="page-shell">
        <p className="eyebrow">System administration</p>
        <h1>Manage access</h1>
        <p className="lede">Manage accounts, departments, and supervisor assignments. This role does not grant access to teacher evaluation records.</p>
        <p><span className="status active">Signed in as {account.displayName}</span></p>
        <nav className="admin-links" aria-label="Administration sections">
          <Link href="/admin/accounts"><strong>Accounts and roles</strong><br />Create accounts and manage current role assignments.</Link>
          <Link href="/admin/departments"><strong>Departments</strong><br />Manage departments and teacher membership.</Link>
          <Link href="/admin/coaches"><strong>Coach assignments</strong><br />Assign coaches to teachers.</Link>
        </nav>
      </main>
    </>
  );
}
