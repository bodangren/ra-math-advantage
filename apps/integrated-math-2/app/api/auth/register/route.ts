import { NextResponse } from "next/server";
import { hashPassword, generatePasswordSalt, PASSWORD_HASH_ITERATIONS } from "@math-platform/core-auth";
import { fetchInternalMutation, internal } from "@/lib/convex/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || typeof username !== "string" || username.trim().length === 0) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const salt = generatePasswordSalt();
    const passwordHash = await hashPassword(password, salt, PASSWORD_HASH_ITERATIONS);

    const ensureResult = await fetchInternalMutation(internal.auth.ensureProfileByUsername, {
      username: username.trim(),
      role: "student",
      displayName: username.trim(),
    });

    if (!ensureResult || !ensureResult.ok) {
      return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
    }

    await fetchInternalMutation(internal.auth.upsertCredentialByUsername, {
      username: username.trim(),
      role: "student",
      passwordHash,
      passwordSalt: salt,
      passwordHashIterations: PASSWORD_HASH_ITERATIONS,
      isActive: true,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
