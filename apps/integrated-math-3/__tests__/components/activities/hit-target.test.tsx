// Phase 2 — Red-phase activity component hit-target contract test.
//
// Track: responsive-mobile-audit_20260605
// Spec:  measure/tracks/responsive-mobile-audit_20260605/spec.md (FR2 / AC2)
// Strategy: measure/tracks/responsive-mobile-audit_20260605/test-strategy.md
//           §1 (Phase 2 — "Unit (extracted layout-logic helpers) + component
//           (hit-target / no-overflow) middle; e2e (guard on activity routes)
//           apex."),
//           §5 (Phase 2: "TDD any layout helper (hit-target/overflow math)
//           with unit tests; add component tests asserting min hit-target +
//           no horizontal overflow at phone/tablet for GraphingCanvas,
//           solver, quiz, dialog, LessonStepper, nav."),
//           §7 (Phase 2 — Red proof command, bounded):
//               CI=true npm run test --workspace=apps/integrated-math-3 -- \
//                 __tests__/components/activities/hit-target.test.tsx \
//                 -t "min hit target"
//           §8 ("Any new helper test Red before its implementation is owned
//           by its [~] task, scoped to a single file/grep so it cannot trip
//           the aggregate `vitest run`.")
//
// This is a SELF-CONTAINED Red — no new source files, no Playwright runner.
// The 44×44 contract (audit findings #11, #13) is asserted by inspecting the
// rendered DOM: Tailwind class strings (h-11 / min-h-[44px] / min-w-[44px])
// AND inline `style` overrides. A pure-TS predicate classifies the rendered
// element so the assertion is not coupled to a specific Tailwind form.
//
// At HEAD every assertion in this file FAILS:
//   - `ComprehensionQuiz` practice-mode submit button: `py-2` only
//     (~32px height) — no min hit-target sizing (audit #13).
//   - `StepByStepSolverActivity` guided-mode "Next" button: `py-2`
//     (~32px) — same gap.
//   - `GraphingCanvas` SVG: no `touch-action` style on the host SVG,
//     so touch pan/zoom is uncontrolled (audit #11 — "Placing points
//     precisely on touch screens causes unintended page scrolling").
//
// The Phase 2 Green role implements the remediation; this test then turns
// green without test changes.
//
// Resolution from the test file's location (lessons-learned 2026-05-03):
// `fileURLToPath(import.meta.url)` + `dirname()` — never `process.cwd()`.

import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComprehensionQuiz } from '@math-platform/activity-components/quiz';
import { GraphingCanvas } from '@math-platform/activity-components/graphing';
import { StepByStepSolverActivity } from '@/components/activities/algebraic/StepByStepSolverActivity';
import 'katex/dist/katex.min.css';

// Strategy §2 + audit-finding contract: 44×44 minimum touch target, shared
// with the wcag-aa-remediation track (test-strategy §2). Pixel and rem forms
// are both accepted so authors can pick a Tailwind arbitrary-value form.
const MIN_HIT_TARGET_PX = 44;

const HIT_TARGET_CLASS_PATTERNS: ReadonlyArray<RegExp> = [
  // Direct Tailwind class forms (pixel / rem / half-step / Tailwind 44 step).
  /\bmin-h-\[\s*44px\s*\]/i,
  /\bmin-w-\[\s*44px\s*\]/i,
  /\bmin-h-\[\s*2\.75rem\s*\]/i,
  /\bmin-w-\[\s*2\.75rem\s*\]/i,
  // Tailwind named scale: h-11 / w-11 / min-h-11 / min-w-11 = 44px.
  /\bh-11\b/i,
  /\bw-11\b/i,
  /\bmin-h-11\b/i,
  /\bmin-w-11\b/i,
  // Larger forms (48, 12, 14, 16) all satisfy the 44 minimum.
  /\bmin-h-\[\s*(?:4[8-9]|[5-9]\d|\d{3,})px\s*\]/i,
  /\bmin-w-\[\s*(?:4[8-9]|[5-9]\d|\d{3,})px\s*\]/i,
];

function meetsHitTargetContract(el: Element): boolean {
  // Either the class declares the contract or the inline style declares it.
  // We require BOTH axes when neither is explicit (height-only classes fail
  // the width axis contract).
  const className = el.getAttribute('class') ?? '';
  const styleAttr = el.getAttribute('style') ?? '';
  // Inline style escape hatch: explicit min-height/min-width ≥ 44px counts.
  const mh = /min-height\s*:\s*([0-9.]+)px/i.exec(styleAttr);
  const mw = /min-width\s*:\s*([0-9.]+)px/i.exec(styleAttr);
  const heightOk = mh ? parseFloat(mh[1]) >= MIN_HIT_TARGET_PX : true;
  const widthOk = mw ? parseFloat(mw[1]) >= MIN_HIT_TARGET_PX : true;
  if (heightOk && widthOk && (mh || mw)) return true;
  // Otherwise require both axes from class-based sizing at the 11 step or
  // min-[44px] arbitrary-value form.
  const hasHeightClass = HIT_TARGET_CLASS_PATTERNS.some(
    (re) => /\b(min-h|h)-/i.test(re.source) && re.test(className),
  );
  const hasWidthClass = HIT_TARGET_CLASS_PATTERNS.some(
    (re) => /\b(min-w|w)-/i.test(re.source) && re.test(className),
  );
  return hasHeightClass && hasWidthClass;
}

describe('Phase 2 — activity components min hit target (FR2 / AC2, audit #11 + #13)', () => {
  describe('min hit target', () => {
    it('ComprehensionQuiz practice-mode submit button meets 44x44 min hit target', async () => {
      // Audit finding #13: "Quiz/activity submit buttons ... lack minimum
      // touch target sizing." Current submit button is `px-6 py-2` =
      // ~32px height. The Green role must add `min-h-[44px]` (or an
      // equivalent Tailwind/inline form) to the submit button.
      const user = userEvent.setup();
      const props = {
        activityId: 'quiz-hit-target',
        mode: 'practice' as const,
        questions: [
          {
            id: 'q1',
            type: 'true_false' as const,
            prompt: 'Touch targets should be at least 44x44.',
            options: ['True', 'False'],
            correctAnswer: 'True',
          },
        ],
        onSubmit: () => {},
      };

      render(<ComprehensionQuiz {...props} />);
      await user.click(screen.getByText('True'));
      const submit = await screen.findByText(/submit/i, {}, { timeout: 2000 });
      expect(
        meetsHitTargetContract(submit),
        'ComprehensionQuiz practice-mode submit button must meet 44x44 hit target ' +
          '(audit #13). Current rendered classes: ' +
          (submit.getAttribute('class') ?? '(none)') +
          ' / inline style: ' +
          (submit.getAttribute('style') ?? '(none)'),
      ).toBe(true);
    });

    it('StepByStepSolverActivity guided-mode Next button meets 44x44 min hit target', async () => {
      // Audit finding #13 (generalised): "interactive controls lack minimum
      // touch target sizing." The StepByStepper Next button uses `py-2` =
      // ~32px height in guided mode. The Green role must remediate.
      const steps = [
        {
          expression: 'x^2 + 5x + 6',
          explanation: 'Write the quadratic in standard form',
          distractors: ['x + 5', '2x + 3'],
        },
        {
          expression: '(x + 2)(x + 3)',
          explanation: 'Factor the trinomial',
          distractors: ['(x - 2)(x - 3)', '(x + 1)(x + 6)'],
        },
      ];

      render(
        <StepByStepSolverActivity
          activityId="solver-hit-target"
          mode="guided"
          steps={steps}
          equation="x^2 + 5x + 6 = 0"
          problemType="factoring"
        />,
      );

      // Guided mode renders the first step with three options (correct +
      // 2 distractors). KaTeX fragments the expression across nested
      // spans, so match the option button by its concatenated textContent
      // (mirrors the pattern in StepByStepper-guided.test.tsx).
      const options = await screen.findAllByRole('button');
      const correctButton = options.find((btn) =>
        (btn.textContent ?? '').includes('x^2 + 5x + 6'),
      );
      expect(correctButton, 'guided mode must render a correct option button').toBeDefined();

      // fireEvent bypasses userEvent timing jitter; we only need to flip
      // the component into the post-explanation state where the Next
      // button renders.
      const { fireEvent } = await import('@testing-library/react');
      fireEvent.click(correctButton!);

      const nextButton = await screen.findByText('Next');
      expect(
        meetsHitTargetContract(nextButton),
        'StepByStepSolverActivity guided-mode Next button must meet 44x44 hit target ' +
          '(audit #13). Current rendered classes: "' +
          (nextButton.getAttribute('class') ?? '(none)') +
          '" / inline style: "' +
          (nextButton.getAttribute('style') ?? '(none)') +
          '"',
      ).toBe(true);

      await waitFor(() => expect(nextButton).toBeInTheDocument());
    });

    it('GraphingCanvas SVG declares a touch-action style for touch pan/zoom', () => {
      // Audit finding #11 (critical): "GraphingCanvas ... has no
      // `touch-action` handling, no `pointer: coarse` media query, and no
      // pan/zoom. Placing points precisely on touch screens causes
      // unintended page scrolling." The Green role must add
      // `touch-action: none` (or `pan-x pan-y` / `manipulation`) to the
      // SVG's inline style or className so touch events don't bubble to
      // page scroll.
      render(
        <GraphingCanvas
          domain={[-10, 10]}
          range={[-10, 10]}
          functions={[]}
          points={[]}
          width={600}
          height={400}
        />,
      );

      const svg = screen.getByRole('img');
      const className = svg.getAttribute('class') ?? '';
      const style = svg.getAttribute('style') ?? '';
      // Acceptable forms: inline `touch-action: <value>` declaration OR
      // a Tailwind `touch-action-*` utility (none / pan-x / pan-y / etc.).
      const hasInlineTouchAction = /touch-action\s*:/i.test(style);
      const hasTailwindTouchAction = /\btouch-action-(?:none|pan-x|pan-y|manipulation|pinch-zoom|auto)\b/.test(
        className,
      );
      expect(
        hasInlineTouchAction || hasTailwindTouchAction,
        'GraphingCanvas SVG must declare a touch-action style so touch pan/zoom is controlled ' +
          '(audit #11 — touch scrolling interferes with point placement). ' +
          'Inline style: "' + style + '" / className: "' + className + '"',
      ).toBe(true);
    });
  });
});
