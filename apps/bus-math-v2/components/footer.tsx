import { Footer as SharedFooter } from '@math-platform/app-shell/layout';

const sections = [
  {
    title: 'Quick Links',
    links: [
      { href: '/preface', label: 'Getting Started' },
      { href: '/backmatter/glossary', label: 'Glossary' },
      { href: '/search', label: 'Search' },
      { href: '/capstone', label: 'Capstone' },
    ],
  },
  {
    title: 'Teacher Resources',
    links: [
      { href: '/teacher/course-overview/pbl-methodology', label: 'PBL Methodology' },
      { href: '/teacher/course-overview/backward-design', label: 'Backward Design' },
      { href: '/teacher', label: 'Teacher Dashboard' },
    ],
  },
  {
    title: 'Support',
    links: [],
  },
];

export function Footer() {
  return (
    <SharedFooter
      brandName="Math for Business Operations"
      brandDescription="An interactive Grade 12 textbook blending applied accounting with Excel automation."
      brandIcon="∑"
      copyright="© 2025 Daniel Bodanske"
      accentColor="oklch(0.43 0.14 157)"
      bgClassName="bg-forest-dark"
      sections={sections}
    />
  );
}
