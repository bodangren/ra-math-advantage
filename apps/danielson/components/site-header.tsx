import Link from 'next/link';
import { LogoutButton } from '@math-platform/app-shell';

export function SiteHeader({ isAuthenticated = false, showAdministration = false }: { isAuthenticated?: boolean; showAdministration?: boolean }) {
  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="site-header-inner">
        <Link className="brand" href="/">Danielson Teacher Growth</Link>
        {isAuthenticated ? (
          <nav className="site-nav" aria-label="Main navigation">
            <Link href="/">Overview</Link>
            {showAdministration ? <Link href="/admin">Administration</Link> : null}
            <LogoutButton className="button secondary" redirectTo="/auth/login" />
          </nav>
        ) : null}
      </div>
    </header>
  );
}
