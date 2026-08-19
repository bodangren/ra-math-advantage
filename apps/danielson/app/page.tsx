import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { requireDanielsonSession } from '@/lib/auth/server';

export default async function HomePage() {
  const { account } = await requireDanielsonSession('/');
  const roles = Array.isArray(account?.danielsonRoles) ? account.danielsonRoles : [];
  const canObserve = roles.some((role: string) => ['hod', 'coach', 'school_head', 'slt'].includes(role));
  const isTeacher = roles.includes('teacher');
  return (
    <>
      <SiteHeader
        isAuthenticated
        showAdministration={roles.includes('sysadmin')}
        showObservations={canObserve}
        showMyObservations={isTeacher}
        showReports={canObserve}
        showMyReport={isTeacher}
      />
      <main id="main-content" className="page-shell">
        <p className="eyebrow">Teacher proficiency evidence</p>
        <h1>Welcome, {account.displayName}</h1>
        <p className="lede">Use current Danielson evidence to plan walkthroughs, complete observations, and review published results.</p>
        <section className="card" aria-labelledby="access-heading">
          <h2 id="access-heading">Current access</h2>
          <p><span className="status active">Account active</span></p>
          <p>Username: {account.username}</p>
          <p>Roles: {roles.length > 0 ? roles.join(', ') : 'No Danielson roles assigned'}</p>
          {canObserve ? <Link className="button" href="/observations">Open observations</Link> : null}{' '}
          {canObserve ? <Link className="button secondary" href="/reports">Open reports</Link> : null}{' '}
          {isTeacher ? <Link className="button secondary" href="/my-observations">View my observations</Link> : null}{' '}
          {isTeacher ? <Link className="button secondary" href="/my-report">View my report</Link> : null}{' '}
          {roles.includes('sysadmin') ? <Link className="button" href="/admin">Open administration</Link> : null}
        </section>
      </main>
    </>
  );
}
