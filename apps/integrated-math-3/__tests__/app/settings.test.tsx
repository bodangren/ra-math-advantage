import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';


const mockClaims = { sub: 'p1', username: 'user1', role: 'student' as const, organizationId: 'org1', iat: 0, exp: 9999999999 };

vi.mock('@/lib/auth/server', () => ({
  requireServerSessionClaims: vi.fn().mockResolvedValue(mockClaims),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn().mockReturnValue({ push: vi.fn() }),
  useSearchParams: vi.fn().mockReturnValue({ get: vi.fn().mockReturnValue(null) }),
}));

vi.mock('@/components/auth/AuthProvider', () => ({
  useAuth: vi.fn().mockReturnValue({
    user: { id: 'p1' },
    profile: { role: 'student' },
    loading: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}));

describe('SettingsPage', () => {
  it('renders settings heading', async () => {
    const { default: SettingsPage } = await import('@/app/settings/page');
    const jsx = await SettingsPage();
    render(jsx);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/settings/i);
  });

  it('renders change password section', async () => {
    const { default: SettingsPage } = await import('@/app/settings/page');
    const jsx = await SettingsPage();
    render(jsx);
    expect(screen.getByText(/change password/i)).toBeInTheDocument();
  });
});
