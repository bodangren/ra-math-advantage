import Link from 'next/link';
import { requireServerSessionClaims } from '@/lib/auth/server';
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';

export default async function SettingsPage() {
  const claims = await requireServerSessionClaims('/auth/login');

  const dashboardHref =
    claims.role === 'student' ? '/student/dashboard' : '/teacher/dashboard';

  return (
    <div className="max-w-2xl mx-auto space-y-10 py-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Signed in as <span className="font-mono-num">{claims.username}</span>
        </p>
      </div>

      {/* Change password */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold text-foreground">Change Password</h2>
        <div className="card-workbook p-6">
          <ChangePasswordForm />
        </div>
      </section>

      <div className="pt-4 border-t border-border">
        <Link href={dashboardHref} className="text-sm text-primary hover:underline">
          ← Back to dashboard
        </Link>
      </div>
    </div>
  );
}
