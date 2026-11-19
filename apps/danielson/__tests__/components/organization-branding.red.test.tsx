import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUseAuth = vi.hoisted(() => vi.fn());

vi.mock("@math-platform/app-shell", () => ({ useAuth: mockUseAuth }));

const { OrganizationBranding } = await import("../../components/organization-branding");

const hdkwaBranding = {
  displayName: "HDKWA",
  logoPath: "/brands/hdkwa-logo.png",
  primaryColor: "#003366",
  accentColor: "#C5A059",
};

describe("OrganizationBranding", () => {
  beforeEach(() => vi.clearAllMocks());

  it("applies the authenticated organization colors to the application shell", () => {
    mockUseAuth.mockReturnValue({
      profile: {
        metadata: {
          organizationName: "Haidian Kaiwen Academy",
          organizationBranding: hdkwaBranding,
        },
      },
    });

    render(
      <OrganizationBranding>
        <p>Branded content</p>
      </OrganizationBranding>,
    );

    const shell = screen.getByTestId("organization-branding");
    expect(shell.style.getPropertyValue("--brand-primary")).toBe("#003366");
    expect(shell.style.getPropertyValue("--brand-accent")).toBe("#C5A059");
    expect(shell).toHaveTextContent("Branded content");
  });

  it("uses the supplied public brand before authentication", () => {
    mockUseAuth.mockReturnValue({ profile: null });

    render(
      <OrganizationBranding publicBranding={hdkwaBranding}>
        <p>Public content</p>
      </OrganizationBranding>,
    );

    const shell = screen.getByTestId("organization-branding");
    expect(shell.style.getPropertyValue("--brand-primary")).toBe("#003366");
    expect(shell.style.getPropertyValue("--brand-accent")).toBe("#C5A059");
  });
});
