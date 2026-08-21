import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import LoginPage from '../../../../app/auth/login/page';
import { DEMO_USERNAMES } from '../../../../lib/demo/scenarios';

describe('LoginPage pilot accounts', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('shows the shared password and every pilot username for a local deployment', async () => {
    vi.stubEnv('CONVEX_DEPLOYMENT', 'local:danielson');
    vi.stubEnv('DANIELSON_DEMO_PASSWORD', 'pilot-password');

    render(await LoginPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole('img', { name: 'Haidian Kaiwen Academy logo' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'HDKWA pilot accounts' })).toBeVisible();
    expect(screen.getAllByText('pilot-password')).toHaveLength(DEMO_USERNAMES.length);
    for (const username of DEMO_USERNAMES) {
      expect(screen.getByText(username)).toBeVisible();
    }
  });

  it('does not show pilot credentials for a hosted deployment', async () => {
    vi.stubEnv('CONVEX_DEPLOYMENT', 'dev:hosted-danielson');
    vi.stubEnv('DANIELSON_DEMO_PASSWORD', 'pilot-password');

    render(await LoginPage({ searchParams: Promise.resolve({}) }));

    expect(screen.queryByRole('img', { name: 'Haidian Kaiwen Academy logo' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'HDKWA pilot accounts' })).not.toBeInTheDocument();
    expect(screen.queryByText('pilot-password')).not.toBeInTheDocument();
  });
});
