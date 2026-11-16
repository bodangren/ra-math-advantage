import { requireDanielsonSession } from '@/lib/auth/server';
import { SiteHeader } from '@/components/site-header';
import { ChangePasswordForm } from '@/components/change-password-form';

export default async function ChangePasswordPage() {
  await requireDanielsonSession('/auth/change-password');
  return (
    <>
      <SiteHeader isAuthenticated />
      <main id="main-content" className="page-shell">
        <div className="narrow card">
          <p className="eyebrow">Account security</p>
          <h1>Change your password</h1>
          <p className="lede">Set a new password before you continue.</p>
          <ChangePasswordForm />
        </div>
      </main>
    </>
  );
}
