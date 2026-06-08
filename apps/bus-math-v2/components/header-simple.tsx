'use client';

import { HeaderSimple as SharedHeaderSimple } from '@math-platform/app-shell/layout';
import { UserMenu } from '@/components/user-menu';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/preface', label: 'Preface' },
  { href: '/curriculum', label: 'Curriculum' },
  { href: '/capstone', label: 'Capstone' },
  { href: '/backmatter/glossary', label: 'Glossary' },
  { href: '/search', label: 'Search' },
];


/**
 * Renders a simplified site header with navigation links and user menu.
 *
 * @returns The shared header component configured for this app
 */
export function HeaderSimple() {
  return (
    <SharedHeaderSimple
      navItems={navItems}
      brandFull="Math for Business Operations"
      brandShort="Math for Business"
      brandIcon="∑"
      brandSubtitle="Applied Accounting · Excel"
      accentColor="oklch(0.60 0.16 157)"
      bgClassName="bg-forest-dark"
      userMenu={<UserMenu />}
    />
  );
}
