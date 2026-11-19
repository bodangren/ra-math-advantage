import { NextResponse } from "next/server";
import {
  hashPassword,
  generatePasswordSalt,
  PASSWORD_HASH_ITERATIONS,
  validatePasswordForRole,
} from "@math-platform/core-auth";
import { fetchInternalMutation, internal } from "@/lib/convex/server";
import { readCredentials } from "@/lib/auth/input";

export async function POST(request: Request) {
  const input = await readCredentials(request);
  if (!input)
    return NextResponse.json({ error: "Enter a username and password." }, { status: 400 });
  const { username, password, body } = input;
  const passwordError = validatePasswordForRole("student", password);
  if (passwordError) return NextResponse.json({ error: passwordError }, { status: 400 });
  if (typeof body.classCode !== "string" || !body.classCode.trim() || body.classCode.length > 80)
    return NextResponse.json({ error: "Enter the class code from your teacher." }, { status: 400 });
  try {
    const attempt = await fetchInternalMutation(internal.auth.consumeAuthAttempt, {
      username,
      operation: "register",
    });
    if (!attempt.allowed)
      return NextResponse.json(
        { error: "Too many attempts. Wait one minute." },
        { status: 429, headers: { "Retry-After": "60" } },
      );
    const salt = generatePasswordSalt();
    const result = await fetchInternalMutation(internal.auth.registerStudent, {
      username,
      classCode: body.classCode.trim(),
      passwordHash: await hashPassword(password, salt, PASSWORD_HASH_ITERATIONS),
      passwordSalt: salt,
      passwordHashIterations: PASSWORD_HASH_ITERATIONS,
    });
    if (!result.ok)
      return NextResponse.json(
        {
          error:
            result.reason === "username_taken"
              ? "Username is already in use."
              : "Class code is not valid.",
        },
        { status: result.reason === "username_taken" ? 409 : 400 },
      );
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Registration is unavailable. Try again later." },
      { status: 503 },
    );
  }
}
