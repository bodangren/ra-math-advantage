import { it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "../../app/auth/login/page";
const mocks = vi.hoisted(() => ({
  signIn: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
}));
vi.mock("../../components/auth/AuthProvider", () => ({
  useAuth: () => ({ signIn: mocks.signIn }),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
}));
beforeEach(() => {
  vi.clearAllMocks();
  window.history.replaceState({}, "", "/auth/login");
});
it("shows an accessible sign-in error", async () => {
  mocks.signIn.mockRejectedValueOnce(Error("Invalid credentials"));
  render(<Login />);
  fireEvent.change(screen.getByLabelText("Username"), {
    target: { value: "learner" },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "wrong" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Sign In" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Invalid credentials",
  );
  expect(mocks.push).not.toHaveBeenCalled();
});
it("routes a teacher to the dashboard and rejects an external redirect", async () => {
  mocks.signIn.mockResolvedValueOnce(undefined);
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue({
        json: async () => ({
          authenticated: true,
          profile: { role: "teacher" },
        }),
      }),
  );
  window.history.replaceState({}, "", "/auth/login?redirect=//example.com");
  render(<Login />);
  fireEvent.change(screen.getByLabelText("Username"), {
    target: { value: "teacher" },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "password" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Sign In" }));
  await waitFor(() =>
    expect(mocks.push).toHaveBeenCalledWith("/teacher/dashboard"),
  );
  vi.unstubAllGlobals();
});
