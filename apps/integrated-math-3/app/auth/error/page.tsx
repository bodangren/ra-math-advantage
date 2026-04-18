'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="space-y-4 text-center">
      <h1 className="text-2xl font-display font-semibold text-destructive">Authentication Error</h1>
      <p className="text-sm text-muted-foreground">
        {error ?? 'Something went wrong during authentication. Please try again.'}
      </p>
      <Link
        href="/auth/login"
        className="inline-block rounded-md px-4 py-2 text-sm font-medium text-primary-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
        style={{ backgroundColor: 'oklch(0.46 0.18 264)' }}
      >
        Back to Sign In
      </Link>
    </div>
  );
}
