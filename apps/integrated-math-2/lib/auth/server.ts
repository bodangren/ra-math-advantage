import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

import {
  SESSION_COOKIE_NAME,
  getAuthJwtSecret,
  verifySessionToken,
  getCookieValueFromHeader,
} from "@math-platform/core-auth";
import { fetchInternalQuery, internal } from "@/lib/convex/server";
import type { Id } from "@/convex/_generated/dataModel";
import type { SessionClaims } from "@math-platform/core-auth";

export async function getServerSessionClaims(): Promise<SessionClaims | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  return verifyActiveSession(token);
}

async function verifyActiveSession(
  token: string,
): Promise<SessionClaims | null> {
  const claims = await verifySessionToken(token, getAuthJwtSecret());
  if (!claims) return null;
  const account = await fetchInternalQuery(
    internal.auth.getAccountSettingsContext,
    { profileId: claims.sub as Id<"profiles"> },
  );
  if (
    !account ||
    account.role !== claims.role ||
    account.organizationId !== claims.organizationId ||
    account.username !== claims.username
  )
    return null;
  return claims;
}

export async function getRequestSessionClaims(
  request: Request,
): Promise<SessionClaims | null> {
  const token = getCookieValueFromHeader(
    request.headers.get("cookie"),
    SESSION_COOKIE_NAME,
  );
  if (!token) return null;

  return verifyActiveSession(token);
}

function buildRequestUnauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

function buildRequestForbiddenResponse(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export async function requireRequestSessionClaims(
  request: Request,
  unauthorizedMessage = "Unauthorized",
): Promise<SessionClaims | Response> {
  let claims: SessionClaims | null;
  try {
    claims = await getRequestSessionClaims(request);
  } catch {
    return NextResponse.json(
      { error: "Sign-in is unavailable. Try again later." },
      { status: 503 },
    );
  }
  if (!claims) {
    return buildRequestUnauthorizedResponse(unauthorizedMessage);
  }

  return claims;
}

export async function requireTeacherRequestClaims(
  request: Request,
  unauthorizedMessage = "Unauthorized",
  forbiddenMessage = "Forbidden",
): Promise<SessionClaims | Response> {
  const claimsOrResponse = await requireRequestSessionClaims(
    request,
    unauthorizedMessage,
  );
  if (claimsOrResponse instanceof Response) {
    return claimsOrResponse;
  }

  if (
    claimsOrResponse.role !== "teacher" &&
    claimsOrResponse.role !== "admin"
  ) {
    return buildRequestForbiddenResponse(forbiddenMessage);
  }

  return claimsOrResponse;
}

export async function requireServerSessionClaims(
  loginRedirectPath: string,
): Promise<SessionClaims> {
  const claims = await getServerSessionClaims();
  if (!claims) {
    redirect(`/auth/login?redirect=${loginRedirectPath}`);
  }

  return claims;
}

export async function requireTeacherSessionClaims(
  loginRedirectPath: string,
  unauthorizedRedirectPath = "/student/dashboard",
): Promise<SessionClaims> {
  const claims = await requireServerSessionClaims(loginRedirectPath);

  if (claims.role !== "teacher" && claims.role !== "admin") {
    redirect(unauthorizedRedirectPath);
  }

  return claims;
}

export async function requireStudentSessionClaims(
  loginRedirectPath: string,
): Promise<SessionClaims> {
  const claims = await requireServerSessionClaims(loginRedirectPath);

  if (claims.role === "student") {
    return claims;
  }

  redirect("/teacher/dashboard");
}

export async function requireAdminSessionClaims(
  loginRedirectPath: string,
): Promise<SessionClaims> {
  const claims = await requireServerSessionClaims(loginRedirectPath);
  if (claims.role !== "admin")
    redirect(
      claims.role === "student" ? "/student/dashboard" : "/teacher/dashboard",
    );
  return claims;
}
