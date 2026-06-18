// Phase 3.1 — Empty / pending states (TDD, Red).
//
// Contract under test (per spec.md FR6 + test-strategy.md §5):
//
//   The parent portal MUST render clear, distinct empty/pending states for
//   the three branches called out in the test strategy:
//
//     1. Pre-link — `links.length === 0` (parent has no linked students).
//     2. Pending — `links[0].status === 'pending'` (link created but
//        awaiting teacher/admin approval).
//     3. No activity — an active link exists but the projection has no
//        nodes (the student has not started any lessons yet).
//
//   When the active branch is satisfied (active link + projection with at
//   least one node), the dispatcher MUST render its `children` — i.e.
//   hand off to the active ParentDashboard render.
//
// Architectural rules:
//   - The dispatcher is a presentational component: it consumes only the
//     `links` array and a `hasProjectionNodes` flag (the projection itself
//     is consumed by the active children, not by the dispatcher). It must
//     not call any Convex query — that boundary belongs to the server
//     component page.
//   - Each branch uses a stable `data-testid` so screen-reader and
//     integration tests can target it directly without coupling to copy.
//   - The dispatcher must NEVER render the active children inside an
//     empty branch (privacy boundary: pre-link parents must not see the
//     parent projection payload at all).
//
// Red signal (per test-strategy.md §7, Phase 3 red command):
//   `npm run ws:im3:test -- __tests__/components/parent/ParentEmptyStates.test.tsx`
// At HEAD the `@/components/parent/ParentEmptyStates` module does not
// exist (it will be created in the Green phase). The dynamic
// `await import(...)` form is used so vitest's module-resolution failure
// surfaces as a single failing test file, not a syntax error in the test
// file itself. The pattern mirrors the Phase 2 red command for
// `ParentDashboard` / `StudentSwitcher`.
//
// Phase 1 widened the Convex `parent_links` schema to include the
// `pending` status (see `apps/integrated-math-3/convex/schema.ts` line
// 278). Phase 1's `createParentLink` only inserts `'active'` rows, but
// the dispatcher UI must still handle `'pending'` rows when they appear
// (e.g. from a future invite/approval flow). The Phase 2 fixture
// `ParentLinkFixture.status` has been widened accordingly.

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';

import {
  pendingParentLinks,
  STUDENT_ALPHA_ID,
  STUDENT_PENDING_ID,
  type ParentLinkFixture,
} from '@/__tests__/_fixtures/parent-portal/parentLinks';

// ---------------------------------------------------------------------------
// Module-shape helpers
// ---------------------------------------------------------------------------

type ParentEmptyStatesProps = {
  links: ParentLinkFixture[];
  /** Whether the active student's projection has at least one visual node. */
  hasProjectionNodes?: boolean;
  /** Optional human-readable student name for empty-state copy. */
  studentName?: string;
  /** Content rendered when the parent is in the "active" branch. */
  children?: ReactNode;
};

type ParentEmptyStatesComponent = (props: ParentEmptyStatesProps) => ReactNode;

async function loadParentEmptyStates(): Promise<ParentEmptyStatesComponent> {
  const mod = await import('@/components/parent/ParentEmptyStates');
  return mod.ParentEmptyStates as ParentEmptyStatesComponent;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ParentEmptyStates (Phase 3.1 — empty/pending state branches)', () => {
  beforeEach(() => {
    // No mocks: this is a presentational dispatcher. Convex boundary is
    // owned by the page-level server component, not by this component.
  });

  describe('existence and module surface', () => {
    it('exports a ParentEmptyStates component', async () => {
      const ParentEmptyStates = await loadParentEmptyStates();
      expect(typeof ParentEmptyStates).toBe('function');
    });
  });

  describe('pre-link branch (links.length === 0)', () => {
    it('renders the "no links" empty state when the link list is empty', async () => {
      const ParentEmptyStates = await loadParentEmptyStates();
      render(<ParentEmptyStates links={[]} />);

      const region = screen.getByTestId('parent-empty-state-no-links');
      expect(region).toBeInTheDocument();
    });

    it('does NOT render the active children when the link list is empty', async () => {
      const ParentEmptyStates = await loadParentEmptyStates();
      render(
        <ParentEmptyStates links={[]}>
          <div data-testid="active-children">Dashboard content</div>
        </ParentEmptyStates>,
      );

      expect(screen.queryByTestId('active-children')).not.toBeInTheDocument();
      expect(screen.queryByTestId('parent-empty-state-pending-link')).not.toBeInTheDocument();
      expect(screen.queryByTestId('parent-empty-state-no-activity')).not.toBeInTheDocument();
    });

    it('explains the teacher-initiated linking mechanism in the no-links copy', async () => {
      const ParentEmptyStates = await loadParentEmptyStates();
      render(<ParentEmptyStates links={[]} />);

      const region = screen.getByTestId('parent-empty-state-no-links');
      // Must explain how a parent gets linked — teacher / school / admin.
      // The pattern mirrors the Phase 2 dashboard empty-state copy style:
      // a plain-language sentence that orients the parent toward next steps.
      expect(region.textContent).toMatch(/teacher|invite|school|admin/i);
      // Must NOT claim progress exists (privacy: no projection leak).
      expect(region.textContent).not.toMatch(/Quadratic basics/i);
    });
  });

  describe('pending branch (links[0].status === "pending")', () => {
    it('renders the pending-link empty state when only pending links exist', async () => {
      const ParentEmptyStates = await loadParentEmptyStates();
      render(<ParentEmptyStates links={pendingParentLinks} />);

      const region = screen.getByTestId('parent-empty-state-pending-link');
      expect(region).toBeInTheDocument();
    });

    it('does NOT render the active children when all links are pending', async () => {
      const ParentEmptyStates = await loadParentEmptyStates();
      render(
        <ParentEmptyStates links={pendingParentLinks}>
          <div data-testid="active-children">Dashboard content</div>
        </ParentEmptyStates>,
      );

      expect(screen.queryByTestId('active-children')).not.toBeInTheDocument();
      expect(screen.queryByTestId('parent-empty-state-no-links')).not.toBeInTheDocument();
      expect(screen.queryByTestId('parent-empty-state-no-activity')).not.toBeInTheDocument();
    });

    it('mentions wait / pending / approval in the pending-link copy', async () => {
      const ParentEmptyStates = await loadParentEmptyStates();
      render(
        <ParentEmptyStates
          links={pendingParentLinks}
          studentName="Pending Student"
        />,
      );

      const region = screen.getByTestId('parent-empty-state-pending-link');
      expect(region.textContent).toMatch(/pending|wait|approval|approve|review|confirm/i);
      // Privacy boundary: must NOT leak the projection payload.
      expect(region.textContent).not.toMatch(/Quadratic basics/i);
    });
  });

  describe('no-activity branch (active link, projection has no nodes)', () => {
    it('renders the no-activity empty state when an active link exists but the projection is empty', async () => {
      const ParentEmptyStates = await loadParentEmptyStates();
      render(
        <ParentEmptyStates
          links={[{ studentId: STUDENT_ALPHA_ID, status: 'active' }]}
          hasProjectionNodes={false}
        />,
      );

      const region = screen.getByTestId('parent-empty-state-no-activity');
      expect(region).toBeInTheDocument();
    });

    it('does NOT render the active children when the projection has no nodes', async () => {
      const ParentEmptyStates = await loadParentEmptyStates();
      render(
        <ParentEmptyStates
          links={[{ studentId: STUDENT_ALPHA_ID, status: 'active' }]}
          hasProjectionNodes={false}
        >
          <div data-testid="active-children">Dashboard content</div>
        </ParentEmptyStates>,
      );

      expect(screen.queryByTestId('active-children')).not.toBeInTheDocument();
      expect(screen.queryByTestId('parent-empty-state-no-links')).not.toBeInTheDocument();
      expect(screen.queryByTestId('parent-empty-state-pending-link')).not.toBeInTheDocument();
    });

    it('mentions "no activity" / "no skills yet" / "getting started" in the no-activity copy', async () => {
      const ParentEmptyStates = await loadParentEmptyStates();
      render(
        <ParentEmptyStates
          links={[{ studentId: STUDENT_ALPHA_ID, status: 'active' }]}
          hasProjectionNodes={false}
          studentName="Alpha Student"
        />,
      );

      const region = screen.getByTestId('parent-empty-state-no-activity');
      expect(region.textContent).toMatch(/no activity|no skills|no progress|getting started|hasn't started|not started/i);
      // Privacy boundary: must NOT leak the projection payload fields.
      expect(region.textContent).not.toMatch(/Quadratic basics/i);
    });
  });

  describe('active branch (active link + projection has nodes)', () => {
    it('renders the active children when there is an active link and a non-empty projection', async () => {
      const ParentEmptyStates = await loadParentEmptyStates();
      render(
        <ParentEmptyStates
          links={[{ studentId: STUDENT_ALPHA_ID, status: 'active' }]}
          hasProjectionNodes={true}
        >
          <div data-testid="active-children">Dashboard content</div>
        </ParentEmptyStates>,
      );

      expect(screen.getByTestId('active-children')).toBeInTheDocument();
      expect(screen.queryByTestId('parent-empty-state-no-links')).not.toBeInTheDocument();
      expect(screen.queryByTestId('parent-empty-state-pending-link')).not.toBeInTheDocument();
      expect(screen.queryByTestId('parent-empty-state-no-activity')).not.toBeInTheDocument();
    });

    it('renders the active children by default when hasProjectionNodes is omitted (truthy active link + projection-with-nodes is the call-site contract)', async () => {
      // The page-level server component is expected to pass
      // `hasProjectionNodes={true}` (or omit it) when it has already
      // verified the projection has data. Omitting the prop must NOT
      // silently drop into the no-activity branch — that would cause
      // a regression where a parent with data sees a blank state.
      const ParentEmptyStates = await loadParentEmptyStates();
      render(
        <ParentEmptyStates
          links={[{ studentId: STUDENT_ALPHA_ID, status: 'active' }]}
        >
          <div data-testid="active-children">Dashboard content</div>
        </ParentEmptyStates>,
      );

      // When hasProjectionNodes is omitted, the dispatcher should treat
      // the link as live and render the children.
      expect(screen.getByTestId('active-children')).toBeInTheDocument();
    });
  });

  describe('branch dispatch — privacy boundary (no projection leak in empty branches)', () => {
    it('renders only one empty-state region per render (never multiple)', async () => {
      // Regression guard: a buggy dispatcher could render more than one
      // empty state (e.g. both no-links AND no-activity). This would
      // confuse screen readers and indicates a logic error in the
      // branch precedence.
      const ParentEmptyStates = await loadParentEmptyStates();
      render(<ParentEmptyStates links={[]} />);

      const emptyRegions = screen.queryAllByTestId(/^parent-empty-state-/);
      expect(within(document.body).queryAllByRole('status')).toHaveLength(emptyRegions.length);
      expect(emptyRegions.length).toBe(1);
    });
  });
});

// ---------------------------------------------------------------------------
// Fixture sanity (inside a real `it()` block so vitest records the
// assertion as a test result rather than relying on top-level expect
// behavior, which is unreliable across vitest versions).
// ---------------------------------------------------------------------------

describe('ParentEmptyStates — fixture sanity', () => {
  it('pendingParentLinks fixture has exactly one pending row and the correct student id', () => {
    expect(pendingParentLinks).toHaveLength(1);
    expect(pendingParentLinks[0]?.status).toBe('pending');
    expect(pendingParentLinks[0]?.studentId).toBe(STUDENT_PENDING_ID);
  });
});