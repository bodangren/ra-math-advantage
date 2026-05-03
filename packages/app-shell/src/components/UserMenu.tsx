'use client';

import { useAuth } from '../auth/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserMenuProps {
  /** Path to redirect after logout */
  logoutRedirectTo?: string;
  /** Path for the settings link */
  settingsHref?: string;
  /** Dashboard path shown when user is logged in */
  dashboardHref?: string;
}

export function UserMenu({
  logoutRedirectTo = '/',
  settingsHref = '/settings',
}: UserMenuProps) {
  const { user, profile, signOut, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push(logoutRedirectTo);
  };

  if (loading) {
    return <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />;
  }

  if (!user) {
    return (
      <div className="flex gap-2">
        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const displayName = profile?.display_name || user.email || 'User';
  const email = user.email;

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(displayName);

  return (
    <div className="relative inline-block">
      <details className="group">
        <summary className="list-none flex items-center cursor-pointer">
          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
            {initials}
          </div>
        </summary>
        <div className="absolute right-0 mt-1 w-56 rounded-md border bg-popover p-1 shadow-md z-50">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">{displayName}</p>
            <p className="text-xs text-muted-foreground">{email}</p>
          </div>
          <div className="h-px bg-border my-1" />
          <Link
            href={settingsHref}
            className="flex items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
          >
            Settings
          </Link>
          <div className="h-px bg-border my-1" />
          <button
            onClick={handleLogout}
            className="w-full flex items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent text-left"
          >
            Log out
          </button>
        </div>
      </details>
    </div>
  );
}
