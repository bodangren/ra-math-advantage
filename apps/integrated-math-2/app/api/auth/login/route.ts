import { NextResponse } from "next/server";
import {
  signSessionToken,
  verifyPassword,
  SESSION_COOKIE_NAME,
  getAuthJwtSecret,
  type SessionTokenInput,
} from "@math-platform/core-auth";
import { fetchInternalQuery, internal } from "@/lib/convex/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    const credential = await fetchInternalQuery(internal.auth.getCredentialByUsername, {
      username,
    });

    if (!credential) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await verifyPassword(password, credential.passwordHash);
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

    const response = NextResponse.json({ success: true });
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
