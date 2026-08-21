'use client';

import Link from 'next/link';
import Image from 'next/image';
import { LogoutButton } from '@math-platform/app-shell';
import { useOrganizationBranding } from '@/components/organization-branding';
import type { OrganizationBranding } from '@/lib/organization-branding';

export function SiteHeader({
  isAuthenticated = false,
  showAdministration = false,
  showObservations = false,
  showMyObservations = false,
  showReports = false,
  showMyReport = false,
  showImprovementPlans = false,
  organizationName,
  branding,
}: {
  isAuthenticated?: boolean;
  showAdministration?: boolean;
  showObservations?: boolean;
  showMyObservations?: boolean;
  showReports?: boolean;
  showMyReport?: boolean;
  showImprovementPlans?: boolean;
  organizationName?: string;
  branding?: OrganizationBranding;
}) {
  const shellBrand = useOrganizationBranding();
  const currentBranding = shellBrand.branding ?? branding;
  const currentOrganizationName = shellBrand.organizationName ?? organizationName ?? currentBranding?.displayName;

  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="site-header-inner">
        <Link className="brand" href="/">
          {currentBranding?.logoPath && currentOrganizationName ? (
            <Image
              src={currentBranding.logoPath}
              alt={`${currentOrganizationName} logo`}
              width={169}
              height={38}
              unoptimized
            />
          ) : null}
          {currentBranding ? (
            <span className="brand-text">
              <strong>{currentBranding.displayName}</strong>
              <span>Danielson Teacher Growth</span>
            </span>
          ) : 'Danielson Teacher Growth'}
        </Link>
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
