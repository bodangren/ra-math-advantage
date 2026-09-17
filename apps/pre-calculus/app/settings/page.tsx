import { requireServerSessionClaims } from '@/lib/auth/server';
import { fetchInternalQuery, internal } from '@/lib/convex/server';
export default async function SettingsPage() {
  const claims = await requireServerSessionClaims('/settings');
  const account = await fetchInternalQuery(internal.auth.getAccountSettingsContext, { profileId: claims.sub });
  return <main className="max-w-2xl mx-auto p-6"><h1>Account settings</h1><dl><dt>Username</dt><dd>{account.username}</dd><dt>Role</dt><dd>{account.role}</dd><dt>Organization</dt><dd>{account.organizationName}</dd></dl><p>Contact your teacher to change your account details.</p></main>;
}
