import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { CoachingForm } from "../../components/coaching-form";
const evidence = [
  {
    observationId: "obs",
    observedAt: "2026-08-01",
    items: [
      {
        skillId: "skill",
        componentId: "component",
        evidenceNote: "Evidence",
        outcome: { kind: "rated" as const, rating: 2 },
      },
    ],
  },
];
afterEach(() => vi.unstubAllGlobals());
it("submits a named target and linked evidence then shows saved status", async () => {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ kind: "saved" }) });
  vi.stubGlobal("fetch", fetchMock);
  render(
    <CoachingForm
      teacherProfileId="teacher"
      evidence={evidence}
      skills={[{ id: "skill", title: "Target skill name" }]}
    />,
  );
  fireEvent.change(screen.getByLabelText("Agreed teaching action"), {
    target: { value: "Check all responses." },
  });
  fireEvent.change(screen.getByLabelText("School support and rehearsal"), {
    target: { value: "Rehearse with coach." },
  });
  fireEvent.change(screen.getByLabelText("Follow-up date"), { target: { value: "2026-09-10" } });
  fireEvent.change(screen.getByLabelText("Baseline observation"), { target: { value: "obs" } });
  fireEvent.submit(screen.getByRole("button", { name: "Save coaching cycle" }));
  expect(await screen.findByRole("status")).toHaveTextContent("Coaching change saved");
  expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
    kind: "create",
    skillId: "skill",
    baselineObservationId: "obs",
    action: "Check all responses.",
  });
});
it("preserves input when the server rejects a change", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: "Reload the cycle." }) }),
  );
  render(
    <CoachingForm
      teacherProfileId="teacher"
      evidence={evidence}
      skills={[{ id: "skill", title: "Target skill name" }]}
    />,
  );
  fireEvent.change(screen.getByLabelText("Agreed teaching action"), {
    target: { value: "Keep this action." },
  });
  fireEvent.submit(screen.getByRole("button", { name: "Save coaching cycle" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Reload the cycle.");
  expect(screen.getByLabelText("Agreed teaching action")).toHaveValue("Keep this action.");
});
