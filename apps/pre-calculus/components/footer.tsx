import { Footer as FooterBase } from "@math-platform/app-shell/layout";

const sections = [
  {
    title: "Quick Links",
    links: [
      { href: "/preface", label: "Preface" },
      { href: "/curriculum", label: "Curriculum" },
    ],
  },
  {
    title: "Teacher Resources",
    links: [
      { href: "/teacher/dashboard", label: "Teacher Dashboard" },
      { href: "/teacher/gradebook", label: "Gradebook" },
    ],
  },
];

export function Footer() {
  return (
    <FooterBase
      brandName="AP Precalculus"
      brandDescription="An interactive course platform for AP Precalculus."
      brandIcon="\u222B"
      sections={sections}
      copyright="© 2026 Daniel Bodanske"
      accentColor="oklch(0.55 0.20 275)"
    />
  );
}
