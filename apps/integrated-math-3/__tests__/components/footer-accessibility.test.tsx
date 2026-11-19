import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Footer } from "@/components/footer";

describe("footer accessibility", () => {
  it("uses a second-level brand heading and named navigation regions", () => {
    render(<Footer />);
    const footer = screen.getByRole("contentinfo");
    expect(
      within(footer).getByRole("heading", { level: 2, name: "Integrated Math 3" }),
    ).toBeInTheDocument();
    expect(within(footer).getByRole("navigation", { name: "Quick Links" })).toBeInTheDocument();
    expect(
      within(footer).getByRole("navigation", { name: "Teacher Resources" }),
    ).toBeInTheDocument();
  });
});
