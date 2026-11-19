import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ChangePasswordForm } from "../../components/change-password-form";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh: vi.fn() }),
}));

describe("ChangePasswordForm", () => {
  beforeEach(() => {
    push.mockReset();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("shows a useful error and restores the control after a network failure", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("network unavailable"));
    render(<ChangePasswordForm />);
    fireEvent.change(screen.getByLabelText("Current password"), { target: { value: "temporary" } });
    fireEvent.change(screen.getByLabelText("New password"), { target: { value: "new-password" } });
    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: { value: "new-password" },
    });

    fireEvent.submit(screen.getByRole("button", { name: "Save password" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to update password. Try again.",
    );
    expect(screen.getByRole("button", { name: "Save password" })).toBeEnabled();
    expect(push).not.toHaveBeenCalled();
  });
});
