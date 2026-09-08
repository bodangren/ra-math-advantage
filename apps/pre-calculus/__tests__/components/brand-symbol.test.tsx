import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@math-platform/app-shell/layout", () => ({
  HeaderSimple: ({ brandIcon }: { brandIcon: string }) => <span data-testid="header-icon">{brandIcon}</span>,
  Footer: ({ brandIcon }: { brandIcon: string }) => <span data-testid="footer-icon">{brandIcon}</span>,
}));
vi.mock("@math-platform/app-shell/components", () => ({ UserMenu: () => null }));

import { Footer } from "@/components/footer";
import { HeaderSimple } from "@/components/header-simple";

describe("Precalculus brand symbol", () => {
  it("renders the integral symbol in the header and footer", () => {
    render(<><HeaderSimple /><Footer /></>);
    expect(screen.getByTestId("header-icon")).toHaveTextContent("∫");
    expect(screen.getByTestId("footer-icon")).toHaveTextContent("∫");
    expect(document.body).not.toHaveTextContent("\\u222B");
  });
});
