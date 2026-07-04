import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StudentNavigation } from '@/components/student/StudentNavigation';
import { LessonPageLayout } from '@/components/textbook/LessonPageLayout';
import { runAxeOnRendered } from '@/lib/a11y/harness';

describe('StudentNavigation a11y (Task 9 Group A/B)', () => {
  it('renders a skip-to-content link as the first focusable element', () => {
    const { container } = render(
      <div>
        <StudentNavigation activeRoute="/student/dashboard" />
        <main id="main-content" tabIndex={-1}>content</main>
      </div>,
    );

    const skipLink = container.querySelector('a[href="#main-content"]');
    expect(skipLink, 'skip-to-content link exists pointing to #main-content').not.toBeNull();
    const focusables = container.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    const firstFocusable = focusables[0];
    expect(firstFocusable?.getAttribute('href')).toBe('#main-content');
    expect(firstFocusable?.classList.contains('sr-only'), 'skip link is visually hidden by default (sr-only)').toBe(true);
  });

  it('marks the active nav item with aria-current="page" and only one such item exists', () => {
    render(
      <div>
        <StudentNavigation activeRoute="/student/dashboard" />
        <main id="main-content">content</main>
      </div>,
    );

    const current = screen.getAllByRole('link', { current: 'page' });
    expect(current.length, 'exactly one link has aria-current="page"').toBe(1);
    expect(current[0].textContent?.trim()).toBe('Dashboard');
    const lessons = screen.getByRole('link', { name: 'Lessons' });
    expect(lessons.getAttribute('aria-current')).toBeNull();
  });

  it('wraps navigation in <nav aria-label> and exposes one main landmark', () => {
    render(
      <div>
        <StudentNavigation activeRoute="/student/dashboard" />
        <main id="main-content" tabIndex={-1}>content</main>
      </div>,
    );

    const nav = screen.getByRole('navigation', { name: /student navigation/i });
    expect(nav).toBeTruthy();
    expect(screen.getByRole('main')).toBeTruthy();
  });
});

describe('LessonPageLayout a11y (Task 9 Group C/D/E)', () => {
  const samplePhases = [
    { phaseType: 'engage' as const, label: 'Engage', completed: false, isCurrent: true },
    { phaseType: 'explore' as const, label: 'Explore', completed: false, isCurrent: false },
    { phaseType: 'explain' as const, label: 'Explain', completed: false, isCurrent: false },
  ];

  it('renders exactly one h1 and phase headings do not create h1->h3 jumps', async () => {
    const results = await runAxeOnRendered(
      <LessonPageLayout
        lessonTitle="Quadratics"
        moduleLabel="Unit 3"
        lessonNumber={2}
        phases={samplePhases}
      >
        <section>
          <h2>Engage</h2>
          <p>Body content</p>
        </section>
      </LessonPageLayout>,
    );

    expect(results.violations.filter((v) => v.id === 'heading-order')).toHaveLength(0);
    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s.length).toBe(1);
  });

  it('wraps main content in <main id="main"> so the skip link target exists', () => {
    render(
      <LessonPageLayout
        lessonTitle="Quadratics"
        moduleLabel="Unit 3"
        lessonNumber={2}
        phases={samplePhases}
      >
        <p>Body</p>
      </LessonPageLayout>,
    );

    const main = screen.getByRole('main');
    expect(main.id).toBe('main');
  });

  it('applies aria-current="step" to the current phase button in the stepper', () => {
    render(
      <LessonPageLayout
        lessonTitle="Quadratics"
        moduleLabel="Unit 3"
        lessonNumber={2}
        phases={samplePhases}
      >
        <p>Body</p>
      </LessonPageLayout>,
    );

    const currentSteps = screen.getAllByRole('button', { current: 'step' });
    expect(currentSteps.length).toBe(1);
  });
});
