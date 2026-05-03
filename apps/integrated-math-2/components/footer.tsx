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
      brandName="Integrated Math 2"
      brandDescription="An interactive course platform for Integrated Math 2."
      brandIcon="2"
      sections={sections}
      copyright="© 2026 Daniel Bodanske"
      accentColor="oklch(0.55 0.19 40)"
    />
  );
}
