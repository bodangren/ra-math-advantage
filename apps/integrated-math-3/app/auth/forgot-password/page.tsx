import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-display font-semibold text-foreground">Forgot Password?</h1>
        <p className="text-sm text-muted-foreground">
          Please contact your teacher or administrator to reset your password.
        </p>
      </div>

      <div className="rounded-md border border-border bg-card px-4 py-3 text-sm text-card-foreground">
        <p>
          This platform does not use email-based password recovery. Ask your teacher
          or school administrator to reset your password for you.
        </p>
      </div>

      <div className="text-center">
        <Link
          href="/auth/login"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
