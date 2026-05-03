import { Footer as SharedFooter } from '@math-platform/app-shell/layout';

const sections = [
  {
    title: 'Quick Links',
    links: [
      { href: '/preface', label: 'Preface' },
      { href: '/curriculum', label: 'Curriculum' },
    ],
  },
  {
    title: 'Teacher Resources',
    links: [
      { href: '/teacher/dashboard', label: 'Teacher Dashboard' },
      { href: '/teacher/gradebook', label: 'Gradebook' },
    ],
  },
];

export function Footer() {
  return (
    <SharedFooter
      brandName="Integrated Math 3"
      brandDescription="An interactive textbook for Integrated Math 3."
      brandIcon="∫"
      copyright="© 2025 Daniel Bodanske"
      accentColor="oklch(0.46 0.18 264)"
      bgClassName="bg-slate-dark"
      sections={sections}
    />
  );
}
