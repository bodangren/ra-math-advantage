import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { AuthProvider } from "@/components/auth/AuthProvider";

describe("AuthProvider", () => {
  it("renders children without crashing", () => {
    const { container } = render(
      <AuthProvider>
        <div data-testid="child">Test</div>
      </AuthProvider>,
    );
    expect(container.querySelector('[data-testid="child"]')).toBeTruthy();
  });
});
