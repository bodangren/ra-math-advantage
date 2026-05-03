// @math-platform/app-shell
// Shared app shell components: auth, layout, providers

// Providers
export { ConvexClientProvider } from './providers/ConvexClientProvider';

// Auth
export { AuthProvider, useAuth, usernameToEmail } from './auth/AuthProvider';
export type { User, Profile, AuthContextValue } from './auth/AuthProvider';

// Components
export { LogoutButton } from './components/LogoutButton';
export { ThemeSwitcher } from './components/ThemeSwitcher';
export { UserMenu } from './components/UserMenu';

// Layout
export { HeaderSimple } from './layout/HeaderSimple';
export type { HeaderSimpleProps, NavItem } from './layout/HeaderSimple';
export { Footer } from './layout/Footer';
export type { FooterProps, FooterLink, FooterSection } from './layout/Footer';
