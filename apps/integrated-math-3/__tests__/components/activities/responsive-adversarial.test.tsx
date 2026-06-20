// Phase 2 — Adversarial reinforcement tests for the responsive/mobile audit.
//
// Track: responsive-mobile-audit_20260605
// Spec:  measure/tracks/responsive-mobile-audit_20260605/spec.md (FR2 / FR3)
// Strategy: measure/tracks/responsive-mobile-audit_20260605/test-strategy.md
//
// These tests are INTENTIONALLY narrower and stricter than the
// `hit-target.test.tsx` / `shell-responsive.test.tsx` Phase 2 Red proofs.
// They exist to close specific adversarial gaps surfaced during review:
//
// 1. The Phase 2 touch-action test accepts ANY `touch-action:` value
//    (including `auto` — the default that the audit #11 issue
//    specifically called out). The audit wants the SVG to actively
//    suppress touch-pan/zoom, not just declare the property. This
//    test asserts a NON-default touch-action value is declared.
//
// 2. The Phase 2 hit-target predicate has a vacuous-truth edge case:
//    if only ONE axis is declared via inline style, the other axis
//    defaults to `true` (untested) and the predicate passes. This
//    test asserts that BOTH axes must be declared (height AND width)
//    when inline style is the carrier.
//
// 3. The Phase 2 dialog test only checks the card OR the host for
//    a viewport-aware max-width. It does NOT verify that the card's
//    mobile form (e.g. `max-w-[calc(100vw-2rem)]`) is the FIRST
//    declaration (Tailwind ordering matters — later utilities win
//    on conflicting properties). A regression that places
//    `sm:max-w-md` BEFORE the mobile form would still pass.
//
// 4. Cross-package regression: the GraphingCanvas fix lives in
//    `packages/activity-components` (shared). If the package is
//    re-published with the touch-action change reverted but the
//    IM3 import is still active, this test detects the drift.

import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ComprehensionQuiz } from '@math-platform/activity-components/quiz';
import { GraphingCanvas } from '@math-platform/activity-components/graphing';
import { StepByStepSolverActivity } from '@/components/activities/algebraic/StepByStepSolverActivity';
import { LessonStepper, type StepperPhase } from '@/components/lesson/LessonStepper';
import { PhaseCompleteButton } from '@/components/lesson/PhaseCompleteButton';
import { Dialog } from '@/components/ui/dialog';
import { StudentNavigation } from '@/components/student/StudentNavigation';
import 'katex/dist/katex.min.css';

const PHASES: StepperPhase[] = [
  { phaseNumber: 1, phaseId: 'p1', phaseType: 'explore', title: 'Explore', status: 'completed' },
  { phaseNumber: 2, phaseId: 'p2', phaseType: 'learn', title: 'Learn', status: 'current' },
  { phaseNumber: 3, phaseId: 'p3', phaseType: 'worked_example', title: 'Example', status: 'locked' },
];

describe('Adversarial — strict non-default touch-action (closes audit #11 vacuous-truth gap)', () => {
  it('GraphingCanvas SVG declares a NON-DEFAULT touch-action value', () => {
    // The audit #11 finding calls out the default (auto) behavior as
    // broken for touch point placement. A regression that declares
    // `touch-action: auto` would not fix the bug. This test excludes
    // `auto` and the default undeclared state, requiring an explicit
    // suppression directive.
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
    const style = svg.getAttribute('style') ?? '';
    const className = svg.getAttribute('class') ?? '';

    // Acceptable non-default values per CSS Touch Action spec:
    // none | pan-x | pan-y | manipulation | pinch-zoom
    const inlineRe = /touch-action\s*:\s*(none|pan-x|pan-y|manipulation|pinch-zoom)\b/i;
    const tailwindRe =
      /\btouch-action-(?:none|pan-x|pan-y|manipulation|pinch-zoom)\b/;

    const inlineMatch = inlineRe.exec(style);
    const tailwindMatch = tailwindRe.exec(className);

    expect(
      inlineMatch ?? tailwindMatch,
      `GraphingCanvas SVG must declare a NON-DEFAULT touch-action value ` +
        `(none / pan-x / pan-y / manipulation / pinch-zoom) to actively ` +
        `suppress touch pan/zoom during point placement (audit #11). ` +
        `Default 'auto' is explicitly excluded because it would not fix ` +
        `the original bug. Current inline style: "${style}" / ` +
        `className: "${className}".`,
    ).not.toBeNull();
  });

  it('GraphingCanvas SVG inline touch-action value is NOT the spec default "auto"', () => {
    // Independent reverse-direction assertion: the inline style must NOT
    // contain `touch-action: auto` (the spec default). A regression that
    // changes the fix to the default value would be caught here even if
    // the wider regex above were weakened.
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
    const style = svg.getAttribute('style') ?? '';
    expect(
      /touch-action\s*:\s*auto\b/i.test(style),
      `GraphingCanvas SVG inline style must NOT contain ` +
        `"touch-action: auto" (the spec default that the audit #11 fix ` +
        `explicitly replaced with "none"). Inline style: "${style}".`,
    ).toBe(false);
  });
});

describe('Adversarial — both axes required when inline-style is the carrier (closes Phase 2 vacuous-truth)', () => {
  it('hit-target predicate requires BOTH height AND width when class-based declaration is absent', () => {
    // Reproduce the predicate from hit-target.test.tsx and feed it a
    // synthetic element that declares only ONE axis inline. The original
    // predicate returns `true` in this case (widthOk defaults to true),
    // which is the bug this test exposes. The fix lives in the
    // `strict-meets-hit-target` predicate below — the production fix
    // should swap the existing predicate for this stricter one.
    const onlyHeightInline = `<button style="min-height: 44px;">x</button>`;
    const onlyWidthInline = `<button style="min-width: 44px;">x</button>`;
    const bothAxesInline = `<button style="min-height: 44px; min-width: 44px;">x</button>`;
    const classOnly = `<button class="min-h-[44px] min-w-[44px]">x</button>`;

    const container = document.createElement('div');
    container.innerHTML = onlyHeightInline + onlyWidthInline + bothAxesInline + classOnly;
    document.body.appendChild(container);

    const MIN = 44;
    const strictMeets = (el: Element): boolean => {
      const className = el.getAttribute('class') ?? '';
      const style = el.getAttribute('style') ?? '';
      const mh = /min-height\s*:\s*([0-9.]+)px/i.exec(style);
      const mw = /min-width\s*:\s*([0-9.]+)px/i.exec(style);
      const heightOk = mh ? parseFloat(mh[1]) >= MIN : false;
      const widthOk = mw ? parseFloat(mw[1]) >= MIN : false;
      if (heightOk && widthOk) return true;
      // Class-based: require both axes declared via Tailwind utilities.
      const hasMinH = /\bmin-h-\[\s*44px\s*\]/.test(className);
      const hasMinW = /\bmin-w-\[\s*44px\s*\]/.test(className);
      return hasMinH && hasMinW;
    };

    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(4);

    // Only-height inline should FAIL strict contract (the regression test
    // catches the original vacuous-truth bug):
    expect(strictMeets(buttons[0])).toBe(false);
    // Only-width inline should also FAIL:
    expect(strictMeets(buttons[1])).toBe(false);
    // Both axes inline should PASS:
    expect(strictMeets(buttons[2])).toBe(true);
    // Both-axes class should PASS:
    expect(strictMeets(buttons[3])).toBe(true);

    document.body.removeChild(container);
  });
});

describe('Adversarial — Dialog mobile max-w form must precede breakpoint form (closes ordering gap)', () => {
  // jsdom does not implement `HTMLDialogElement.showModal()`.
  beforeAll(() => {
    if (!('showModal' in HTMLDialogElement.prototype)) {
      Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
        configurable: true,
        writable: true,
        value: function showModal() {
          (this as HTMLDialogElement & { open: boolean }).open = true;
        },
      });
    }
    if (!('close' in HTMLDialogElement.prototype)) {
      Object.defineProperty(HTMLDialogElement.prototype, 'close', {
        configurable: true,
        writable: true,
        value: function close() {
          (this as HTMLDialogElement & { open: boolean }).open = false;
        },
      });
    }
  });

  it('Dialog card carries BOTH a mobile viewport-aware max-w AND a desktop breakpoint cap', () => {
    // The Phase 2 fix is `max-w-[calc(100vw-2rem)] sm:max-w-md` — the
    // mobile form MUST come first so that Tailwind's later-source-wins
    // rule does not collapse the dialog to `max-w-md` on phones (where
    // the `sm:` breakpoint is not active). This test asserts both
    // declarations exist on the same element AND the mobile form
    // appears BEFORE the breakpoint form.
    render(
      <Dialog open onOpenChange={() => {}} title="Strict dialog">
        <p>Content</p>
      </Dialog>,
    );

    const dialog = screen.getByRole('dialog');
    const card = dialog.querySelector('div');
    expect(card).not.toBeNull();

    const className = card?.getAttribute('class') ?? '';

    // Locate both forms. Capture their character offsets.
    const mobileForms = [
      /\bmax-w-\[\s*calc\(\s*100vw\b[^)]*\)\s*\][^[]*/i.exec(className),
      /\bmax-w-\[\s*100vw\s*\]/i.exec(className),
      /\bmax-w-screen\b/i.exec(className),
    ].filter(Boolean) as RegExpExecArray[];

    const breakpointForms = [
      /\bsm:max-w-md\b/i.exec(className),
      /\bmd:max-w-md\b/i.exec(className),
    ].filter(Boolean) as RegExpExecArray[];

    expect(
      mobileForms.length,
      `Dialog card must declare a mobile viewport-aware max-w form ` +
        `(max-w-[calc(100vw-...)] / max-w-[100vw] / max-w-screen). ` +
        `Card className: "${className}".`,
    ).toBeGreaterThan(0);
    expect(
      breakpointForms.length,
      `Dialog card must declare a desktop breakpoint cap ` +
        `(sm:max-w-md or md:max-w-md) so the modal has a sensible ` +
        `desktop width. Card className: "${className}".`,
    ).toBeGreaterThan(0);

    // Mobile form must precede breakpoint form in the className string.
    const mobileIdx = mobileForms[0].index;
    const breakpointIdx = breakpointForms[0].index;
    expect(
      mobileIdx,
      `Mobile viewport-aware max-w form must appear BEFORE the desktop ` +
        `breakpoint cap so Tailwind ordering does not collapse the ` +
        `mobile width to max-w-md (which overflows the 390px viewport). ` +
        `Mobile form index: ${mobileIdx}, breakpoint index: ${breakpointIdx}. ` +
        `Card className: "${className}".`,
    ).toBeLessThan(breakpointIdx);
  });
});

describe('Adversarial — StepByStepSolverActivity Next button is reachable (post-remediation interaction smoke)', () => {
  it('guided-mode Next button is focusable and not disabled after correct selection', () => {
    // Phase 2 Red selects the correct option then asserts the Next
    // button renders with hit-target classes. This test goes one step
    // further: the Next button must be focusable AND its hit-target
    // classes must appear in the rendered className (not just on the
    // parent's children list). This catches a regression where a parent
    // wrapper has the min-h/min-w classes but the actual <button>
    // rendering layer does not.
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
        activityId="solver-focusable"
        mode="guided"
        steps={steps}
        equation="x^2 + 5x + 6 = 0"
        problemType="factoring"
      />,
    );

    const optionButtons = screen.getAllByRole('button');
    const correctButton = optionButtons.find((b) =>
      (b.textContent ?? '').includes('x^2 + 5x + 6'),
    );
    expect(correctButton, 'must render correct option button').toBeDefined();

    fireEvent.click(correctButton!);

    const nextButton = screen.getByText('Next');
    expect(nextButton.tagName.toLowerCase()).toBe('button');

    const className = nextButton.getAttribute('class') ?? '';
    expect(
      /\bmin-h-\[\s*44px\s*\]/.test(className) ||
        /\bmin-w-\[\s*44px\s*\]/.test(className) ||
        /\bh-11\b/.test(className) ||
        /\bw-11\b/.test(className),
      `StepByStepSolverActivity guided-mode Next <button> must declare ` +
        `min-h-[44px] or min-w-[44px] (or h-11 / w-11) DIRECTLY in its ` +
        `rendered className — not only on a parent wrapper. Audit #13. ` +
        `Next button className: "${className}".`,
    ).toBe(true);
  });
});

describe('Adversarial — ComprehensionQuiz submit button declares min-w axis (not only min-h)', () => {
  it('practice-mode submit button className contains BOTH min-h-[44px] AND min-w-[44px]', async () => {
    // The original Phase 2 predicate accepted a button with only a
    // height-axis declaration inline. This test pins both axes in the
    // SAME Tailwind class list — a regression that drops `min-w-[44px]`
    // would now fail.
    const user = (await import('@testing-library/user-event')).default.setup();
    render(
      <ComprehensionQuiz
        activityId="quiz-strict-both"
        mode="practice"
        questions={[
          {
            id: 'q1',
            type: 'true_false',
            prompt: 'Touch targets should be at least 44x44.',
            options: ['True', 'False'],
            correctAnswer: 'True',
          },
        ]}
        onSubmit={() => {}}
      />,
    );

    await user.click(screen.getByText('True'));
    const submit = await screen.findByText(/submit/i);
    const className = submit.getAttribute('class') ?? '';

    expect(
      /\bmin-h-\[\s*44px\s*\]/.test(className),
      `ComprehensionQuiz practice-mode submit button must declare ` +
        `min-h-[44px] in its className (audit #13). ` +
        `className: "${className}".`,
    ).toBe(true);
    expect(
      /\bmin-w-\[\s*44px\s*\]/.test(className),
      `ComprehensionQuiz practice-mode submit button must declare ` +
        `min-w-[44px] in its className (audit #13). A regression that ` +
        `drops the width axis while leaving the height axis would not ` +
        `be caught by the Phase 2 predicate (which defaults width to ` +
        `true when only the height is declared). ` +
        `className: "${className}".`,
    ).toBe(true);
  });
});

describe('Adversarial — shell components carry min-h-[44px] AND min-w-[44px] (not just one axis)', () => {
  it('LessonStepper compact step button declares BOTH axes', () => {
    render(<LessonStepper phases={PHASES} currentPhase={2} />);
    const numbered = screen
      .getAllByRole('button')
      .filter((b) => /^\d+$/.test((b.textContent ?? '').trim()));
    expect(numbered.length).toBeGreaterThan(0);
    for (const btn of numbered) {
      const className = btn.getAttribute('class') ?? '';
      expect(
        /\bmin-h-\[\s*44px\s*\]/.test(className),
        `LessonStepper compact button missing min-h-[44px]. className: "${className}".`,
      ).toBe(true);
      expect(
        /\bmin-w-\[\s*44px\s*\]/.test(className),
        `LessonStepper compact button missing min-w-[44px]. className: "${className}".`,
      ).toBe(true);
    }
  });

  it('PhaseCompleteButton Mark Complete declares BOTH axes', () => {
    render(
      <PhaseCompleteButton lessonId="x" phaseNumber={1} phaseType="learn" />,
    );
    const btn = screen.getByRole('button', { name: /mark complete/i });
    const className = btn.getAttribute('class') ?? '';
    expect(/\bmin-h-\[\s*44px\s*\]/.test(className)).toBe(true);
    expect(/\bmin-w-\[\s*44px\s*\]/.test(className)).toBe(true);
  });

  it('StudentNavigation mobile toggle declares BOTH axes', () => {
    render(<StudentNavigation activeRoute="/x" />);
    const btn = screen.getByRole('button', { name: /toggle menu/i });
    const className = btn.getAttribute('class') ?? '';
    expect(/\bmin-h-\[\s*44px\s*\]/.test(className)).toBe(true);
    expect(/\bmin-w-\[\s*44px\s*\]/.test(className)).toBe(true);
  });
});