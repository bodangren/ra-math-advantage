'use client';

import { useAuth } from '@math-platform/app-shell';
import { createContext, useContext, type CSSProperties, type ReactNode } from 'react';
import type { OrganizationBranding as OrganizationBrandingValue } from '@/lib/organization-branding';

function profileBranding(metadata: Record<string, unknown> | null | undefined) {
  const value = metadata?.organizationBranding;
  if (!value || typeof value !== 'object') return null;
  const branding = value as Record<string, unknown>;
  return typeof branding.primaryColor === 'string' && typeof branding.accentColor === 'string'
    ? branding as OrganizationBrandingValue
    : null;
}

const OrganizationBrandingContext = createContext<OrganizationBrandingValue | undefined>(undefined);

export function useOrganizationBranding() {
  return useContext(OrganizationBrandingContext);
}

export function OrganizationBranding({
  children,
  publicBranding,
}: {
  children: ReactNode;
  publicBranding?: OrganizationBrandingValue;
}) {
  const { profile } = useAuth();
  const branding = profileBranding(profile?.metadata) ?? publicBranding;
  const style = branding ? {
    '--brand-primary': branding.primaryColor,
    '--brand-accent': branding.accentColor,
  } as CSSProperties : undefined;

  return (
    <OrganizationBrandingContext.Provider value={branding}>
      <div data-testid="organization-branding" style={style}>{children}</div>
    </OrganizationBrandingContext.Provider>
  );
}
