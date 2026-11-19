import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: mocks.refresh }) }));
vi.mock("@math-platform/activity-components", () => ({
  PolynomialEquationEndBehaviorActivity: ({ onSubmit }: any) => (
    <button onClick={() => onSubmit({ parts: [] })}>Submit fixture</button>
  ),
}));
import { PrecalculusTopic16EquationEndBehaviorPracticePilot } from "@/components/student/PrecalculusTopic16EquationEndBehaviorPracticePilot";
it("creates a fresh submission after an explicit new attempt and refreshes progress", async () => {
  const requests: RequestInit[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init: RequestInit) => {
      requests.push(init);
      const create = url.includes("/submissions");
      return new Response(
        JSON.stringify(
          create
            ? {
                submissionId: "submission-" + requests.length,
                score: 0,
                maxScore: 12,
                attemptOrdinal: requests.length,
                feedback: "Review your answers.",
              }
            : {
                persisted: true,
                masteryApplied: true,
                kstApplied: true,
                delivery: "new",
                decision: {
                  idempotency: "new",
                  exposureState: "introduced",
                  eligible: true,
                  reason: "eligible",
                  masteryBearing: true,
                },
              },
        ),
        { status: 200 },
      );
    }),
  );
  render(<PrecalculusTopic16EquationEndBehaviorPracticePilot />);
  fireEvent.click(screen.getByText("Submit fixture"));
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Start new attempt" })).toBeInTheDocument(),
  );
  fireEvent.click(screen.getByRole("button", { name: "Start new attempt" }));
  fireEvent.click(screen.getByText("Submit fixture"));
  await waitFor(() => expect(requests).toHaveLength(4));
  expect(new Headers(requests[0].headers).get("Idempotency-Key")).not.toBe(
    new Headers(requests[2].headers).get("Idempotency-Key"),
  );
  expect(mocks.refresh).toHaveBeenCalledTimes(2);
  vi.unstubAllGlobals();
});
