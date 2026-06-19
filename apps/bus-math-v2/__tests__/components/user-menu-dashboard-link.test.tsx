/**
 * Red-phase contract test for repo-hygiene-remediation_20260616 Task 3.1b.
 *
 * UserMenu (packages/app-shell/src/components/UserMenu.tsx) currently exposes
 * a `dashboardHref?: string` prop on its props interface (line 13) but never
 * renders a Dashboard anchor or branches on `profile.role` inside the
 * dropdown body. This file is a Red contract: every `it` block fails today
 * because the rendered dropdown contains no element with the text
 * "Dashboard", so `screen.getByText('Dashboard')` throws immediately.
 *
 * Red command (bounded to this file):
 *   npx vitest run __tests__/components/user-menu-dashboard-link.test.tsx
 *
 * Expected Red (verified by inspection of UserMenu.tsx):
 *   4 failed / 0 passed — every "getByText('Dashboard')" call throws
 *   "Unable to find an element with the text: Dashboard" before the
 *   `closest('a')` assertion is even reached.
 *
 * Once Task 3.1b ships its role-aware Dashboard link in UserMenu, these
 * tests turn green. They pair with the existing Dashboard cases in
 * user-menu.test.tsx (lines 141–183, committed in 540473fa) and the
 * existing 5 green UserMenu cases in that same file.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserMenu } from '@/components/user-menu';

// UserMenu imports useAuth from '../auth/AuthProvider' inside
// packages/app-shell/src/components/UserMenu.tsx. The mock specifier must
// resolve to that exact module file; mocking only the package barrel does
// not intercept the internal relative import. Path is computed inside
// vi.hoisted so it is available when vi.mock runs (which is hoisted above
// all other imports).
const { authProviderPath } = vi.hoisted(() => {
  const fromCwd = (rel: string) => `${process.cwd()}/${rel}`;
  return {
    authProviderPath: fromCwd('../../packages/app-shell/src/auth/AuthProvider.tsx'),
  };
});

const mockSignOut = vi.fn();

type MockProfile = {
  id: string;
  username: string;
  role: 'student' | 'teacher' | 'admin';
  organization_id: string;
  display_name: string | null;
  avatar_url: string | null;
  metadata: unknown;
  created_at: string;
  updated_at: string;
};

const mockAuthContext: {
  signIn: ReturnType<typeof vi.fn>;
  profile: MockProfile | null;
  user: { id: string; email?: string } | null;
  loading: boolean;
  signOut: typeof mockSignOut;
} = {
  signIn: vi.fn(),
  profile: null,
  user: null,
  loading: false,
  signOut: mockSignOut,
};

vi.mock(authProviderPath, () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('@math-platform/app-shell/auth', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

function makeProfile(role: MockProfile['role']): MockProfile {
  return {
    id: `profile-${role}`,
    username: `${role}-user`,
    role,
    organization_id: 'org-1',
    display_name: `${role[0].toUpperCase()}${role.slice(1)} User`,
    avatar_url: null,
    metadata: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };
}

describe('UserMenu Dashboard link (Red contract for Task 3.1b)', () => {
  beforeEach(() => {
    mockAuthContext.user = { id: 'user-1', email: 'user@example.com' };
    mockAuthContext.loading = false;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a Dashboard link in the dropdown for a student pointing to /student/dashboard', async () => {
    mockAuthContext.profile = makeProfile('student');
    render(<UserMenu />);

    await userEvent.click(screen.getByRole('button'));

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).not.toBeNull();
    expect(dashboardLink).toHaveAttribute('href', '/student/dashboard');
  });

  it('renders a Dashboard link in the dropdown for a teacher pointing to /teacher/dashboard', async () => {
    mockAuthContext.profile = makeProfile('teacher');
    render(<UserMenu />);

    await userEvent.click(screen.getByRole('button'));

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).not.toBeNull();
    expect(dashboardLink).toHaveAttribute('href', '/teacher/dashboard');
  });

  it('renders a Dashboard link in the dropdown for an admin pointing to /teacher/dashboard', async () => {
    mockAuthContext.profile = makeProfile('admin');
    render(<UserMenu />);

    await userEvent.click(screen.getByRole('button'));

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).not.toBeNull();
    expect(dashboardLink).toHaveAttribute('href', '/teacher/dashboard');
  });

  it('does not render a Dashboard link for an unauthenticated user', () => {
    mockAuthContext.user = null;
    mockAuthContext.profile = null;
    render(<UserMenu />);

    expect(screen.queryByText('Dashboard')).toBeNull();
  });
});
