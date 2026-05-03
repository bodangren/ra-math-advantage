'use client';

import { HeaderSimple as SharedHeaderSimple } from '@math-platform/app-shell/layout';
import { UserMenu } from '@/components/user-menu';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/preface', label: 'Preface' },
  { href: '/curriculum', label: 'Curriculum' },
];

export function HeaderSimple() {
  return (
    <SharedHeaderSimple
      navItems={navItems}
      brandFull="Integrated Math 3"
      brandShort="IM3"
      brandIcon="∫"
      brandSubtitle="Interactive Textbook"
      accentColor="oklch(0.62 0.18 264)"
      bgClassName="bg-slate-dark"
      userMenu={<UserMenu />}
    />
  );
}
