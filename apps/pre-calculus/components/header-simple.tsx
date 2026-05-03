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
      brandFull="AP Precalculus"
      brandShort="APPC"
      brandIcon="\u222B"
      brandSubtitle="Interactive Course"
      accentColor="oklch(0.55 0.20 275)"
      userMenu={<UserMenu />}
    />
  );
}
