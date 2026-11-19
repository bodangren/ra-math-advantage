import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "../../components/login-form";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh: vi.fn() }),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    push.mockReset();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true, redirect: "/admin/accounts" }),
      }),
    );
  });

  it("uses POST when the browser submits before client code loads", () => {
    render(<LoginForm redirectTo="/" />);

    expect(screen.getByRole("button", { name: "Sign in" }).closest("form")).toHaveAttribute(
      "method",
      "post",
    );
  });

  it("follows the redirect returned by the server", async () => {
    render(<LoginForm redirectTo="/" />);
    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "teacher.one" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "correct-password" } });
    fireEvent.submit(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/admin/accounts"));
  });

  it("shows a useful error when the authentication service is unavailable", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("network unavailable"));
    render(<LoginForm redirectTo="/" />);
    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "teacher.one" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password" } });

    fireEvent.submit(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Unable to sign in. Try again.");
    expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled();
  });
});
