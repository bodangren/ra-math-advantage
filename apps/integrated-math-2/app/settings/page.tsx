import { requireServerSessionClaims } from "@/lib/auth/server";
import { fetchInternalQuery, internal } from "@/lib/convex/server";
import type { Id } from "@/convex/_generated/dataModel";
import { ThemeSwitcher } from "@/components/theme-switcher";
export default async function Settings() {
  const claims = await requireServerSessionClaims("/settings");
  const account = await fetchInternalQuery(internal.auth.getAccountSettingsContext, {
    profileId: claims.sub as Id<"profiles">,
  });
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-display mb-6">Account settings</h1>
      <p>Username: {account?.username}</p>
      <p>Organization: {account?.organizationName}</p>
      <p>Role: {account?.role}</p>
      <h2 className="text-xl mt-6">Appearance</h2>
      <ThemeSwitcher />
    </div>
  );
}
