import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  singleStudentLinks,
  multiStudentLinks,
  pendingParentLinks,
  STUDENT_ALPHA_ID,
  STUDENT_BETA_ID,
} from '@/__tests__/_fixtures/parent-portal/parentLinks';
import {
  richParentProjection,
  emptyParentProjection,
  parentProjectionsByStudentId,
  TEACHER_ONLY_KEYS,
} from '@/__tests__/_fixtures/parent-portal/parentProjection';
import { makeParentClaims } from '@/__tests__/_fixtures/parent-portal/parentClaims';

/**
 * Phase 1 (Track parent_portal_prod_wiring_remediation_20260621) — Production
 * /parent route Red tests.
 *
 * Per the 2026-06-21 completion audit, the archived parent-portal track closed
 * against component-level tests while `app/parent/page.tsx` remained a static
 * stub. These tests render the real production route with the auth and Convex
 * seams stubbed, asserting that the route:
 *   - calls `requireParentServerSessionClaims('/parent')`,
 *   - fetches parent links and a parent-safe projection,
 *   - renders `ParentDashboard`, `StudentSwitcher`, and `ParentEmptyStates`
 *     from live route data,
 *   - fails closed for non-parent sessions and teacher-only fields,
 *   - has at least one non-test caller for every component/service.
 */

const parentClaims = makeParentClaims();

vi.mock('@/lib/auth/parent-server-guards', () => {
  const requireParentServerSessionClaims = vi.fn();
  return { requireParentServerSessionClaims };
});

vi.mock('@/lib/convex/server', () => {
  const fetchInternalQuery = vi.fn();
  return {
    fetchInternalQuery,
    internal: {
      parent: {
        links: {
          listParentLinksQuery: 'parent:links:listParentLinksQuery',
        },
        visualization: {
          projectParentVisualizationQuery:
            'parent:visualization:projectParentVisualizationQuery',
        },
      },
    },
  };
});

async function loadParentPage() {
  const { default: ParentPage } = await import('@/app/parent/page');
  return ParentPage;
}

describe('ParentPage — one linked student', () => {
  it('renders ParentDashboard from the parent projection payload', async () => {
    const { requireParentServerSessionClaims } = await import(
      '@/lib/auth/parent-server-guards'
    );
    requireParentServerSessionClaims.mockResolvedValue(parentClaims);

    const { fetchInternalQuery } = await import('@/lib/convex/server');
    const mockedFetchInternalQuery = fetchInternalQuery as unknown as ReturnType<
      typeof vi.fn
    >;
    mockedFetchInternalQuery.mockImplementation(
      (ref: unknown, args: Record<string, unknown>) => {
        const refName = String(ref);
        if (refName.includes('listParentLinksQuery')) {
          return Promise.resolve(singleStudentLinks);
        }
        if (refName.includes('projectParentVisualizationQuery')) {
          expect(args).toMatchObject({
            studentId: STUDENT_ALPHA_ID,
            parentProfileId: parentClaims.sub,
          });
          return Promise.resolve(richParentProjection);
        }
        return Promise.resolve(null);
      },
    );

    const ParentPage = await loadParentPage();
    const jsx = await ParentPage();
    render(jsx);

    expect(screen.getByTestId('parent-dashboard-can-do')).toHaveTextContent(
      'Can Quadratic basics',
    );
    expect(
      screen.getByTestId('parent-student-switcher-single'),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('parent-empty-state-no-links'),
    ).not.toBeInTheDocument();

    expect(requireParentServerSessionClaims).toHaveBeenCalledWith('/parent');
    expect(mockedFetchInternalQuery).toHaveBeenCalledWith(
      'parent:links:listParentLinksQuery',
      expect.objectContaining({ parentProfileId: parentClaims.sub }),
    );
    expect(mockedFetchInternalQuery).toHaveBeenCalledWith(
      'parent:visualization:projectParentVisualizationQuery',
      expect.objectContaining({
        studentId: STUDENT_ALPHA_ID,
        parentProfileId: parentClaims.sub,
      }),
    );
  });
});

describe('ParentPage — multi-student switcher', () => {
  it('renders StudentSwitcher buttons for a parent with multiple active links', async () => {
    const { requireParentServerSessionClaims } = await import(
      '@/lib/auth/parent-server-guards'
    );
    requireParentServerSessionClaims.mockResolvedValue(parentClaims);

    const { fetchInternalQuery } = await import('@/lib/convex/server');
    const mockedFetchInternalQuery = fetchInternalQuery as unknown as ReturnType<
      typeof vi.fn
    >;
    mockedFetchInternalQuery.mockImplementation(
      (ref: unknown, args: Record<string, unknown>) => {
        const refName = String(ref);
        if (refName.includes('listParentLinksQuery')) {
          return Promise.resolve(multiStudentLinks);
        }
        if (refName.includes('projectParentVisualizationQuery')) {
          const studentId =
            typeof args.studentId === 'string' ? args.studentId : undefined;
          const projection = studentId
            ? parentProjectionsByStudentId[studentId]
            : undefined;
          return Promise.resolve(projection ?? emptyParentProjection);
        }
        return Promise.resolve(null);
      },
    );

    const ParentPage = await loadParentPage();
    const jsx = await ParentPage();
    render(jsx);

    const switcher = screen.getByTestId('parent-student-switcher');
    expect(switcher).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(2);

    expect(requireParentServerSessionClaims).toHaveBeenCalledWith('/parent');
    expect(mockedFetchInternalQuery).toHaveBeenCalledWith(
      'parent:visualization:projectParentVisualizationQuery',
      expect.objectContaining({ studentId: STUDENT_ALPHA_ID }),
    );
    expect(mockedFetchInternalQuery).toHaveBeenCalledWith(
      'parent:visualization:projectParentVisualizationQuery',
      expect.objectContaining({ studentId: STUDENT_BETA_ID }),
    );
  });
});

describe('ParentPage — no linked students', () => {
  it('renders ParentEmptyStates when the parent has no active links', async () => {
    const { requireParentServerSessionClaims } = await import(
      '@/lib/auth/parent-server-guards'
    );
    requireParentServerSessionClaims.mockResolvedValue(parentClaims);

    const { fetchInternalQuery } = await import('@/lib/convex/server');
    const mockedFetchInternalQuery = fetchInternalQuery as unknown as ReturnType<
      typeof vi.fn
    >;
    mockedFetchInternalQuery.mockResolvedValue([]);

    const ParentPage = await loadParentPage();
    const jsx = await ParentPage();
    render(jsx);

    expect(
      screen.getByTestId('parent-empty-state-no-links'),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('parent-dashboard-can-do'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('parent-student-switcher'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('parent-student-switcher-single'),
    ).not.toBeInTheDocument();
  });
});

describe('ParentPage — only pending links', () => {
  it('renders the pending empty state when the parent has links but none are active', async () => {
    const { requireParentServerSessionClaims } = await import(
      '@/lib/auth/parent-server-guards'
    );
    requireParentServerSessionClaims.mockResolvedValue(parentClaims);

    const { fetchInternalQuery } = await import('@/lib/convex/server');
    const mockedFetchInternalQuery = fetchInternalQuery as unknown as ReturnType<
      typeof vi.fn
    >;
    mockedFetchInternalQuery.mockImplementation(
      (ref: unknown, _args: Record<string, unknown>) => {
        const refName = String(ref);
        if (refName.includes('listParentLinksQuery')) {
          return Promise.resolve(pendingParentLinks);
        }
        return Promise.resolve(null);
      },
    );

    const ParentPage = await loadParentPage();
    const jsx = await ParentPage();
    render(jsx);

    expect(
      screen.getByTestId('parent-empty-state-pending-link'),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('parent-dashboard-can-do'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('parent-student-switcher'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('parent-student-switcher-single'),
    ).not.toBeInTheDocument();
  });
});

describe('ParentPage — fail-closed behavior', () => {
  it('redirects non-parent sessions using the same guard used in production', async () => {
    const { requireParentServerSessionClaims } = await import(
      '@/lib/auth/parent-server-guards'
    );
    requireParentServerSessionClaims.mockImplementation(() => {
      const err = new Error('NEXT_REDIRECT:/auth/login?redirect=/parent');
      (err as Error & { __isRedirect: true }).__isRedirect = true;
      throw err;
    });

    const ParentPage = await loadParentPage();
    await expect((async () => ParentPage())()).rejects.toThrow(
      'NEXT_REDIRECT:/auth/login?redirect=/parent',
    );
    expect(requireParentServerSessionClaims).toHaveBeenCalledWith('/parent');
  });

  it('fetches the parent visualization query, never a teacher visualization', async () => {
    const { requireParentServerSessionClaims } = await import(
      '@/lib/auth/parent-server-guards'
    );
    requireParentServerSessionClaims.mockResolvedValue(parentClaims);

    const { fetchInternalQuery } = await import('@/lib/convex/server');
    const mockedFetchInternalQuery = fetchInternalQuery as unknown as ReturnType<
      typeof vi.fn
    >;
    mockedFetchInternalQuery.mockImplementation(
      (ref: unknown, _args: Record<string, unknown>) => {
        const refName = String(ref);
        if (refName.includes('listParentLinksQuery')) {
          return Promise.resolve(singleStudentLinks);
        }
        if (refName.includes('projectParentVisualizationQuery')) {
          return Promise.resolve(richParentProjection);
        }
        if (refName.includes('TeacherVisualization') || refName.includes('teacherVisualization')) {
          return Promise.reject(new Error('teacher visualization requested'));
        }
        return Promise.resolve(null);
      },
    );

    const ParentPage = await loadParentPage();
    const jsx = await ParentPage();
    render(jsx);

    expect(mockedFetchInternalQuery).toHaveBeenCalledWith(
      'parent:visualization:projectParentVisualizationQuery',
      expect.anything(),
    );

    const teacherCalls = mockedFetchInternalQuery.mock.calls.filter(
      ([ref]: [unknown, ...unknown[]]) => {
        const refName = String(ref);
        return (
          refName.includes('TeacherVisualization') ||
          refName.includes('teacherVisualization')
        );
      },
    );
    expect(teacherCalls).toHaveLength(0);

    const text = document.body.textContent ?? '';
    for (const key of TEACHER_ONLY_KEYS) {
      expect(text).not.toContain(key);
    }
  });
});

describe('ParentPage — non-test-caller contract', () => {
  it('has a non-test caller for every parent portal component/service claimed complete', async () => {
    const { readdir, readFile } = await import('node:fs/promises');
    const { resolve, dirname } = await import('node:path');
    const { fileURLToPath } = await import('node:url');

    const here = dirname(fileURLToPath(import.meta.url));
    const appRoot = resolve(here, '../../../../');

    async function* walk(dir: string): AsyncGenerator<string> {
      const entries = await readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const path = resolve(dir, entry.name);
        if (entry.isDirectory()) {
          const name = entry.name;
          if (
            name === '__tests__' ||
            name === 'node_modules' ||
            name === '.next' ||
            name === '.git' ||
            name === 'dist'
          ) {
            continue;
          }
          yield* walk(path);
        } else if (
          entry.isFile() &&
          /\.(tsx?|jsx?|mjs|cjs)$/.test(entry.name)
        ) {
          yield path;
        }
      }
    }

    async function hasNonTestCaller(
      symbol: string,
      ownFile?: string,
    ): Promise<boolean> {
      for await (const path of walk(appRoot)) {
        if (ownFile && path.endsWith(ownFile)) continue;
        const src = await readFile(path, 'utf8');
        if (new RegExp(`\\b${symbol}\\b`).test(src)) return true;
      }
      return false;
    }

    const requiredCallers = [
      { symbol: 'ParentDashboard', ownFile: '/ParentDashboard.tsx' },
      { symbol: 'StudentSwitcher', ownFile: '/StudentSwitcher.tsx' },
      { symbol: 'ParentEmptyStates', ownFile: '/ParentEmptyStates.tsx' },
      { symbol: 'requireParentServerSessionClaims', ownFile: '/parent-server-guards.ts' },
      { symbol: 'projectParentVisualizationQuery' },
    ];

    for (const { symbol, ownFile } of requiredCallers) {
      expect(
        await hasNonTestCaller(symbol, ownFile),
        `${symbol} must have a non-test production caller`,
      ).toBe(true);
    }
  });
});
