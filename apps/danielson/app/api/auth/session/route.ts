import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAuthJwtSecret, SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";
import type { SessionClaims } from "@/lib/auth/session";
import { clearDanielsonSessionCookieOptions } from "@/lib/auth/login-policy";
import { fetchInternalQuery, internal } from "@/lib/convex/server";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ authenticated: false });

  try {
    const claims = await verifySessionToken(token, getAuthJwtSecret());
    if (!claims) {
      cookieStore.set(SESSION_COOKIE_NAME, "", clearDanielsonSessionCookieOptions());
      return NextResponse.json({ authenticated: false });
    }
    const account = await fetchInternalQuery(internal.auth.getAccountById, {
      accountId: claims.sub,
    });
    if (
      !account?.accountIsActive ||
      !account.organizationIsActive ||
      !account.credentialIsActive ||
      account.credentialUpdatedAt !== (claims as SessionClaims).credentialUpdatedAt
    ) {
      cookieStore.set(SESSION_COOKIE_NAME, "", clearDanielsonSessionCookieOptions());
      return NextResponse.json({ authenticated: false });
    }
    const context = await fetchInternalQuery(internal.foundation.resolveAccessContext, {
      actorAccountId: claims.sub,
    });
    return NextResponse.json({
      authenticated: true,
      user: { id: account.accountId, username: account.username, role: account.sharedSessionRole },
      profile: {
        id: account.accountId,
        organization_id: account.organizationId,
        username: account.username,
        role: account.sharedSessionRole,
        display_name: account.displayName,
        avatar_url: null,
        metadata: {
          danielsonRoles: context.roleAssignments.map(
            (assignment: { role: string }) => assignment.role,
          ),
          organizationName: account.organizationName,
          organizationBranding: account.organizationBranding,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      mustChangePassword: account.mustChangePassword,
    });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
