import { NextResponse } from "next/server";
import {
  hashPassword,
  generatePasswordSalt,
  PASSWORD_HASH_ITERATIONS,
} from "@math-platform/core-auth";
import { fetchInternalMutation, internal } from "@/lib/convex/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const username = typeof body?.username === "string" ? body.username.trim() : "";
    const password = body?.password;

    if (
      !username ||
      typeof username !== "string" ||
      username.trim().length === 0 ||
      username.length > 255
    ) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    if (!password || typeof password !== "string" || password.length < 6 || password.length > 255) {
      return NextResponse.json(
        { error: "Password must contain 6 to 255 characters" },
        { status: 400 },
      );
    }

    const limit = await fetchInternalMutation(internal.auth.checkAuthAttempt, {
      username,
      operation: "register",
    });
    if (!limit.allowed)
      return NextResponse.json(
        { error: "Too many attempts. Try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(limit.retryAfter) },
        },
      );
    const salt = generatePasswordSalt();
    const passwordHash = await hashPassword(password, salt, PASSWORD_HASH_ITERATIONS);

    const result = await fetchInternalMutation(internal.auth.registerStudent, {
      username,
      passwordHash,
      passwordSalt: salt,
      passwordHashIterations: PASSWORD_HASH_ITERATIONS,
    });
    if (!result.ok) return NextResponse.json({ error: "Username is unavailable" }, { status: 409 });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
