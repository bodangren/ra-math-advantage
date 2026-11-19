import { NextResponse } from "next/server";
import {
  signSessionToken,
  verifyPassword,
  SESSION_COOKIE_NAME,
  getAuthJwtSecret,
  type SessionTokenInput,
} from "@math-platform/core-auth";
import { fetchInternalQuery, fetchInternalMutation, internal } from "@/lib/convex/server";

import { readCredentials } from "@/lib/auth/input";

export async function POST(request: Request) {
  const input = await readCredentials(request);
  if (!input)
    return NextResponse.json({ error: "Enter a username and password." }, { status: 400 });
  const { username, password } = input;
  try {
    const attempt = await fetchInternalMutation(internal.auth.consumeAuthAttempt, {
      username,
      operation: "login",
    });
    if (!attempt.allowed)
      return NextResponse.json(
        { error: "Too many attempts. Wait one minute." },
        { status: 429, headers: { "Retry-After": "60" } },
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

    const response = NextResponse.json({
      success: true,
      redirectTo: credential.role === "student" ? "/student/dashboard" : "/teacher/dashboard",
    });
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 12,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Login is unavailable. Try again later." }, { status: 503 });
  }
}
