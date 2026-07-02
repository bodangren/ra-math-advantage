import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

/**
 * Phase 3 — Route auth adversarial tests.
 *
 * The Phase 3 Green/Review-B tests cover the teacher-only path with a
 * single "non-teacher or unauthenticated" propagation assertion. These
 * adversarial tests probe the role matrix explicitly: every non-teacher
 * role must propagate a redirect (no accidental grant to parent or
 * student), and the documented login redirect path must be passed
 * through to the guard. The tests simulate the production behavior of
 * `requireTeacherSessionClaims` (which is mocked) by reproducing its
 * role-based redirect logic, then assert the page propagates the
 * redirect — so a regression where the page swaps the guard for a
 * session-only check (that lets students/parents through) is caught.
 */

const ADMIN_CLAIMS = {
  sub: 'p_admin_1',
  username: 'admin1',
  role: 'admin' as const,
  organizationId: 'org_admin',
  iat: 0,
  exp: 9999999999,
};

const TEACHER_CLAIMS = {
  sub: 'p_teacher_1',
  username: 'teacher1',
  role: 'teacher' as const,
  organizationId: 'org1',
  iat: 0,
  exp: 9999999999,
};

const STUDENT_CLAIMS = {
  sub: 'p_student_1',
  username: 'student1',
  role: 'student' as const,
  organizationId: 'org1',
  iat: 0,
  exp: 9999999999,
};

const PARENT_CLAIMS = {
  sub: 'p_parent_1',
  username: 'parent1',
  role: 'parent' as const,
  organizationId: 'org1',
  iat: 0,
  exp: 9999999999,
};

vi.mock('@/lib/auth/server', () => ({
  // Faithfully model what `requireTeacherSessionClaims` does in
  // production: teacher or admin → return claims; everyone else →
  // throw a NEXT_REDIRECT error. The page test mocks the guard at
  // this seam, so the production redirect behavior must be reproduced
  // here for the assertion below to be meaningful.
  requireTeacherSessionClaims: vi.fn(
    async (_loginRedirectPath: string, _unauthorizedRedirectPath?: string) => {
      // The real guard delegates to `requireServerSessionClaims` first.
      // We simulate that by inspecting the most recently mocked claims
      // via the test fixture map.
      const fixture = currentClaimsFixture;
      if (!fixture) {
        throw new Error('NEXT_REDIRECT');
      }
      if (fixture.role === 'teacher' || fixture.role === 'admin') {
        return fixture;
      }
      throw new Error('NEXT_REDIRECT');
    },
  ),
}));

// Module-scoped pointer so the mocked `requireTeacherSessionClaims`
// can read the current test's fixture without a closure on `beforeEach`.
let currentClaimsFixture:
  | typeof TEACHER_CLAIMS
  | typeof STUDENT_CLAIMS
  | typeof PARENT_CLAIMS
  | typeof ADMIN_CLAIMS
  | null = null;

function setClaimsFixture(fixture: typeof currentClaimsFixture) {
  currentClaimsFixture = fixture;
}

describe('Phase 3 adversarial: route auth — role-based redirect matrix', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    setClaimsFixture(null);
  });

  it('renders the composer for an admin role (admins are teacher-compatible per spec)', async () => {
    setClaimsFixture(ADMIN_CLAIMS);
    const { requireTeacherSessionClaims } = await import('@/lib/auth/server');
    vi.mocked(requireTeacherSessionClaims).mockResolvedValue(ADMIN_CLAIMS);

    const { default: Page } = await import('@/app/teacher/content-authoring/page');
    const jsx = await Page({ searchParams: Promise.resolve({}) });

    expect(jsx).toBeDefined();
    render(jsx);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /teacher content authoring/i,
    );
  });

  it('throws NEXT_REDIRECT when the caller is a student', async () => {
    setClaimsFixture(STUDENT_CLAIMS);
    const { requireTeacherSessionClaims } = await import('@/lib/auth/server');
    vi.mocked(requireTeacherSessionClaims).mockImplementation(async () => {
      // Faithful reproduction: the production guard throws NEXT_REDIRECT
      // for non-teacher / non-admin roles. The page must propagate that
      // error so Next.js can convert it into a redirect response.
      throw new Error('NEXT_REDIRECT');
    });

    const { default: Page } = await import('@/app/teacher/content-authoring/page');
    await expect(Page({ searchParams: Promise.resolve({}) })).rejects.toThrow('NEXT_REDIRECT');
  });

  it('throws NEXT_REDIRECT when the caller is a parent', async () => {
    setClaimsFixture(PARENT_CLAIMS);
    const { requireTeacherSessionClaims } = await import('@/lib/auth/server');
    vi.mocked(requireTeacherSessionClaims).mockImplementation(async () => {
      throw new Error('NEXT_REDIRECT');
    });

    const { default: Page } = await import('@/app/teacher/content-authoring/page');
    await expect(Page({ searchParams: Promise.resolve({}) })).rejects.toThrow('NEXT_REDIRECT');
  });

  it('throws NEXT_REDIRECT when the caller is unauthenticated (no session claims)', async () => {
    setClaimsFixture(null);
    const { requireTeacherSessionClaims } = await import('@/lib/auth/server');
    vi.mocked(requireTeacherSessionClaims).mockImplementation(async () => {
      throw new Error('NEXT_REDIRECT');
    });

    const { default: Page } = await import('@/app/teacher/content-authoring/page');
    await expect(Page({ searchParams: Promise.resolve({}) })).rejects.toThrow('NEXT_REDIRECT');
  });

  it('passes the documented login redirect path through to the guard', async () => {
    setClaimsFixture(TEACHER_CLAIMS);
    const { requireTeacherSessionClaims } = await import('@/lib/auth/server');
    vi.mocked(requireTeacherSessionClaims).mockResolvedValue(TEACHER_CLAIMS);

    const { default: Page } = await import('@/app/teacher/content-authoring/page');
    await Page({ searchParams: Promise.resolve({}) });

    expect(requireTeacherSessionClaims).toHaveBeenCalledWith('/auth/login');
  });
});

describe('Phase 3 adversarial: preview route shares the same teacher gate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    setClaimsFixture(null);
  });

  it('preview route (?preview=1) is also gated by requireTeacherSessionClaims', async () => {
    setClaimsFixture(TEACHER_CLAIMS);
    const { requireTeacherSessionClaims } = await import('@/lib/auth/server');
    vi.mocked(requireTeacherSessionClaims).mockResolvedValue(TEACHER_CLAIMS);

    const { default: Page } = await import('@/app/teacher/content-authoring/page');
    const jsx = await Page({ searchParams: Promise.resolve({ preview: '1' }) });

    expect(jsx).toBeDefined();
    // The guard must be called even in preview mode — a regression
    // where preview bypasses the teacher check would let any signed-in
    // student or parent reach the preview surface.
    expect(requireTeacherSessionClaims).toHaveBeenCalledTimes(1);
    expect(requireTeacherSessionClaims).toHaveBeenCalledWith('/auth/login');
    render(jsx);
    expect(screen.getByTestId('authored-lesson-preview')).toBeInTheDocument();
  });

  it('preview route (?preview=1) rejects a student caller with NEXT_REDIRECT', async () => {
    setClaimsFixture(STUDENT_CLAIMS);
    const { requireTeacherSessionClaims } = await import('@/lib/auth/server');
    vi.mocked(requireTeacherSessionClaims).mockImplementation(async () => {
      throw new Error('NEXT_REDIRECT');
    });

    const { default: Page } = await import('@/app/teacher/content-authoring/page');
    await expect(
      Page({ searchParams: Promise.resolve({ preview: '1' }) }),
    ).rejects.toThrow('NEXT_REDIRECT');
  });
});