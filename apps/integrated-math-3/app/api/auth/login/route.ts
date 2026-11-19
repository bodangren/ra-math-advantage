import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  PASSWORD_HASH_ITERATIONS,
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  getAuthJwtSecret,
  signSessionToken,
  verifyPassword,
} from "@math-platform/core-auth";
import { z } from "zod";
import { fetchInternalMutation, fetchInternalQuery, internal } from "@/lib/convex/server";

const loginSchema = z.object({
  username: z.string().trim().min(1).max(255),
  password: z.string().min(1).max(255),
});

/**
 * Handles POST requests to authenticate a user. Validates credentials
 * against the Convex user store, verifies the password hash, and sets
 * a signed JWT session cookie on success.
 *
 * @param {Request} request - The incoming request with a JSON body containing
 *   username and password.
 * @returns {JSX.Element} A JSON response with user info or an authentication error.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const { username, password } = parsed.data;

  try {
    const limit = await fetchInternalMutation(internal.rateLimits.checkLoginAttempt, { username });
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.max(1, Math.ceil((limit.windowExpiresAt - Date.now()) / 1000)),
            ),
          },
        },
      );
    }
    const credential = await fetchInternalQuery(
      internal.auth.getCredentialByUsernameIncludingInactive,
      { username },
    );
    if (!credential) {
      return NextResponse.json({ error: "Invalid login credentials" }, { status: 401 });
    }

    if (!credential.isActive) {
      return NextResponse.json({ error: "Invalid login credentials" }, { status: 401 });
    }

    const isValidPassword = await verifyPassword(password, {
      salt: credential.passwordSalt,
      iterations: credential.passwordHashIterations ?? PASSWORD_HASH_ITERATIONS,
      passwordHash: credential.passwordHash,
    });

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid login credentials" }, { status: 401 });
    }

    const token = await signSessionToken(
      {
        sub: credential.profileId,
        username: credential.username,
        role: credential.role,
        organizationId: credential.organizationId,
      },
      getAuthJwtSecret(),
      SESSION_TTL_SECONDS,
    );

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Login route failed", error);
    return NextResponse.json({ error: "Authentication service unavailable" }, { status: 500 });
  }
}
