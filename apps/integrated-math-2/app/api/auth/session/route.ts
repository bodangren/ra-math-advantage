import { NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
  getAuthJwtSecret,
  getCookieValueFromHeader,
} from "@math-platform/core-auth";
import { fetchInternalQuery, internal } from "@/lib/convex/server";

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie");
    const token = getCookieValueFromHeader(cookieHeader, SESSION_COOKIE_NAME);

    if (!token) {
      return NextResponse.json({ authenticated: false });
    }

    const claims = await verifySessionToken(token, getAuthJwtSecret());
    if (!claims) {
      return NextResponse.json({ authenticated: false });
    }

    const accountContext = await fetchInternalQuery(
      internal.auth.getAccountSettingsContext,
      {
        profileId:
          claims.sub as import("@/convex/_generated/dataModel").Id<"profiles">,
      },
    );

    if (
      !accountContext ||
      accountContext.username !== claims.username ||
      accountContext.role !== claims.role ||
      accountContext.organizationId !== claims.organizationId
    )
      return NextResponse.json({ authenticated: false });

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
            created_at: new Date(accountContext.createdAt).toISOString(),
            updated_at: new Date(accountContext.updatedAt).toISOString(),
          }
        : null,
    });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
