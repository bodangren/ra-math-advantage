import { NextResponse } from "next/server";
import {
  signSessionToken,
  verifyPassword,
  SESSION_COOKIE_NAME,
  getAuthJwtSecret,
  type SessionTokenInput,
} from "@math-platform/core-auth";
import { fetchInternalMutation, fetchInternalQuery, internal } from "@/lib/convex/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const username = typeof body?.username === "string" ? body.username.trim() : "";
    const password = body?.password;

    if (
      !username ||
      username.length > 255 ||
      typeof password !== "string" ||
      !password ||
      password.length > 255
    ) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    const limit = await fetchInternalMutation(internal.auth.checkAuthAttempt, {
      username,
      operation: "login",
    });
    if (!limit.allowed)
      return NextResponse.json(
        { error: "Too many attempts. Try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(limit.retryAfter) },
        },
      );
    const credential = await fetchInternalQuery(internal.auth.getCredentialByUsername, {
      username,
    });

    if (!credential) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await verifyPassword(password, {
      salt: credential.passwordSalt,
      iterations: credential.passwordHashIterations,
      passwordHash: credential.passwordHash,
    });
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const input: SessionTokenInput = {
      sub: credential.profileId,
      username: credential.username,
      role: credential.role,
      organizationId: credential.organizationId,
    };

    const token = await signSessionToken(input, getAuthJwtSecret());

    const response = NextResponse.json({ success: true, role: credential.role });
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 12,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
