import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { requireDanielsonSession } from '@/lib/auth/server';

export default async function HomePage() {
  const { account } = await requireDanielsonSession('/');
  const roles = Array.isArray(account?.danielsonRoles) ? account.danielsonRoles : [];
  return (
    <>
      <SiteHeader isAuthenticated showAdministration={roles.includes('sysadmin')} />
      <main id="main-content" className="page-shell">
        <p className="eyebrow">Teacher proficiency evidence</p>
        <h1>Welcome, {account.displayName}</h1>
        <p className="lede">This workspace keeps Danielson access, roles, and assignments current. Evaluation records will appear here in later application tracks.</p>
        <section className="card" aria-labelledby="access-heading">
          <h2 id="access-heading">Current access</h2>
          <p><span className="status active">Account active</span></p>
          <p>Username: {account.username}</p>
          <p>Roles: {roles.length > 0 ? roles.join(', ') : 'No Danielson roles assigned'}</p>
          {roles.includes('sysadmin') ? <Link className="button" href="/admin">Open administration</Link> : null}
        </section>
      </main>
    </>
  );
}
