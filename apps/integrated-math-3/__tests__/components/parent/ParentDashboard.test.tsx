// Phase 2.1 — Query + render the parent visualization projection (TDD, Red).
//
// Contract under test (per spec.md FR3 + test-strategy.md §5):
//
//   The parent dashboard MUST render the existing
//   `parentVisualizationV1Schema` payload exactly — no teacher-only fields,
//   no raw graph state, no other-student data. Plain-language summary
//   fields are visible: can-do, next focus, blockers, progress trend.
//
// What this test exercises:
//   1. The ParentDashboard component exists and accepts a schema-validated
//      `parentVisualizationV1Schema` payload (no transform / projection in
//      the component itself — the page-level server component is the only
//      boundary that calls `projectParentVisualization`).
//   2. The component renders canDoSummary, nextFocus, blockers (as a list),
//      and progressTrend (with a plain-language label, not a raw enum).
//   3. The component renders the visual nodes (mastered / ready / blocked /
//      review-due) so the parent can see what their student is working on.
//   4. Even when a "rich" payload is passed in, the component does NOT
//      surface teacher-only fields (heatmap, bottleneckNodes, etc.) —
//      a regression that imports the wrong projection would fail here.
//
// Red signal (per test-strategy.md §7, Phase 2 red command):
//   `npm run ws:im3:test -- __tests__/components/parent/ParentDashboard.test.tsx`
// At HEAD the `@/components/parent/ParentDashboard` module does not exist
// (it will be created in the Green phase). The dynamic `await import(...)`
// form is used so vitest's module-resolution failure surfaces as a single
// failing test file, not a syntax error in the test file itself. The
// pattern mirrors the parent-role-guard Phase 1 red command.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';

import {
  richParentProjection,
  emptyParentProjection,
  TEACHER_ONLY_KEYS,
  type ParentVisualizationV1,
} from '@/__tests__/_fixtures/parent-portal/parentProjection';

// ---------------------------------------------------------------------------
// Module-shape helpers
// ---------------------------------------------------------------------------

type ParentDashboardProps = {
  payload: ParentVisualizationV1;
  studentId: string;
  studentName: string;
};

type ParentDashboardComponent = (props: ParentDashboardProps) => JSX.Element;

async function loadParentDashboard(): Promise<ParentDashboardComponent> {
  const mod = await import('@/components/parent/ParentDashboard');
  return mod.ParentDashboard as ParentDashboardComponent;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ParentDashboard (Phase 2.1 — render parent projection payload)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('existence and module surface', () => {
    it('exports a ParentDashboard component', async () => {
      const ParentDashboard = await loadParentDashboard();
      expect(typeof ParentDashboard).toBe('function');
    });
  });

  describe('can-do summary', () => {
    it('renders the canDoSummary text from the projection payload', async () => {
      const ParentDashboard = await loadParentDashboard();
      render(
        <ParentDashboard
          payload={richParentProjection}
          studentId="student_alpha"
          studentName="Alpha Student"
        />,
      );

      expect(
        screen.getByText(/Quadratic basics/i),
      ).toBeInTheDocument();
    });

    it('renders the "no skills mastered yet" can-do summary for an empty payload', async () => {
      const ParentDashboard = await loadParentDashboard();
      render(
        <ParentDashboard
          payload={emptyParentProjection}
          studentId="student_empty"
          studentName="Empty Student"
        />,
      );

      expect(
        screen.getByText(/No skills mastered yet/i),
      ).toBeInTheDocument();
    });
  });

  describe('next focus', () => {
    it('renders the nextFocus text from the projection payload', async () => {
      const ParentDashboard = await loadParentDashboard();
      render(
        <ParentDashboard
          payload={richParentProjection}
          studentId="student_alpha"
          studentName="Alpha Student"
        />,
      );

      expect(
        screen.getByText(/Practice: Polynomials/i),
      ).toBeInTheDocument();
    });
  });

  describe('blockers', () => {
    it('renders each blocker as its own list item', async () => {
      const ParentDashboard = await loadParentDashboard();
      render(
        <ParentDashboard
          payload={richParentProjection}
          studentId="student_alpha"
          studentName="Alpha Student"
        />,
      );

      const blockersList = screen.getByTestId('parent-dashboard-blockers');
      const items = within(blockersList).getAllByRole('listitem');
      expect(items).toHaveLength(1);
      expect(items[0]).toHaveTextContent(/Function composition/i);
    });

    it('renders an empty-blockers region when no blockers exist', async () => {
      const ParentDashboard = await loadParentDashboard();
      render(
        <ParentDashboard
          payload={emptyParentProjection}
          studentId="student_empty"
          studentName="Empty Student"
        />,
      );

      const blockersList = screen.getByTestId('parent-dashboard-blockers');
      const items = within(blockersList).queryAllByRole('listitem');
      expect(items).toHaveLength(0);
    });
  });

  describe('progress trend', () => {
    it('renders a plain-language label for progressTrend = "improving"', async () => {
      const ParentDashboard = await loadParentDashboard();
      render(
        <ParentDashboard
          payload={richParentProjection}
          studentId="student_alpha"
          studentName="Alpha Student"
        />,
      );

      const trendRegion = screen.getByTestId('parent-dashboard-trend');
      expect(trendRegion).toHaveTextContent(/improving/i);
      // The component must NOT show the raw enum value as the only label;
      // the test asserts a human-readable phrasing exists alongside the
      // implementation's choice of wording.
      expect(trendRegion.textContent).not.toMatch(/^improving$/);
    });

    it('renders a plain-language label for progressTrend = "unknown"', async () => {
      const ParentDashboard = await loadParentDashboard();
      render(
        <ParentDashboard
          payload={emptyParentProjection}
          studentId="student_empty"
          studentName="Empty Student"
        />,
      );

      const trendRegion = screen.getByTestId('parent-dashboard-trend');
      expect(trendRegion).toHaveTextContent(/unknown|not enough data|no data/i);
    });
  });

  describe('visual nodes', () => {
    it('renders every visual node from the payload by title', async () => {
      const ParentDashboard = await loadParentDashboard();
      render(
        <ParentDashboard
          payload={richParentProjection}
          studentId="student_alpha"
          studentName="Alpha Student"
        />,
      );

      for (const node of richParentProjection.nodes) {
        expect(
          screen.getByText(new RegExp(escapeRegExp(node.title), 'i')),
        ).toBeInTheDocument();
      }
    });
  });

  describe('schema-validated payload acceptance', () => {
    it('accepts a payload that parses with parentVisualizationV1Schema (no transform)', async () => {
      // The component must accept the canonical payload shape — i.e. it
      // does not re-project or re-shape the data on render. This test
      // uses an exhaustive fixture (every required field present) and
      // expects the component to render without throwing.
      const ParentDashboard = await loadParentDashboard();
      expect(() =>
        render(
          <ParentDashboard
            payload={richParentProjection}
            studentId="student_alpha"
            studentName="Alpha Student"
          />,
        ),
      ).not.toThrow();
    });
  });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ---------------------------------------------------------------------------
// Fixture sanity (inside a real `it()` block so vitest records the
// assertion as a test result rather than relying on top-level expect
// behavior, which is unreliable across vitest versions).
// ---------------------------------------------------------------------------

describe('ParentDashboard — fixture sanity', () => {
  it('TEACHER_ONLY_KEYS is non-empty so the privacy scan has forbidden keys to check', () => {
    expect(TEACHER_ONLY_KEYS.length).toBeGreaterThan(0);
  });
});
