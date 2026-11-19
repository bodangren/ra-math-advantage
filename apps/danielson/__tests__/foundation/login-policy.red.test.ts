import { describe, expect, it } from "vitest";

import {
  buildDanielsonSessionCookieOptions,
  getSafePostSignInRedirect,
} from "../../lib/auth/login-policy";

describe("Danielson sign-in policy", () => {
  it("allows only app-relative post-sign-in redirects", () => {
    expect(getSafePostSignInRedirect("/admin/accounts")).toBe("/admin/accounts");
    expect(getSafePostSignInRedirect("/")).toBe("/");
    expect(getSafePostSignInRedirect(null)).toBe("/");
    expect(getSafePostSignInRedirect("")).toBe("/");
    expect(getSafePostSignInRedirect("https://attacker.example")).toBe("/");
    expect(getSafePostSignInRedirect("//attacker.example")).toBe("/");
    expect(getSafePostSignInRedirect("\\\\attacker.example")).toBe("/");
    expect(getSafePostSignInRedirect("admin/accounts")).toBe("/");
  });

  it("sets a protected session cookie in production", () => {
    expect(buildDanielsonSessionCookieOptions({ NODE_ENV: "production" })).toMatchObject({
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });
  });

  it("keeps a local-development session usable without weakening other flags", () => {
    expect(buildDanielsonSessionCookieOptions({ NODE_ENV: "development" })).toMatchObject({
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });
  });
});
