import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken, getAuthJwtSecret } from "@math-platform/core-auth";
import { fetchInternalQuery, internal } from "@/lib/convex/server";

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie");
    const token = getCookieValue(cookieHeader, SESSION_COOKIE_NAME);

    if (!token) {
      return NextResponse.json({ authenticated: false });
    }

    const claims = await verifySessionToken(token, getAuthJwtSecret());
    if (!claims) {
      return NextResponse.json({ authenticated: false });
    }

    const accountContext = await fetchInternalQuery(internal.auth.getAccountSettingsContext, {
      profileId: claims.sub,
    });

    return NextResponse.json({
      authenticated: true,
      user: { id: claims.sub },
      profile: accountContext
        ? {
            id: accountContext.id,
            organization_id: accountContext.organizationId,
            username: accountContext.username,
            role: accountContext.role,
            display_name: accountContext.displayName,
            avatar_url: null,
            metadata: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        : null,
    });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}

function getCookieValue(cookieHeader: string | null, key: string): string | null {
  if (!cookieHeader) return null;
  const entries = cookieHeader.split(";");
  for (const entry of entries) {
    const trimmed = entry.trim();
    if (!trimmed) continue;
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex <= 0) continue;
    const name = trimmed.slice(0, separatorIndex).trim();
    if (name !== key) continue;
    return decodeURIComponent(trimmed.slice(separatorIndex + 1));
  }
  return null;
}
