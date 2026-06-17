import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserMenu } from '@/components/user-menu';

// Mock Next.js navigation
const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/',
}));

// UserMenu lives inside @math-platform/app-shell and imports `../auth/AuthProvider`
// via a package-relative path, so the mocked specifier must resolve to that exact
// module file. Mocking only `@math-platform/app-shell/auth` does not intercept the
// internal relative import and leaves the real AuthProvider in place. The path is
// computed inside `vi.hoisted` so it is available when vi.mock runs (which is
// hoisted above all other imports).
const { authProviderPath } = vi.hoisted(() => {
  // Repo layout: apps/bus-math-v2/__tests__/components/user-menu.test.tsx
  // Target:     packages/app-shell/src/auth/AuthProvider.tsx
  // Use the workspace path (process.cwd is the bus-math-v2 app when tests run).
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

// Also mock the package subpath in case any code path imports through it.
vi.mock('@math-platform/app-shell/auth', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('UserMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('unauthenticated state', () => {
    beforeEach(() => {
      mockAuthContext.user = null;
      mockAuthContext.profile = null;
      mockAuthContext.loading = false;
    });

    it('shows Sign in button', () => {
      render(<UserMenu />);
      expect(screen.getByText('Sign in')).toBeInTheDocument();
    });

    it('Sign in button links to /auth/login', () => {
      render(<UserMenu />);
      const signInButton = screen.getByText('Sign in').closest('a');
      expect(signInButton).toHaveAttribute('href', '/auth/login');
    });
  });

  describe('authenticated users', () => {
    beforeEach(() => {
      mockAuthContext.user = { id: 'user-1', email: 'student@example.com' };
      mockAuthContext.profile = {
        id: 'profile-1',
        username: 'student1',
        role: 'student',
        organization_id: 'org-1',
        display_name: 'Student Name',
        avatar_url: null,
        metadata: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };
      mockAuthContext.loading = false;
    });

    it('shows user avatar as dropdown trigger', () => {
      render(<UserMenu />);
      const trigger = screen.getByRole('button');
      expect(trigger).toBeInTheDocument();
    });

    it('shows Settings link in dropdown menu', async () => {
      render(<UserMenu />);

      const trigger = screen.getByRole('button');
      await userEvent.click(trigger);

      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('shows Settings link pointing to /settings', async () => {
      render(<UserMenu />);

      const trigger = screen.getByRole('button');
      await userEvent.click(trigger);

      const settingsLink = screen.getByText('Settings').closest('a');
      expect(settingsLink).toHaveAttribute('href', '/settings');
    });

    it('shows Dashboard link for students in dropdown menu', async () => {
      mockAuthContext.profile!.role = 'student';
      render(<UserMenu />);

      const trigger = screen.getByRole('button');
      await userEvent.click(trigger);

      const dashboardLink = screen.getByText('Dashboard');
      expect(dashboardLink).toBeInTheDocument();
    });

    it('adds role-aware dashboard link for students pointing to /student/dashboard', async () => {
      mockAuthContext.profile!.role = 'student';
      render(<UserMenu />);

      const trigger = screen.getByRole('button');
      await userEvent.click(trigger);

      const dashboardLink = screen.getByText('Dashboard');
      expect(dashboardLink.closest('a')).toHaveAttribute('href', '/student/dashboard');
    });

    it('adds role-aware dashboard link for teachers pointing to /teacher/dashboard', async () => {
      mockAuthContext.profile!.role = 'teacher';
      render(<UserMenu />);

      const trigger = screen.getByRole('button');
      await userEvent.click(trigger);

      const dashboardLink = screen.getByText('Dashboard');
      expect(dashboardLink.closest('a')).toHaveAttribute('href', '/teacher/dashboard');
    });

    it('adds role-aware dashboard link for admins pointing to /teacher/dashboard', async () => {
      mockAuthContext.profile!.role = 'admin';
      render(<UserMenu />);

      const trigger = screen.getByRole('button');
      await userEvent.click(trigger);

      const dashboardLink = screen.getByText('Dashboard');
      expect(dashboardLink.closest('a')).toHaveAttribute('href', '/teacher/dashboard');
    });
  });
});