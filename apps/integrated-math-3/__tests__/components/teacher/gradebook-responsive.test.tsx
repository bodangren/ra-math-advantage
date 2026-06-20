// Phase 3 — Red-phase teacher-views responsive contract test.
//
// Track: responsive-mobile-audit_20260605
// Spec:  measure/tracks/responsive-mobile-audit_20260605/spec.md (FR4 / AC4)
// Strategy: measure/tracks/responsive-mobile-audit_20260605/test-strategy.md
//   §1 (Phase 3: "Component (responsive degradation) middle; e2e (teacher
//       routes) apex; CI runner-plumbing tests. Unit only for pure
//       helpers."),
//   §5 (P3: "Component tests asserting gradebook/heatmap stack-or-scroll
//       at tablet"),
//   §6 (P3 targets: "UI layer (`GradebookGrid.tsx`,
//       `CompetencyHeatmapGrid.tsx`), not re-test pure logic"),
//   §7 (Phase 3 Red proof command, bounded):
//       `CI=true npm run test --workspace=apps/integrated-math-3 -- \
//         __tests__/components/teacher/gradebook-responsive.test.tsx \
//         -t "tablet"`
//       MUST FAIL (gradebook overflows at tablet) before remediation,
//   §8 ("Any new helper test Red before its implementation is owned by its
//       [~] task, scoped to a single file/grep so it cannot trip the
//       aggregate `vitest run`.").
//
// This test asserts the **tablet-degradation half** of the Phase 1 audit's
// prioritised failures for the teacher data views (audit findings #1–#4,
// #14). The bounded `-t "tablet"` filter matches exactly the strategy §7
// command so the Red proof stays scoped to a single file/grep and cannot
// trip the aggregate `vitest run`.
//
// The contract is asserted by inspecting the rendered DOM (Tailwind class
// strings + role/structural probes) — no live measurements, no network
// calls, no Convex. The Green role implements the remediation; this test
// then turns green without test changes.
//
// At HEAD every assertion in this file FAILS:
//   - GradebookGrid column headers use `truncate max-w-20` (audit #2) —
//     lesson titles aggressively truncated on tablet 768px.
//   - GradebookGrid container has no horizontal-scroll affordance (audit
//     #1) — teachers on phone/tablet cannot discover additional columns.
//   - CompetencyHeatmapGrid container has no horizontal-scroll affordance
//     (audit #3) — same UX gap as GradebookGrid.
//   - CompetencyHeatmapGrid sortable header button lacks a 44×44 hit
//     target (audit #4) — touch targets < 36px on tablet.
//   - CompetencyHeatmapGrid cells lack 44×44 hit targets (audit #4) —
//     touch targets < 36px on tablet.
//   - SubmissionDetailModal dialog content has no viewport-aware max-width
//     (audit #14 generalised) — overflows on 390px phone, no tablet cap.
//
// Resolution from the test file's location (lessons-learned 2026-05-03):
// `fileURLToPath(import.meta.url)` + `dirname()` — never `process.cwd()`.

import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GradebookGrid } from '@/components/teacher/gradebook/GradebookGrid';
import { CompetencyHeatmapGrid } from '@/components/teacher/CompetencyHeatmapGrid';
import { SubmissionDetailModal } from '@/components/teacher/gradebook/SubmissionDetailModal';
import type { GradebookRow, GradebookLesson } from '@math-platform/teacher-reporting-core';
import type { CompetencyHeatmapRow, CompetencyStandard } from '@math-platform/teacher-reporting-core';
import type {
  SubmissionEvidence,
  DeterministicErrorSummary,
} from '@math-platform/practice-core/error-analysis';

// Strategy §2 + audit-finding contract: 44×44 minimum touch target,
// shared with the wcag-aa-remediation track (test-strategy §2). Pixel
// and rem forms are both accepted so authors can pick a Tailwind
// arbitrary-value form.
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
  const mh = /min-height\s*:\s*([0-9.]+)px/i.exec(style);
  const mw = /min-width\s*:\s*([0-9.]+)px/i.exec(style);
  const heightOk = mh ? parseFloat(mh[1]) >= MIN_HIT_TARGET_PX : true;
  const widthOk = mw ? parseFloat(mw[1]) >= MIN_HIT_TARGET_PX : true;
  if (heightOk && widthOk && (mh || mw)) return true;
  const hasHeightClass = HIT_TARGET_CLASS_PATTERNS.some(
    (re) => /\b(min-h|h)-/i.test(re.source) && re.test(className),
  );
  const hasWidthClass = HIT_TARGET_CLASS_PATTERNS.some(
    (re) => /\b(min-w|w)-/i.test(re.source) && re.test(className),
  );
  return hasHeightClass && hasWidthClass;
}

function makeGradebookRows(): GradebookRow[] {
  return [
    {
      studentId: 's1',
      displayName: 'Alice Johnson',
      username: 'alice',
      cells: [
        {
          lesson: { lessonId: 'l1', lessonTitle: 'Intro to Quadratics', orderIndex: 1, isUnitTest: false },
          completionStatus: 'completed',
          masteryLevel: 95,
          color: 'green',
        },
        {
          lesson: { lessonId: 'l2', lessonTitle: 'Graphing Quadratics', orderIndex: 2, isUnitTest: false },
          completionStatus: 'in_progress',
          masteryLevel: 70,
          color: 'yellow',
        },
      ],
    },
    {
      studentId: 's2',
      displayName: 'Bob Smith',
      username: 'bob',
      cells: [
        {
          lesson: { lessonId: 'l1', lessonTitle: 'Intro to Quadratics', orderIndex: 1, isUnitTest: false },
          completionStatus: 'completed',
          masteryLevel: 80,
          color: 'green',
        },
        {
          lesson: { lessonId: 'l2', lessonTitle: 'Graphing Quadratics', orderIndex: 2, isUnitTest: false },
          completionStatus: 'not_started',
          masteryLevel: 20,
          color: 'red',
        },
      ],
    },
  ];
}

function makeGradebookLessons(): GradebookLesson[] {
  return [
    { lessonId: 'l1', lessonTitle: 'Intro to Quadratics', orderIndex: 1, isUnitTest: false },
    { lessonId: 'l2', lessonTitle: 'Graphing Quadratics', orderIndex: 2, isUnitTest: false },
  ];
}

function makeHeatmapRows(): CompetencyHeatmapRow[] {
  return [
    {
      studentId: 's1',
      displayName: 'Alice Johnson',
      username: 'alice',
      cells: [
        { standardId: 'std1', standardCode: 'A-SSE.2', standardDescription: 'Desc 1', category: 'Algebra', masteryLevel: 95, color: 'green' },
        { standardId: 'std2', standardCode: 'A-APR.1', standardDescription: 'Desc 2', category: 'Algebra', masteryLevel: 70, color: 'yellow' },
      ],
    },
  ];
}

function makeHeatmapStandards(): CompetencyStandard[] {
  return [
    { id: 'std1', code: 'A-SSE.2', description: 'Desc 1', studentFriendlyDescription: null, category: 'Algebra' },
    { id: 'std2', code: 'A-APR.1', description: 'Desc 2', studentFriendlyDescription: null, category: 'Algebra' },
  ];
}

function makeSubmissionDetailData(): {
  studentName: string;
  lessonTitle: string;
  phases: Array<{
    phaseNumber: number;
    phaseId: string;
    title: string;
    status: string;
    completedAt: number | null;
    spreadsheetData: unknown | null;
    evidence: SubmissionEvidence[];
  }>;
  studentErrorSummary: DeterministicErrorSummary | null;
} {
  return {
    studentName: 'Alice Johnson',
    lessonTitle: 'Intro to Quadratics',
    phases: [
      {
        phaseNumber: 1,
        phaseId: 'p1',
        title: 'Explore',
        status: 'completed',
        completedAt: Date.now() - 86400_000,
        spreadsheetData: null,
        evidence: [],
      },
    ],
    studentErrorSummary: null,
  };
}

describe('Phase 3 — teacher views degrade gracefully on tablet (FR4 / AC4, audit #1–#4 + #14)', () => {
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

  describe('tablet', () => {
    it('GradebookGrid column headers do not aggressively truncate lesson titles (audit #2)', () => {
      // Audit finding #2: "GradebookGrid column headers use `truncate
      // max-w-20` — lesson titles aggressively truncated, making it
      // impossible to identify columns without tooltips." Current
      // rendering: <span className="block truncate max-w-20 mx-auto">.
      // The Green role must remove the truncation so titles remain
      // legible on tablet 768px (acceptable forms: remove `truncate`,
      // remove `max-w-20`, or replace with `max-w-32` / `whitespace-normal`
      // / explicit min-w that fits the title).
      render(
        <GradebookGrid
          rows={makeGradebookRows()}
          lessons={makeGradebookLessons()}
          onCellClick={() => {}}
        />,
      );

      const headerSpans = screen.getAllByText(/Intro to Quadratics|Graphing Quadratics/);
      expect(headerSpans.length).toBeGreaterThan(0);

      for (const span of headerSpans) {
        const className = span.getAttribute('class') ?? '';
        // The original `truncate` class is the offender; both `truncate`
        // and the original `max-w-20` form must be gone for the test to
        // pass. The Green role may keep `truncate` if the max-w is widened
        // enough to fit a typical lesson title, but the original `max-w-20`
        // (5rem = 80px) is too narrow for ANY non-trivial title.
        const hasOriginalTruncate = /\btruncate\b/.test(className) && /\bmax-w-20\b/.test(className);
        expect(
          hasOriginalTruncate,
          'GradebookGrid column header must not combine `truncate` with `max-w-20` ' +
            '(audit #2 — lesson titles aggressively truncated on tablet). ' +
            'Acceptable forms: drop `truncate`, drop `max-w-20`, or widen the max-w to fit ' +
            'a typical lesson title (e.g. max-w-32 / max-w-40). ' +
            'Current className: "' + className + '".',
        ).toBe(false);
      }
    });

    it('GradebookGrid container declares a horizontal-scroll affordance (audit #1)', () => {
      // Audit finding #1 (critical): "GradebookGrid relies on
      // `overflow-x-auto` with no visual indicator (gradient fade, scroll
      // hint) that additional columns exist." Current rendering: the
      // container has `overflow-x-auto` but no gradient fade, no scroll
      // hint, no `<span aria-label="more columns to the right">`, no
      // `data-scroll-hint` attribute. The Green role must add at least
      // one user-visible affordance (gradient fade, scroll-hint text,
      // accessible label) so teachers on phone/tablet know additional
      // columns exist beyond the visible viewport.
      const { container } = render(
        <GradebookGrid
          rows={makeGradebookRows()}
          lessons={makeGradebookLessons()}
          onCellClick={() => {}}
        />,
      );

      // The container is the outer wrapper around the <table> that holds
      // the `overflow-x-auto` class. We probe the rendered HTML for
      // EITHER a gradient-fade utility (e.g. `bg-gradient-*` /
      // `[mask-image:linear-gradient...]`) OR a scroll-hint element
      // (e.g. `data-scroll-hint`, `aria-label="more columns"`, or text
      // like "scroll →").
      const html = container.innerHTML;
      const hasGradientFade =
        /\bbg-gradient-(?:to-r|to-l)\b/.test(html) ||
        /mask-image\s*:\s*linear-gradient/i.test(html) ||
        /\[-webkit-mask-image\s*:\s*linear-gradient/i.test(html);
      const hasScrollHint =
        /data-scroll-hint/i.test(html) ||
        /aria-label\s*=\s*"[^"]*more columns?/i.test(html) ||
        /aria-label\s*=\s*"[^"]*scroll[^"]*right/i.test(html) ||
        /scroll\s*(?:→|&#x2192;|for|&rarr;)/i.test(html);

      expect(
        hasGradientFade || hasScrollHint,
        'GradebookGrid container must declare a horizontal-scroll affordance so teachers ' +
          'on phone/tablet can discover additional columns (audit #1 — critical). ' +
          'Acceptable forms: bg-gradient-(to-r|to-l) / [mask-image:linear-gradient] for a ' +
          'gradient fade, OR data-scroll-hint / aria-label mentioning more columns / scroll ' +
          'hint text. Current HTML snippet: "' + html.slice(0, 400) + '..."',
      ).toBe(true);
    });

    it('CompetencyHeatmapGrid container declares a horizontal-scroll affordance (audit #3)', () => {
      // Audit finding #3 (critical): same UX gap as GradebookGrid (#1)
      // but for the heatmap. The matrix of student × standard becomes a
      // single-column scroll without orientation cues on phone/tablet.
      const { container } = render(
        <CompetencyHeatmapGrid
          rows={makeHeatmapRows()}
          standards={makeHeatmapStandards()}
        />,
      );

      const html = container.innerHTML;
      const hasGradientFade =
        /\bbg-gradient-(?:to-r|to-l)\b/.test(html) ||
        /mask-image\s*:\s*linear-gradient/i.test(html) ||
        /\[-webkit-mask-image\s*:\s*linear-gradient/i.test(html);
      const hasScrollHint =
        /data-scroll-hint/i.test(html) ||
        /aria-label\s*=\s*"[^"]*more columns?/i.test(html) ||
        /aria-label\s*=\s*"[^"]*scroll[^"]*right/i.test(html) ||
        /scroll\s*(?:→|&#x2192;|for|&rarr;)/i.test(html);

      expect(
        hasGradientFade || hasScrollHint,
        'CompetencyHeatmapGrid container must declare a horizontal-scroll affordance so ' +
          'teachers on phone/tablet can discover additional columns (audit #3 — critical). ' +
          'Acceptable forms: bg-gradient-(to-r|to-l) / [mask-image:linear-gradient] for a ' +
          'gradient fade, OR data-scroll-hint / aria-label mentioning more columns / scroll ' +
          'hint text. Current HTML snippet: "' + html.slice(0, 400) + '..."',
      ).toBe(true);
    });

    it('CompetencyHeatmapGrid sortable header button meets 44x44 min hit target (audit #4)', () => {
      // Audit finding #4: "CompetencyHeatmapGrid's sortable headers and
      // cell density exceed comfortable touch targets. Row toggles and
      // column sort controls are < 36px on tablet, below WCAG 44×44
      // recommendation." Current sortable header button uses default
      // button classes (no min-h/min-w declaration). Green must add
      // 44×44 sizing to the sort button.
      render(
        <CompetencyHeatmapGrid
          rows={makeHeatmapRows()}
          standards={makeHeatmapStandards()}
        />,
      );

      const sortButton = screen.getByRole('button', { name: /sort by student name/i });
      expect(
        meetsHitTargetContract(sortButton),
        'CompetencyHeatmapGrid sortable header button must meet 44x44 hit target ' +
          '(audit #4 — touch targets < 36px on tablet). Current classes: "' +
          (sortButton.getAttribute('class') ?? '(none)') + '" / inline style: "' +
          (sortButton.getAttribute('style') ?? '(none)') + '".',
      ).toBe(true);
    });

    it('CompetencyHeatmapGrid cells meet 44x44 min hit target (audit #4)', () => {
      // Audit finding #4 generalised: every interactive cell in the
      // heatmap should meet 44×44 on tablet. The cells render the
      // mastery percentage as plain `<td>` text with no interactive
      // wrapper; the Green role must either (a) wrap the cell content
      // in a `<button>` with 44×44 sizing, OR (b) confirm the cell
      // meets 44×44 via padding+min-height utility classes. Either
      // path satisfies the contract.
      const { container } = render(
        <CompetencyHeatmapGrid
          rows={makeHeatmapRows()}
          standards={makeHeatmapStandards()}
        />,
      );

      // Find the <td> elements that contain the mastery percentage text.
      const masteryCells = Array.from(
        container.querySelectorAll('td'),
      ).filter((td) => /^\s*\d+%\s*$|^\s*—\s*$/.test((td.textContent ?? '').trim()));

      expect(masteryCells.length, 'mastery cells must render at least one numeric percentage').toBeGreaterThan(0);

      for (const cell of masteryCells) {
        // The cell must have either a 44×44-bearing class or a 44×44
        // inline padding+min-height declaration.
        const className = cell.getAttribute('class') ?? '';
        const style = cell.getAttribute('style') ?? '';
        const classHasHitTarget = HIT_TARGET_CLASS_PATTERNS.some(
          (re) => /\b(min-h|h)-/i.test(re.source) && re.test(className),
        );
        const inlineHasMinHeight = /min-height\s*:\s*([0-9.]+)px/i.exec(style);
        const minHeightOk = inlineHasMinHeight
          ? parseFloat(inlineHasMinHeight[1]) >= MIN_HIT_TARGET_PX
          : false;
        const paddingTall = /padding-(?:top|bottom)\s*:\s*([0-9.]+)px/i.exec(style);
        const paddingOk = paddingTall ? parseFloat(paddingTall[1]) * 2 >= MIN_HIT_TARGET_PX : false;

        expect(
          classHasHitTarget || minHeightOk || paddingOk,
          'CompetencyHeatmapGrid mastery cell must declare a 44x44 hit target (audit #4). ' +
            'Acceptable forms: min-h-[44px] / h-11 / min-h-11 / inline min-height: ≥ 44px / ' +
            'padding that yields ≥ 44px height. Current className: "' + className +
            '" / inline style: "' + style + '".',
        ).toBe(true);
      }
    });

    it('SubmissionDetailModal dialog content max-width respects phone viewport (audit #14 generalised)', () => {
      // Audit finding #14: "SubmissionDetailModal has no responsive
      // width cap; may stretch to full viewport on narrow desktop
      // windows." The Phase 2 dialog test (shell-responsive.test.tsx)
      // already covers the underlying `Dialog` component, but
      // SubmissionDetailModal is the primary teacher surface where the
      // 390px phone / narrow-desktop cap matters. Green must add a
      // viewport-aware max-width to the inner content container.
      render(
        <SubmissionDetailModal
          open
          onOpenChange={() => {}}
          data={makeSubmissionDetailData()}
        />,
      );

      const dialog = screen.getByRole('dialog');
      const card = dialog.querySelector('div');

      // Acceptable forms: viewport-relative arbitrary max-width
      // (`max-w-[calc(100vw-Nrem)]`, `max-w-[100vw]`) OR Tailwind
      // breakpoint-conditional form (`sm:max-w-md` paired with a
      // default `max-w-[...]`). The card or the dialog host must
      // declare at least one such form.
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
          /(?:\bmax-w-\[[^\]]+\][\s\S]{0,40})?\b(?:sm|md):max-w-md\b/.test(className)
        );
      };

      const hostOk = hasViewportAwareMaxWidth(dialog);
      const cardOk = hasViewportAwareMaxWidth(card);
      expect(
        hostOk || cardOk,
        'SubmissionDetailModal must declare a viewport-aware max-width so it cannot overflow ' +
          'the 390px phone viewport (audit #14 generalised). Dialog className: "' +
          (dialog.getAttribute('class') ?? '(none)') + '" / Card className: "' +
          (card?.getAttribute('class') ?? '(none)') + '". Accepted forms: ' +
          'max-w-[calc(100vw-...)] / max-w-[100vw] / sm:max-w-md / md:max-w-md.',
      ).toBe(true);
    });
  });
});
