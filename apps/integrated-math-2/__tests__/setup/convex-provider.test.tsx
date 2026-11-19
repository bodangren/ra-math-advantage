import { render, screen } from "@testing-library/react";
import { it, expect, vi } from "vitest";
const client = vi.hoisted(() => vi.fn());
vi.mock("convex/react", () => ({
  ConvexReactClient: class {
    constructor(url: string) {
      client(url);
    }
  },
  ConvexProvider: ({ children }: { children: React.ReactNode }) => children,
}));
it("renders children with the configured backend connection", async () => {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_CONVEX_URL", "https://im2-test.convex.cloud");
  const { ConvexClientProvider } = await import("../../components/ConvexClientProvider");
  render(
    <ConvexClientProvider>
      <p>Course content</p>
    </ConvexClientProvider>,
  );
  expect(screen.getByText("Course content")).toBeInTheDocument();
  expect(client).toHaveBeenCalledWith("https://im2-test.convex.cloud");
  vi.unstubAllEnvs();
});
