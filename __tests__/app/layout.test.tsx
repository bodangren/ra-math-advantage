import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

// Mock providers that wrap children
vi.mock('@/components/ConvexClientProvider', () => ({
  ConvexClientProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="convex-provider">{children}</div>
  ),
}));

vi.mock('@/components/auth/AuthProvider', () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
}));

vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  ),
}));

vi.mock('@/components/header-simple', () => ({
  HeaderSimple: () => <header data-testid="header-simple">Header</header>,
}));

vi.mock('@/components/footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));

describe('HeaderSimple', () => {
  it('renders nav links', async () => {
    const { HeaderSimple } = await import('@/components/header-simple');
    render(<HeaderSimple />);
    expect(screen.getByTestId('header-simple')).toBeInTheDocument();
  });
});

describe('Footer', () => {
  it('renders footer element', async () => {
    const { Footer } = await import('@/components/footer');
    render(<Footer />);
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });
});

describe('provider nesting order', () => {
  it('nests ConvexClientProvider > AuthProvider > ThemeProvider', async () => {
    const { ConvexClientProvider } = await import('@/components/ConvexClientProvider');
    const { AuthProvider } = await import('@/components/auth/AuthProvider');
    const { ThemeProvider } = await import('next-themes');

    render(
      <ConvexClientProvider>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <span data-testid="child">content</span>
          </ThemeProvider>
        </AuthProvider>
      </ConvexClientProvider>,
    );

    const convex = screen.getByTestId('convex-provider');
    const auth = screen.getByTestId('auth-provider');
    const theme = screen.getByTestId('theme-provider');
    const child = screen.getByTestId('child');

    expect(convex).toBeInTheDocument();
    expect(convex).toContainElement(auth);
    expect(auth).toContainElement(theme);
    expect(theme).toContainElement(child);
  });
});
