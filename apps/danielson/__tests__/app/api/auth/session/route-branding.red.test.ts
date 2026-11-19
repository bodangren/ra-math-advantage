import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockCookies, mockFetchInternalQuery, mockVerifySessionToken } = vi.hoisted(() => ({
  mockCookies: vi.fn(),
  mockFetchInternalQuery: vi.fn(),
  mockVerifySessionToken: vi.fn(),
}));

vi.mock("next/headers", () => ({ cookies: mockCookies }));
vi.mock("@/lib/auth/session", () => ({
  getAuthJwtSecret: () => "test-secret",
  SESSION_COOKIE_NAME: "bm_session",
  verifySessionToken: mockVerifySessionToken,
}));
vi.mock("@/lib/auth/login-policy", () => ({
  clearDanielsonSessionCookieOptions: () => ({ path: "/" }),
}));
vi.mock("@/lib/convex/server", () => ({
  fetchInternalQuery: mockFetchInternalQuery,
  internal: {
    auth: { getAccountById: "getAccountById" },
    foundation: { resolveAccessContext: "resolveAccessContext" },
  },
}));

const { GET } = await import("../../../../../app/api/auth/session/route");

describe("GET /api/auth/session organization branding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookies.mockResolvedValue({
      get: () => ({ value: "signed-session-token" }),
      set: vi.fn(),
    });
    mockVerifySessionToken.mockResolvedValue({ sub: "accounts:slt" });
  });

  it("returns the current organization name and brand in profile metadata", async () => {
    mockFetchInternalQuery
      .mockResolvedValueOnce({
        accountId: "accounts:slt",
        username: "demo.slt",
        displayName: "Avery Morgan",
        sharedSessionRole: "admin",
        organizationId: "organizations:hdkwa",
        organizationName: "Haidian Kaiwen Academy",
        organizationBranding: {
          displayName: "HDKWA",
          logoPath: "/brands/hdkwa-logo.png",
          primaryColor: "#003366",
          accentColor: "#C5A059",
        },
        accountIsActive: true,
        organizationIsActive: true,
        credentialIsActive: true,
        mustChangePassword: false,
      })
      .mockResolvedValueOnce({ roleAssignments: [{ role: "slt" }, { role: "teacher" }] });

    const response = await GET();

    await expect(response.json()).resolves.toMatchObject({
      authenticated: true,
      profile: {
        organization_id: "organizations:hdkwa",
        metadata: {
          danielsonRoles: ["slt", "teacher"],
          organizationName: "Haidian Kaiwen Academy",
          organizationBranding: {
            displayName: "HDKWA",
            logoPath: "/brands/hdkwa-logo.png",
            primaryColor: "#003366",
            accentColor: "#C5A059",
          },
        },
      },
    });
  });
});
