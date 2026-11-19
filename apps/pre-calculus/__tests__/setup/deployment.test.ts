import { expect, it } from "vitest";
import { getServerConvexUrl } from "@/lib/convex/deployment";
it("allows the local backend only in development", () => {
  expect(getServerConvexUrl({ NODE_ENV: "development" })).toBe("http://127.0.0.1:3210");
  expect(() => getServerConvexUrl({ NODE_ENV: "production" })).toThrow("hosted HTTPS");
  expect(() =>
    getServerConvexUrl({ NODE_ENV: "production", NEXT_PUBLIC_CONVEX_URL: "http://127.0.0.1:3210" }),
  ).toThrow("hosted HTTPS");
});
it("uses the configured hosted endpoint in production", () => {
  expect(
    getServerConvexUrl({
      NODE_ENV: "production",
      NEXT_PUBLIC_CONVEX_URL: "https://example.convex.cloud/",
    }),
  ).toBe("https://example.convex.cloud");
});
