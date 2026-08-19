import { getSafePostSignInRedirect } from '@/lib/auth/login-policy';
import { LoginForm } from '@/components/login-form';
import { SiteHeader } from '@/components/site-header';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ redirect?: string }> }) {
  const params = await searchParams;
  const redirectTo = getSafePostSignInRedirect(params.redirect);
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="page-shell">
        <div className="narrow card">
          <p className="eyebrow">Secure sign-in</p>
          <h1>Sign in</h1>
          <p className="lede">Use your school account to open the Danielson workspace.</p>
          <LoginForm redirectTo={redirectTo} />
        </div>
      </main>
    </>
  );
}
