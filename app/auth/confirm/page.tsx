import Link from 'next/link';

export default function ConfirmPage() {
  return (
    <div className="space-y-4 text-center">
      <h1 className="text-2xl font-display font-semibold text-foreground">Welcome!</h1>
      <p className="text-sm text-muted-foreground">
        Your account has been confirmed. You can now sign in to access your courses.
      </p>
      <Link
        href="/auth/login"
        className="inline-block rounded-md px-4 py-2 text-sm font-medium text-primary-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
        style={{ backgroundColor: 'oklch(0.46 0.18 264)' }}
      >
        Sign In
      </Link>
    </div>
  );
}
