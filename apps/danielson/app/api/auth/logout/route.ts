import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { clearDanielsonSessionCookieOptions } from "@/lib/auth/login-policy";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, "", clearDanielsonSessionCookieOptions());
  return response;
}
