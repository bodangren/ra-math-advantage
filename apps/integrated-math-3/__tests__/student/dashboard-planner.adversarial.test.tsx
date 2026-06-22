/**
 * Phase 3 (Track next_skill_planner_prod_wiring_20260621) — Adversarial
 * boundary and integration tests for the student dashboard planner wiring.
 *
 * These tests extend the Red/Green coverage in
 * `apps/integrated-math-3/__tests__/student/dashboard-planner.test.tsx` with
 * adversarial cases that the original Red suite did not cover. They live in
 * a separate file so each adversarial test owns its own `fetchInternalQuery`
 * mock state without leaking into the happy-path tests.
 *
 * Per test-strategy.md §7, the P3 `fetchInternalQuery` stub is "runner
 * plumbing only" — the production gate is the P1(b) "non-test ref is a
 * function" assertion plus the P2 handler-export assertion. The tests below
 * intentionally exercise the same seam under boundary and integration
 * pressure to expose regression risks that the original suite missed:
 *
 *   1. Wire-level: the recommended item's `href` is
 *      `/student/study?focus=<encodeURIComponent(nodeId)>` per the P3
 *      contract. The original tests verify the panel renders but never
 *      assert the link's `href`. If a future refactor drops `encodeURIComponent`
 *      or changes the route, the test must fail loudly.
 *   2. Boundary: special characters and Unicode in `nodeId` must be
 *      correctly URL-encoded so the focus param round-trips on the study
 *      route.
 *   3. Boundary: HTML / script tags in `title` and `description` must be
 *      rendered as escaped text (React text-node contract). The original
 *      suite uses a benign English string and never exercises XSS-shaped
 *      input.
 *   4. Boundary: an empty `recommendedNext` with a non-zero
 *      `activeMisconceptionCount` must suppress the misconception badge so
 *      the panel does not fabricate a count when there is no list to
 *      anchor it. The original suite covers the empty-list / zero-count
 *      case but not the empty-list / non-zero-count case.
 *   5. Boundary: difficulty = 0, 1, and `NaN` exercise the
 *      `formatDifficulty` edge cases at the rendered layer (the helper
 *      itself is unit-tested in spirit; the original P3 test only covers
 *      0.45). This guards against the `NaN% difficulty` string reappearing
 *      in production.
 *   6. Integration: when the visualization query resolves to a null
 *      payload (vs. throwing or returning an empty `recommendedNext`),
 *      the panel must fall back to the empty state. The original suite
 *      covers `[]` and the throw path but not `null`.
 *
 * The mock setup mirrors the P3 file (string-sentinel `internal.*` refs,
 * jest-dom matchers from `vitest.setup.ts`).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

const mockClaims = {
  sub: 'p1',
  username: 'student1',
  role: 'student' as const,
  organizationId: 'org1',
  iat: 0,
  exp: 9999999999,
};

vi.mock('@/lib/auth/server', () => ({
  requireStudentSessionClaims: vi.fn().mockResolvedValue(mockClaims),
}));

const mockStudentVizRef = 'mock-student-viz';
const mockPracticeStatsRef = 'mock-practice-stats';
const mockGetDashboardDataRef = 'mock-get-dashboard-data';

interface MockVisualization {
  schemaVersion: 'v1';
  mastered: unknown[];
  ready: unknown[];
  blocked: unknown[];
  reviewDue: unknown[];
  recommendedNext: Array<{
    nodeId: string;
    title: string;
    description?: string;
    state: 'mastered' | 'ready' | 'blocked' | 'review_due' | 'unknown';
    difficulty?: number;
    domain?: string;
  }>;
  edges: unknown[];
  activeMisconceptionCount: number;
}

function defaultDashboardUnits() {
  return [
    {
      unitNumber: 1,
      unitTitle: 'Quadratic Functions',
      lessons: [
        {
          id: 'l1',
          unitNumber: 1,
          title: 'Intro',
          slug: 'intro',
          description: null,
          completedPhases: 0,
          totalPhases: 6,
          progressPercentage: 0,
        },
      ],
    },
  ];
}

let mockedFetchInternalQuery: ReturnType<typeof vi.fn>;

beforeEach(async () => {
  cleanup();
  const mod = await import('@/lib/convex/server');
  mockedFetchInternalQuery = mod.fetchInternalQuery as unknown as ReturnType<typeof vi.fn>;
  mockedFetchInternalQuery.mockReset();
  mockedFetchInternalQuery.mockImplementation((ref: unknown) => {
    if (ref === mockPracticeStatsRef) {
      return Promise.resolve({ dueCount: 0, streak: 0, lastPracticedAt: null });
    }
    if (ref === mockGetDashboardDataRef) {
      return Promise.resolve(defaultDashboardUnits());
    }
    if (ref === mockStudentVizRef) {
      return Promise.resolve({
        schemaVersion: 'v1',
        mastered: [],
        ready: [],
        blocked: [],
        reviewDue: [],
        recommendedNext: [],
        edges: [],
        activeMisconceptionCount: 0,
      });
    }
    return Promise.resolve(null);
  });
});

vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: vi.fn().mockImplementation((ref: unknown) => {
    if (ref === mockPracticeStatsRef) {
      return Promise.resolve({ dueCount: 0, streak: 0, lastPracticedAt: null });
    }
    if (ref === mockGetDashboardDataRef) {
      return Promise.resolve([
        {
          unitNumber: 1,
          unitTitle: 'Quadratic Functions',
          lessons: [
            {
              id: 'l1',
              unitNumber: 1,
              title: 'Intro',
              slug: 'intro',
              description: null,
              completedPhases: 0,
              totalPhases: 6,
              progressPercentage: 0,
            },
          ],
        },
      ]);
    }
    if (ref === mockStudentVizRef) {
      return Promise.resolve({
        schemaVersion: 'v1',
        mastered: [],
        ready: [],
        blocked: [],
        reviewDue: [],
        recommendedNext: [],
        edges: [],
        activeMisconceptionCount: 0,
      });
    }
    return Promise.resolve(null);
  }),
  internal: {
    student: {
      getDashboardData: mockGetDashboardDataRef,
      getStudentVisualization: mockStudentVizRef,
    },
    srs: { dashboard: { getPracticeStats: mockPracticeStatsRef } },
  },
}));

function setVisualization(visualization: Partial<MockVisualization>) {
  const full: MockVisualization = {
    schemaVersion: 'v1',
    mastered: [],
    ready: [],
    blocked: [],
    reviewDue: [],
    recommendedNext: [],
    edges: [],
    activeMisconceptionCount: 0,
    ...visualization,
  };
  mockedFetchInternalQuery.mockImplementation((ref: unknown) => {
    if (ref === mockPracticeStatsRef) {
      return Promise.resolve({ dueCount: 0, streak: 0, lastPracticedAt: null });
    }
    if (ref === mockGetDashboardDataRef) {
      return Promise.resolve(defaultDashboardUnits());
    }
    if (ref === mockStudentVizRef) {
      return Promise.resolve(full);
    }
    return Promise.resolve(null);
  });
}

// ---------------------------------------------------------------------------
// Adversarial: wire-level link contract (P3 surface regression guard).
//
// The P3 panel renders a `<Link>` for each recommended item whose
// `href` must equal `/student/study?focus=<encodeURIComponent(nodeId)>`
// per the P3 contract. The original Red tests verify the panel renders
// but never assert the link's `href` attribute. If a future refactor
// drops `encodeURIComponent` or changes the route shape, the P1 caller
// chain (FR-5) and the P3 contract (FR-2) would silently break.
// ---------------------------------------------------------------------------

describe('P3 wire-level link contract', () => {
  it('encodes the recommended item nodeId into the focus link href', async () => {
    setVisualization({
      recommendedNext: [
        {
          nodeId: 'im3-m1-linear-functions',
          title: 'Linear Functions',
          state: 'ready',
          difficulty: 0.45,
        },
      ],
    });

    const { default: DashboardPage } = await import('@/app/student/dashboard/page');
    const jsx = await DashboardPage({ searchParams: Promise.resolve({}) });
    render(jsx);

    const item = screen.getByTestId('recommended-next-item');
    expect(item.getAttribute('href')).toBe(
      '/student/study?focus=im3-m1-linear-functions',
    );
  });

  it('URL-encodes nodeId values that contain special characters', async () => {
    // Real planner nodeIds use the shape `math.im3.<area>.<id>` (dots are
    // safe in path segments but not in raw query strings) plus potentially
    // Unicode titles for internationalized subjects. Verify the panel
    // round-trips these without producing an unencoded link.
    setVisualization({
      recommendedNext: [
        {
          nodeId: 'math.im3.module 1/skill & functions',
          title: 'Module 1: Functions',
          state: 'ready',
          difficulty: 0.5,
        },
        {
          nodeId: '中文-技能',
          title: '中文技能',
          state: 'ready',
          difficulty: 0.5,
        },
      ],
    });

    const { default: DashboardPage } = await import('@/app/student/dashboard/page');
    const jsx = await DashboardPage({ searchParams: Promise.resolve({}) });
    render(jsx);

    const items = screen.getAllByTestId('recommended-next-item');
    expect(items).toHaveLength(2);
    expect(items[0].getAttribute('href')).toBe(
      `/student/study?focus=${encodeURIComponent('math.im3.module 1/skill & functions')}`,
    );
    expect(items[1].getAttribute('href')).toBe(
      `/student/study?focus=${encodeURIComponent('中文-技能')}`,
    );
  });
});

// ---------------------------------------------------------------------------
// Adversarial: XSS-safety boundary.
//
// The Zod schema (`visualNodeV1Schema.title: z.string().min(1)`) does
// not strip HTML; a malicious or sloppy curriculum ingestion could feed
// `<script>` into a node title. The P3 panel must render the value as
// escaped text per React's text-node contract. This guards against a
// future change that switches to `dangerouslySetInnerHTML`.
// ---------------------------------------------------------------------------

describe('P3 XSS-safety boundary', () => {
  it('escapes HTML/script tags in recommended item titles and descriptions', async () => {
    const xssTitle = '<script>window.__pwned=true</script>';
    const xssDescription = '<img src=x onerror="window.__pwned=true">';
    setVisualization({
      recommendedNext: [
        {
          nodeId: 'safe-id',
          title: xssTitle,
          description: xssDescription,
          state: 'ready',
          difficulty: 0.5,
        },
      ],
    });

    const { default: DashboardPage } = await import('@/app/student/dashboard/page');
    const jsx = await DashboardPage({ searchParams: Promise.resolve({}) });
    render(jsx);

    // The escaped text must be present in the DOM as text content, not
    // interpreted as a script. Using `getByText` with `normalizer` disabled
    // so that a successful match requires the literal text to exist.
    const item = screen.getByTestId('recommended-next-item');
    expect(item.textContent).toContain(xssTitle);
    expect(item.textContent).toContain(xssDescription);
    expect((globalThis as { __pwned?: boolean }).__pwned).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Adversarial: empty list with non-zero active misconception count.
//
// The original P3 Red suite covers the empty-list / zero-count case via
// the "No recommendations yet" test, and the populated-list / non-zero
// count via the happy-path test. It does NOT cover the empty-list /
// non-zero-count corner: a student with active misconceptions but no
// recommendations. The panel's `hasRecommendations && activeMisconceptionCount > 0`
// guard means the badge is suppressed in that case — this test pins
// that contract so a refactor cannot silently start showing a badge
// over an empty state.
// ---------------------------------------------------------------------------

describe('P3 empty-list / non-zero-count boundary', () => {
  it('suppresses the active-misconception badge when recommendedNext is empty but count > 0', async () => {
    setVisualization({
      recommendedNext: [],
      activeMisconceptionCount: 5,
    });

    const { default: DashboardPage } = await import('@/app/student/dashboard/page');
    const jsx = await DashboardPage({ searchParams: Promise.resolve({}) });
    render(jsx);

    expect(screen.getByTestId('recommended-next-panel')).toBeInTheDocument();
    expect(screen.getByText('No recommendations yet')).toBeInTheDocument();
    expect(screen.queryByTestId('recommended-next-item')).not.toBeInTheDocument();
    expect(screen.queryByTestId('active-misconception-count')).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Adversarial: difficulty = 0 / 1 / NaN rendering boundary.
//
// `formatDifficulty` returns an empty string for `NaN` and `undefined`
// per its contract, but the dashboard-level test only exercises 0.45.
// Boundary cases 0.0 ("0% difficulty") and 1.0 ("100% difficulty")
// exercise the rounding/formatting path at the edges, and `NaN` exercises
// the safety net. If `formatDifficulty` is changed to interpolate
// `difficulty` directly (e.g. `template literal`), 0 must still render
// "0% difficulty" (not "NaN% difficulty") and NaN must still render "".
// ---------------------------------------------------------------------------

describe('P3 difficulty boundary at the rendered layer', () => {
  const cases: ReadonlyArray<{
    label: string;
    difficulty: number;
    expected: string;
  }> = [
    { label: 'difficulty = 0', difficulty: 0, expected: '0% difficulty' },
    { label: 'difficulty = 1', difficulty: 1, expected: '100% difficulty' },
    { label: 'difficulty = NaN', difficulty: Number.NaN, expected: '' },
    {
      label: 'difficulty = 0.5 (rounds to 50%)',
      difficulty: 0.5,
      expected: '50% difficulty',
    },
  ];

  for (const { label, difficulty, expected } of cases) {
    it(`${label} → ${JSON.stringify(expected)}`, async () => {
      setVisualization({
        recommendedNext: [
          {
            nodeId: `node-${label.replace(/\W+/g, '-')}`,
            title: label,
            state: 'ready',
            difficulty,
          },
        ],
      });

      const { default: DashboardPage } = await import('@/app/student/dashboard/page');
      const jsx = await DashboardPage({ searchParams: Promise.resolve({}) });
      render(jsx);

      const item = screen.getByTestId('recommended-next-item');
      if (expected === '') {
        // Empty string: the difficulty span should have no text content.
        expect(item.textContent ?? '').not.toMatch(/% difficulty/);
      } else {
        expect(item.textContent).toContain(expected);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// Adversarial: null visualization payload boundary.
//
// The original P3 Red suite covers `recommendedNext: []` (empty state)
// and the throw path. It does NOT cover the case where
// `fetchInternalQuery` resolves to `null` for the visualization ref —
// e.g. a partially-deployed Convex function that returns null for some
// students. The dashboard page does `studentVisualization ?? emptyStudentVisualization()`
// so the panel must fall back to the empty state. This test pins that
// contract.
// ---------------------------------------------------------------------------

describe('P3 null visualization payload boundary', () => {
  it('falls back to the empty state when the visualization ref resolves to null', async () => {
    mockedFetchInternalQuery.mockImplementation((ref: unknown) => {
      if (ref === mockPracticeStatsRef) {
        return Promise.resolve({ dueCount: 0, streak: 0, lastPracticedAt: null });
      }
      if (ref === mockGetDashboardDataRef) {
        return Promise.resolve(defaultDashboardUnits());
      }
      if (ref === mockStudentVizRef) {
        return Promise.resolve(null);
      }
      return Promise.resolve(null);
    });

    const { default: DashboardPage } = await import('@/app/student/dashboard/page');
    const jsx = await DashboardPage({ searchParams: Promise.resolve({}) });
    render(jsx);

    expect(screen.getByTestId('recommended-next-panel')).toBeInTheDocument();
    expect(screen.getByText('No recommendations yet')).toBeInTheDocument();
    expect(screen.queryByTestId('recommended-next-item')).not.toBeInTheDocument();
    expect(screen.queryByTestId('active-misconception-count')).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Adversarial: focused description, no title.
//
// Boundary: a recommended item with a description but no `title` would
// trip the `title: z.string().min(1)` Zod rule at the planner layer, so
// this is structurally unreachable. The stubbed visualization bypasses
// the planner, so the panel's title rendering is exercised. The test
// confirms the panel does not crash if `title` is somehow an empty
// string and renders the description safely.
// ---------------------------------------------------------------------------

describe('P3 minimal-payload boundary', () => {
  it('renders an item with empty title and non-empty description without crashing', async () => {
    setVisualization({
      recommendedNext: [
        {
          nodeId: 'minimal-payload',
          title: '',
          description: 'A description only.',
          state: 'ready',
          // No difficulty, no domain.
        },
      ],
    });

    const { default: DashboardPage } = await import('@/app/student/dashboard/page');
    const jsx = await DashboardPage({ searchParams: Promise.resolve({}) });
    render(jsx);

    const item = screen.getByTestId('recommended-next-item');
    expect(item.textContent).toContain('A description only.');
    // No difficulty span: the `formatDifficulty` helper returns '' for
    // undefined, so the percentage label is absent.
    expect(item.textContent ?? '').not.toMatch(/% difficulty/);
  });
});
