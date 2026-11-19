import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PrecalculusPhysicalContextPracticePilot } from "@/components/student/PrecalculusPhysicalContextPracticePilot";
import {
  PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID,
  PRECALCULUS_PHYSICAL_CONTEXT_INDEPENDENT_ACTIVITY_ID,
} from "@/lib/learning-evidence/precalc-pilot";
import { generateTopic11PhysicalContextGraphChoice } from "@math-platform/math-content/knowledge-space";

const guidedVariant = generateTopic11PhysicalContextGraphChoice(1);
const independentVariant = generateTopic11PhysicalContextGraphChoice(2);

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function clickCorrectOption(variant: typeof guidedVariant) {
  const radio = screen
    .getAllByRole("radio")
    .find((candidate) => (candidate as HTMLInputElement).value === variant.correctOptionId);
  if (!radio) throw new Error(`Missing correct option ${variant.correctOptionId}`);
  fireEvent.click(radio);
}

function requestBody(call: unknown[]): Record<string, unknown> {
  return JSON.parse((call[1] as RequestInit).body as string) as Record<string, unknown>;
}

describe("PrecalculusPhysicalContextPracticePilot", () => {
  it.each([
    ["guided_practice", guidedVariant, PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID],
    [
      "independent_practice",
      independentVariant,
      PRECALCULUS_PHYSICAL_CONTEXT_INDEPENDENT_ACTIVITY_ID,
    ],
  ] as const)(
    "renders the generated %s physical practice surface without answer leakage",
    (mode, variant, activityId) => {
      const { container } = render(<PrecalculusPhysicalContextPracticePilot mode={mode} />);

      expect(
        screen.getByRole("heading", {
          name: new RegExp(mode === "guided_practice" ? "Guided Practice" : "Independent Practice"),
        }),
      ).toBeTruthy();
      expect(screen.getByText(variant.prompt)).toBeTruthy();
      expect(screen.getByText(variant.contextDescription)).toBeTruthy();
      expect(screen.getAllByRole("img")).toHaveLength(5);
      expect(screen.getAllByRole("radio")).toHaveLength(4);
      expect(screen.getAllByRole("radio")[0]).toHaveAttribute("name", `${activityId}-graph-choice`);
      expect(container.textContent).not.toContain("correctOptionId");
      expect(container.textContent).not.toContain("finalAnswer");
      expect(container.textContent).not.toContain("reasoning");

      if (mode === "guided_practice") {
        expect(screen.getByText("Identify the independent and dependent variables.")).toBeTruthy();
        expect(
          screen.getByText(
            "Use the vessel width and the water-flow rate to compare the graph shapes.",
          ),
        ).toBeTruthy();
      } else {
        expect(screen.queryByText("Identify the independent and dependent variables.")).toBeNull();
        expect(
          screen.queryByText(
            "Use the vessel width and the water-flow rate to compare the graph shapes.",
          ),
        ).toBeNull();
      }
    },
  );

  it("shows the optional physical knowledge state", () => {
    render(
      <PrecalculusPhysicalContextPracticePilot
        knowledgeState={{
          nodeId: "math.precalc.skill.1.1.select-a-graph-that-models-a-physical-context",
          title: "Select a graph that models a physical context",
          status: "in_progress",
          readiness: "ready",
        }}
      />,
    );

    expect(screen.getByText("Select a graph that models a physical context")).toBeTruthy();
    expect(screen.getByText("Mastery state: in progress")).toBeTruthy();
    expect(screen.getByText("Readiness: Ready")).toBeTruthy();
  });

  it.each([
    ["guided_practice", guidedVariant, PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID],
    [
      "independent_practice",
      independentVariant,
      PRECALCULUS_PHYSICAL_CONTEXT_INDEPENDENT_ACTIVITY_ID,
    ],
  ] as const)(
    "submits the exact grade-free %s envelope, then delivers evidence",
    async (mode, variant, activityId) => {
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(
          response({
            submissionId: `${mode}-submission`,
            score: 1,
            maxScore: 1,
            attemptOrdinal: 1,
            feedback: "1/1 graph selections matched the server rubric.",
          }),
        )
        .mockResolvedValueOnce(
          response({
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
          }),
        );
      vi.stubGlobal("fetch", fetchMock);
      render(<PrecalculusPhysicalContextPracticePilot mode={mode} />);

      clickCorrectOption(variant);
      fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));

      await waitFor(() => expect(screen.getByText("Server score: 1/1")).toBeTruthy());
      expect(screen.getByRole("status")).toHaveTextContent(
        "1/1 graph selections matched the server rubric.",
      );
      expect(fetchMock).toHaveBeenCalledTimes(2);

      const createCall = fetchMock.mock.calls[0] as unknown[];
      expect(createCall[0]).toBe("/api/activities/precalculus-physical-context/submissions");
      const body = requestBody(createCall);
      expect(body).toMatchObject({
        contractVersion: "practice.v1",
        activityId,
        mode,
        status: "submitted",
        attemptNumber: 1,
        answers: { selectedOptionId: variant.correctOptionId },
        parts: [{ partId: "selectedOptionId", rawAnswer: variant.correctOptionId }],
      });
      expect(typeof body.submittedAt).toBe("string");
      expect(Object.keys((body.parts as Array<Record<string, unknown>>)[0]!)).toEqual([
        "partId",
        "rawAnswer",
      ]);
      expect(body).not.toHaveProperty("score");
      expect(body).not.toHaveProperty("isCorrect");
      expect(body).not.toHaveProperty("maxScore");

      const evidenceCall = fetchMock.mock.calls[1] as unknown[];
      expect(evidenceCall[0]).toBe("/api/learning-evidence/precalculus-pilot");
      expect(requestBody(evidenceCall)).toEqual({ submissionId: `${mode}-submission` });
    },
  );

  it("reuses the create key after a create failure and uses an evidence-only retry after creation", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response({ error: "create failed" }, 500))
      .mockResolvedValueOnce(
        response({
          submissionId: "physical-guided-submission",
          score: 1,
          maxScore: 1,
          attemptOrdinal: 1,
          feedback: "1/1 graph selections matched the server rubric.",
        }),
      )
      .mockResolvedValueOnce(response({ error: "evidence failed" }, 500))
      .mockResolvedValueOnce(
        response({
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
        }),
      );
    vi.stubGlobal("fetch", fetchMock);
    render(<PrecalculusPhysicalContextPracticePilot />);

    clickCorrectOption(guidedVariant);
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));
    await screen.findByRole("alert");
    expect(screen.getByRole("button", { name: "Retry submission" })).toBeEnabled();

    const firstCreate = fetchMock.mock.calls[0] as unknown[];
    fireEvent.click(screen.getByRole("button", { name: "Retry submission" }));
    await screen.findByRole("alert");
    expect(fetchMock).toHaveBeenCalledTimes(3);
    const secondCreate = fetchMock.mock.calls[1] as unknown[];
    expect(firstCreate[0]).toBe(secondCreate[0]);
    expect(requestBody(firstCreate)).toEqual(requestBody(secondCreate));
    const firstKey = new Headers((firstCreate[1] as RequestInit).headers).get("Idempotency-Key");
    const secondKey = new Headers((secondCreate[1] as RequestInit).headers).get("Idempotency-Key");
    expect(secondKey).toBe(firstKey);
    expect(screen.getByRole("button", { name: "Retry evidence delivery" })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "Retry evidence delivery" }));
    await waitFor(() => expect(screen.getByText("Server score: 1/1")).toBeTruthy());
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(fetchMock.mock.calls[3]?.[0]).toBe("/api/learning-evidence/precalculus-pilot");
    expect(screen.getByRole("status")).toHaveTextContent(
      "1/1 graph selections matched the server rubric.",
    );
  });

  it("does not deliver evidence after a malformed successful create response", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      response({
        submissionId: "physical-guided-submission",
        score: 1,
        maxScore: 1,
        attemptOrdinal: 0,
        feedback: "1/1 graph selections matched the server rubric.",
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    render(<PrecalculusPhysicalContextPracticePilot />);

    clickCorrectOption(guidedVariant);
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to save the physical-context practice.",
    );
    expect(screen.getByRole("button", { name: "Retry submission" })).toBeEnabled();
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
