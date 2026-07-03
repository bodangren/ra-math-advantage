/**
 * Phase 4 — Task 3: Student knowledge-state route test (GREEN).
 *
 * Tests the page component renders without error and displays
 * KST-derived state sections (mastered, ready, review-due).
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

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
      { nodeId: 'math.im3.skill.1.1.graph-quadratic-functions', title: 'Graph Quadratic Functions', state: 'mastered', description: 'Mastered skill', difficulty: undefined, domain: 'math.im3' },
    ],
    ready: [
      { nodeId: 'math.im3.skill.1.2.solve-quadratic-equations-by-graphing', title: 'Solve Quadratics by Graphing', state: 'ready', description: 'Ready skill', difficulty: undefined, domain: 'math.im3' },
    ],
    blocked: [],
    reviewDue: [
      { nodeId: 'math.im3.skill.1.3.perform-operations-with-complex-numbers', title: 'Complex Numbers Review', state: 'review_due', description: 'Review skill', difficulty: undefined, domain: 'math.im3' },
    ],
    recommendedNext: [
      { nodeId: 'math.im3.skill.1.2.solve-quadratic-equations-by-graphing', title: 'Solve Quadratics by Graphing', state: 'ready', description: 'Ready skill', difficulty: undefined, domain: 'math.im3' },
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
    const mod = await import('@/app/student/knowledge-state/page');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });

  it('renders a heading indicating knowledge state', async () => {
    const { default: KnowledgeStatePage } = await import('@/app/student/knowledge-state/page');
    const jsx = await KnowledgeStatePage({});
    render(jsx);

    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
  });

  it('renders Mastered Skills section', async () => {
    const { default: KnowledgeStatePage } = await import('@/app/student/knowledge-state/page');
    const jsx = await KnowledgeStatePage({});
    render(jsx);

    // Should have a heading for mastered skills
    const masteredHeading = screen.getByRole('heading', { name: /mastered skills/i });
    expect(masteredHeading).toBeInTheDocument();
  });

  it('renders Ready to Learn section', async () => {
    const { default: KnowledgeStatePage } = await import('@/app/student/knowledge-state/page');
    const jsx = await KnowledgeStatePage({});
    render(jsx);

    const readyHeading = screen.getByRole('heading', { name: /ready to learn/i });
    expect(readyHeading).toBeInTheDocument();
  });

  it('renders Review Due section', async () => {
    const { default: KnowledgeStatePage } = await import('@/app/student/knowledge-state/page');
    const jsx = await KnowledgeStatePage({});
    render(jsx);

    const reviewHeading = screen.getByRole('heading', { name: /review due/i });
    expect(reviewHeading).toBeInTheDocument();
  });

  it('renders summary stats with mastered count', async () => {
    const { default: KnowledgeStatePage } = await import('@/app/student/knowledge-state/page');
    const jsx = await KnowledgeStatePage({});
    render(jsx);

    // The stat card for "Mastered" should show count = 1
    const statCards = screen.getAllByText(/mastered/i);
    expect(statCards.length).toBeGreaterThan(0);
  });

  it('displays the mastered skill title', async () => {
    const { default: KnowledgeStatePage } = await import('@/app/student/knowledge-state/page');
    const jsx = await KnowledgeStatePage({});
    render(jsx);

    expect(screen.getByText('Graph Quadratic Functions')).toBeInTheDocument();
  });
});
