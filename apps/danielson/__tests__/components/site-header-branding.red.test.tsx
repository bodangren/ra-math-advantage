import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUseAuth = vi.hoisted(() => vi.fn());

vi.mock("@math-platform/app-shell", () => ({
  useAuth: mockUseAuth,
  LogoutButton: () => <button type="button">Logout</button>,
}));

const { SiteHeader } = await import("../../components/site-header");
const { OrganizationBranding } = await import("../../components/organization-branding");

describe("SiteHeader organization brand", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows the current organization logo and name", () => {
    mockUseAuth.mockReturnValue({
      profile: {
        metadata: {
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

    render(
      <OrganizationBranding>
        <SiteHeader isAuthenticated showReports organizationName="Haidian Kaiwen Academy" />
      </OrganizationBranding>,
    );

    expect(screen.getByRole("img", { name: "Haidian Kaiwen Academy logo" })).toHaveAttribute(
      "src",
      "/brands/hdkwa-logo.png",
    );
    expect(screen.getByText("HDKWA")).toBeVisible();
    expect(screen.getByText("Danielson Teacher Growth")).toBeVisible();
    expect(screen.getByRole("link", { name: "Reports" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Learn" })).toHaveAttribute("href", "/learn");
  });

  it("uses the generic application brand when organization branding is absent", () => {
    mockUseAuth.mockReturnValue({ profile: { metadata: null } });

    render(<SiteHeader />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Danielson Teacher Growth" })).toBeVisible();
  });
});

it("keeps navigation available across pages for the current roles", () => {
  mockUseAuth.mockReturnValue({
    profile: { metadata: { danielsonRoles: ["teacher", "coach", "sysadmin"] } },
  });
  render(<SiteHeader isAuthenticated showObservations />);
  for (const name of [
    "Reports",
    "Improvement plans",
    "My report",
    "My observations",
    "Administration",
  ]) {
    expect(screen.getByRole("link", { name })).toBeVisible();
  }
});
