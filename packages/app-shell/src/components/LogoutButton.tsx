'use client';

import { useAuth } from '../auth/AuthProvider';
import { useRouter } from 'next/navigation';

interface LogoutButtonProps {
  className?: string;
  redirectTo?: string;
}

/**
 * Button component that logs out the current user and redirects.
 * @param props - className and redirectTo path after logout
 * @returns Logout button element
 */
export function LogoutButton({ className, redirectTo = '/auth/login' }: LogoutButtonProps) {
  const router = useRouter();
  const { signOut } = useAuth();

  const logout = async () => {
    await signOut();
    router.push(redirectTo);
  };

  return (
    <button onClick={logout} className={className ?? 'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent'}>
      Logout
    </button>
  );
}
