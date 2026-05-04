"use client";

import { HeaderSimple as HeaderSimpleBase } from "@math-platform/app-shell/layout";
import { UserMenu } from "@math-platform/app-shell/components";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/curriculum", label: "Curriculum" },
];

export function HeaderSimple() {
  return (
    <HeaderSimpleBase
      navItems={navItems}
      brandFull="Integrated Math 1"
      brandShort="IM1"
      brandIcon="1"
      brandSubtitle="Interactive Course"
      accentColor="oklch(0.55 0.19 40)"
      userMenu={<UserMenu />}
    />
  );
}
