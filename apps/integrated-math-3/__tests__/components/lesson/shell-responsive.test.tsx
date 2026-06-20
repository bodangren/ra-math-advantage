// Phase 2 — Red-phase app shell responsive contract test.
//
// Track: responsive-mobile-audit_20260605
// Spec:  measure/tracks/responsive-mobile-audit_20260605/spec.md (FR3 / AC3)
// Strategy: measure/tracks/responsive-mobile-audit_20260605/test-strategy.md
//   §1 (Phase 2: "Unit (extracted layout-logic helpers) + component
//       (hit-target / no-overflow) middle; e2e (guard on activity routes)
//       apex."),
//   §5 (Phase 2: "component tests asserting min hit-target + no horizontal
//       overflow at phone/tablet for GraphingCanvas, solver, quiz, dialog,
//       LessonStepper, nav."),
//   §7 (Phase 2 — Red proof command: the strategy pins
//       `__tests__/components/activities/hit-target.test.tsx -t "min hit target"`
//       for activity components; the sibling shell test below uses an
//       analogous bounded `-t` filter so the Red proof stays scoped to a
//       single file/grep and cannot trip the aggregate `vitest run`).
//   §8 ("Any new helper test Red before its implementation is owned by its
//       [~] task, scoped to a single file/grep so it cannot trip the
//       aggregate `vitest run`.")
//
// This test asserts the **shell/lesson-navigation** half of the audit's
// prioritized failures (audit findings #8 z-index, #9 LessonStepper scroll,
// #13 hit-targets on shell controls, #14 SubmissionDetailModal width).
// The 44×44 hit-target predicate is re-declared locally so this file is
// self-contained (matches Phase 1's self-contained unit-test pattern; the
// eventual Phase 3 helper extraction in `packages/app-shell` is out of
// Red-phase scope).
//
// At HEAD every assertion in this file FAILS:
//   - `LessonStepper` mobile (compact) buttons render at `h-9 w-9` (36×36)
//     — audit #9 + #13.
//   - `PhaseCompleteButton` mark-complete button uses Button default
//     `h-9 px-4 py-2` (36px) — audit #13.
//   - `Dialog` content uses `max-w-md` (448px), no viewport-aware cap
//     — overflows on 390px phone (audit #14 generalised).
//   - `StudentNavigation` mobile toggle uses `p-2` with a 24px icon =
//     ~40px hit target — audit #13 (under 44).
//
// Targeted Red command (bounded):
//   CI=true npm run test --workspace=apps/integrated-math-3 -- \
//     __tests__/components/lesson/shell-responsive.test.tsx -t "min hit target"
// Expected fail count at HEAD: 4/4.

import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LessonStepper, type StepperPhase } from '@/components/lesson/LessonStepper';
import { PhaseCompleteButton } from '@/components/lesson/PhaseCompleteButton';
import { Dialog } from '@/components/ui/dialog';
import { StudentNavigation } from '@/components/student/StudentNavigation';

const MIN_HIT_TARGET_PX = 44;

const HIT_TARGET_CLASS_PATTERNS: ReadonlyArray<RegExp> = [
  /\bmin-h-\[\s*44px\s*\]/i,
  /\bmin-w-\[\s*44px\s*\]/i,
  /\bmin-h-\[\s*2\.75rem\s*\]/i,
  /\bmin-w-\[\s*2\.75rem\s*\]/i,
  /\bh-11\b/i,
  /\bw-11\b/i,
  /\bmin-h-11\b/i,
  /\bmin-w-11\b/i,
  /\bmin-h-\[\s*(?:4[8-9]|[5-9]\d|\d{3,})px\s*\]/i,
  /\bmin-w-\[\s*(?:4[8-9]|[5-9]\d|\d{3,})px\s*\]/i,
];

function meetsHitTargetContract(el: Element): boolean {
  const className = el.getAttribute('class') ?? '';
  const style = el.getAttribute('style') ?? '';
  // Inline style escape hatch: explicit min-height/min-width ≥ 44px counts.
  const mh = /min-height\s*:\s*([0-9.]+)px/i.exec(style);
  const mw = /min-width\s*:\s*([0-9.]+)px/i.exec(style);
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

const SAMPLE_PHASES: StepperPhase[] = [
  { phaseNumber: 1, phaseId: 'p1', phaseType: 'explore', title: 'Explore', status: 'completed' },
  { phaseNumber: 2, phaseId: 'p2', phaseType: 'learn', title: 'Learn', status: 'current' },
  { phaseNumber: 3, phaseId: 'p3', phaseType: 'worked_example', title: 'Example', status: 'locked' },
];

describe('Phase 2 — app shell min hit target (FR3 / AC3, audit #9 + #13 + #14)', () => {
  // jsdom does not implement `HTMLDialogElement.showModal()` — the Dialog
  // component calls it from a useEffect on mount. Without the stub below
  // the component would crash and the assertion would never run, masking
  // the contract gap. The stub is a no-op so the dialog host stays in the
  // DOM and the className probe can inspect the rendered Tailwind classes.
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

  describe('min hit target', () => {
    it('LessonStepper compact (mobile) step button meets 44x44 min hit target', () => {
      // Audit finding #9 + #13: mobile stepper uses `h-9 w-9` (36×36) on
      // the compact (mobile) branch. The Green role must bump the
      // compact branch to a 44×44 minimum via min-h-[44px]/min-w-[44px]
      // or h-11/w-11. Desktop branch (h-11 w-11) already passes.
      render(<LessonStepper phases={SAMPLE_PHASES} currentPhase={2} />);

      // The compact (mobile) branch uses an inline number label
      // `<span className="text-sm font-semibold">{phaseNumber}</span>`
      // instead of the desktop icon — that's the discriminator.
      const numberedButtons = screen
        .getAllByRole('button')
        .filter((btn) => /^\d+$/.test((btn.textContent ?? '').trim()));
      expect(
        numberedButtons.length,
        'mobile (compact) branch must render numbered step buttons',
      ).toBeGreaterThan(0);

      for (const btn of numberedButtons) {
        expect(
          meetsHitTargetContract(btn),
          'LessonStepper compact (mobile) step button must meet 44x44 hit target ' +
            '(audit #9 + #13). Current classes: "' +
            (btn.getAttribute('class') ?? '(none)') +
            '" / inline style: "' +
            (btn.getAttribute('style') ?? '(none)') +
            '"',
        ).toBe(true);
      }
    });

    it('PhaseCompleteButton Mark Complete meets 44x44 min hit target', () => {
      // Audit #13 generalised: every primary action button should meet
      // the 44×44 minimum. PhaseCompleteButton renders the
      // `<Button variant="default" ...>Mark Complete</Button>` which uses
      // the size="default" CVA size = `h-9` (36px). Green must add
      // min-h-[44px] (or similar) at the call site or via a new CVA size.
      render(
        <PhaseCompleteButton
          lessonId="hit-target-lesson"
          phaseNumber={1}
          phaseType="learn"
        />,
      );
      const completeButton = screen.getByRole('button', { name: /mark complete/i });
      expect(
        meetsHitTargetContract(completeButton),
        'PhaseCompleteButton Mark Complete must meet 44x44 hit target ' +
          '(audit #13). Current classes: "' +
          (completeButton.getAttribute('class') ?? '(none)') +
          '" / inline style: "' +
          (completeButton.getAttribute('style') ?? '(none)') +
          '"',
      ).toBe(true);
    });

    it('StudentNavigation mobile toggle button meets 44x44 min hit target', () => {
      // The mobile toggle is `md:hidden fixed top-4 left-4 z-50 p-2` with
      // a 24×24 icon = ~40px hit target. Audit #13 demands ≥ 44px. Green
      // must bump the button to min-h-[44px]/min-w-[44px].
      render(<StudentNavigation activeRoute="/student/dashboard" />);
      const toggle = screen.getByRole('button', { name: /toggle menu/i });
      expect(
        meetsHitTargetContract(toggle),
        'StudentNavigation mobile toggle must meet 44x44 hit target ' +
          '(audit #13). Current classes: "' +
          (toggle.getAttribute('class') ?? '(none)') +
          '" / inline style: "' +
          (toggle.getAttribute('style') ?? '(none)') +
          '"',
      ).toBe(true);
    });

    it('Dialog content max-width respects phone viewport (390px wide)', () => {
      // Audit #14 generalised: dialogs must have a viewport-aware max-width
      // so they cannot overflow the 390px phone viewport. Current Dialog
      // content uses `w-full max-w-md` = 448px which overflows a 390px
      // viewport if the dialog host aligns the content to its native width.
      // Green must add a viewport-aware max-width (e.g.
      // `max-w-[calc(100vw-2rem)]` or an `sm:max-w-md` media-query form).
      render(
        <Dialog open onOpenChange={() => {}} title="Hit-target dialog">
          <p>Dialog content</p>
        </Dialog>,
      );

      // The native `<dialog>` is the layout host; the inner card div is
      // the visible content panel. Both must carry a viewport-aware
      // max-width contract.
      const dialog = screen.getByRole('dialog');
      const card = dialog.querySelector('div');

      // Acceptable forms: viewport-relative arbitrary max-width
      // (`max-w-[calc(100vw-Nrem)]`, `max-w-[100vw]`) OR Tailwind
      // breakpoint-conditional form (`sm:max-w-md` paired with a
      // default `max-w-[...]`). The card or the dialog host must declare
      // at least one such form.
      const hasViewportAwareMaxWidth = (el: Element | null): boolean => {
        if (!el) return false;
        const className = el.getAttribute('class') ?? '';
        const style = el.getAttribute('style') ?? '';
        return (
          /\bmax-w-\[\s*calc\(\s*100vw\b/i.test(className) ||
          /\bmax-w-\[\s*100vw\s*\]/i.test(className) ||
          /\bmax-w-screen\b/i.test(className) ||
          /max-width\s*:\s*calc\(\s*100vw\b/i.test(style) ||
          /max-width\s*:\s*100vw\b/i.test(style) ||
          // Breakpoint-conditional: a default mobile form (`max-w-[...]`)
          // followed by a desktop `md:max-w-md` or `sm:max-w-md`. JSDOM
          // doesn't evaluate the media query, so we just check that the
          // conditional class pair is present.
          /(?:\bmax-w-\[[^\]]+\][\s\S]{0,40})?\b(?:sm|md):max-w-md\b/.test(className)
        );
      };

      const hostOk = hasViewportAwareMaxWidth(dialog);
      const cardOk = hasViewportAwareMaxWidth(card);
      expect(
        hostOk || cardOk,
        'Dialog must declare a viewport-aware max-width so it cannot overflow the ' +
          '390px phone viewport (audit #14 generalised). Dialog className: "' +
          (dialog.getAttribute('class') ?? '(none)') +
          '" / Card className: "' +
          (card?.getAttribute('class') ?? '(none)') +
          '". Accepted forms: max-w-[calc(100vw-...)] / max-w-[100vw] / sm:max-w-md / md:max-w-md.',
      ).toBe(true);
    });
  });
});
