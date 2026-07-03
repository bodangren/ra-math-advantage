/**
 * Phase 4 — Task 3: Student knowledge-state route RED test.
 *
 * Per test-strategy.md §4.1, this test imports the page component
 * from a module that does not exist yet — the import fails at module
 * resolution. This is the intended falsifiability signal.
 *
 * After GREEN implementation, the page must:
 *   1. Be a server component gated by requireStudentSessionClaims
 *   2. Use fetchInternalQuery to call the new Convex query
 *   3. Render KST-derived state using the design system
 *   4. Render without errors in jsdom
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// RED — import fails because the page module does not exist yet.
// The Green phase creates `app/student/knowledge-state/page.tsx`.

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

vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: vi.fn().mockResolvedValue({
    schemaVersion: 'v1',
    mastered: [
      { nodeId: 'math.im3.skill.1.1.graph-quadratic-functions', title: 'Graph Quadratic Functions', state: 'mastered' },
    ],
    ready: [
      { nodeId: 'math.im3.skill.1.2.solve-quadratic-equations-by-graphing', title: 'Solve Quadratics by Graphing', state: 'ready' },
    ],
    blocked: [],
    reviewDue: [
      { nodeId: 'math.im3.skill.1.1.graph-quadratic-functions', title: 'Graph Quadratic Functions', state: 'review_due' },
    ],
    recommendedNext: [
      { nodeId: 'math.im3.skill.1.2.solve-quadratic-equations-by-graphing', title: 'Solve Quadratics by Graphing', state: 'ready' },
    ],
    edges: [],
    activeMisconceptionCount: 0,
  }),
  internal: {
    student: { getStudentKnowledgeState: 'mock-getStudentKnowledgeState' },
  },
}));

describe('Phase 4 — StudentKnowledgeStatePage route', () => {
  it('renders without error (page module exists and default export is a function)', async () => {
    // Dynamic import to catch module resolution errors
    const mod = await import('@/app/student/knowledge-state/page');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });

  it('renders a heading indicating knowledge state', async () => {
    const { default: KnowledgeStatePage } = await import('@/app/student/knowledge-state/page');
    const jsx = await KnowledgeStatePage({});
    render(jsx);

    // Should have a heading
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
  });

  it('renders mastered skills count', async () => {
    const { default: KnowledgeStatePage } = await import('@/app/student/knowledge-state/page');
    const jsx = await KnowledgeStatePage({});
    render(jsx);

    // Should mention mastered skills or display a count
    expect(screen.getByText(/mastered/i)).toBeInTheDocument();
  });

  it('renders ready-to-learn skills', async () => {
    const { default: KnowledgeStatePage } = await import('@/app/student/knowledge-state/page');
    const jsx = await KnowledgeStatePage({});
    render(jsx);

    // Should mention ready or next skills
    expect(screen.getByText(/ready/i)).toBeInTheDocument();
  });

  it('renders review-due skills', async () => {
    const { default: KnowledgeStatePage } = await import('@/app/student/knowledge-state/page');
    const jsx = await KnowledgeStatePage({});
    render(jsx);

    // Should mention review-due or decaying skills
    expect(screen.getByText(/review/i)).toBeInTheDocument();
  });
});
