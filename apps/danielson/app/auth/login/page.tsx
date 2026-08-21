import { getSafePostSignInRedirect } from '@/lib/auth/login-policy';
import { LoginForm } from '@/components/login-form';
import { SiteHeader } from '@/components/site-header';
import { DEMO_USERNAMES } from '@/lib/demo/scenarios';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ redirect?: string }> }) {
  const params = await searchParams;
  const redirectTo = getSafePostSignInRedirect(params.redirect);
  const demoPassword = process.env.CONVEX_DEPLOYMENT?.startsWith('local:')
    ? process.env.DANIELSON_DEMO_PASSWORD
    : undefined;
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="page-shell">
        <div className="narrow card">
          <p className="eyebrow">Secure sign-in</p>
          <h1>Sign in</h1>
          <p className="lede">Use your school account to open the Danielson workspace.</p>
          <LoginForm redirectTo={redirectTo} />
          {demoPassword ? (
            <section className="pilot-accounts" aria-labelledby="pilot-accounts-heading">
              <h2 id="pilot-accounts-heading">Danielson School pilot accounts</h2>
              <p>Use any pilot account below. Each account uses the listed password.</p>
              <div className="table-wrap">
                <table>
                  <thead><tr><th scope="col">Username</th><th scope="col">Password</th></tr></thead>
                  <tbody>
                    {DEMO_USERNAMES.map((username) => (
                      <tr key={username}><td><code>{username}</code></td><td><code>{demoPassword}</code></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}
        </div>
      </main>
    </>
  );
}
