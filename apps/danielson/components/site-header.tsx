import Link from 'next/link';
import { LogoutButton } from '@math-platform/app-shell';

export function SiteHeader({
  isAuthenticated = false,
  showAdministration = false,
  showObservations = false,
  showMyObservations = false,
  showReports = false,
  showMyReport = false,
  showImprovementPlans = false,
}: {
  isAuthenticated?: boolean;
  showAdministration?: boolean;
  showObservations?: boolean;
  showMyObservations?: boolean;
  showReports?: boolean;
  showMyReport?: boolean;
  showImprovementPlans?: boolean;
}) {
  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="site-header-inner">
        <Link className="brand" href="/">Danielson Teacher Growth</Link>
        {isAuthenticated ? (
          <nav className="site-nav" aria-label="Main navigation">
            <Link href="/">Overview</Link>
            {showObservations ? <Link href="/observations">Observations</Link> : null}
            {showMyObservations ? <Link href="/my-observations">My observations</Link> : null}
            {showReports ? <Link href="/reports">Reports</Link> : null}
            {showImprovementPlans ? <Link href="/improvement-plans">Improvement plans</Link> : null}
            {showMyReport ? <Link href="/my-report">My report</Link> : null}
            {showAdministration ? <Link href="/admin">Administration</Link> : null}
            <LogoutButton className="button secondary" redirectTo="/auth/login" />
          </nav>
        ) : null}
      </div>
    </header>
  );
}
