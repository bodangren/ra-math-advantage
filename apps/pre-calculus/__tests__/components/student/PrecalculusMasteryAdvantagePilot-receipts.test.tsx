import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
let submit: ((value: unknown) => Promise<void>) | undefined;
vi.mock("@math-platform/activity-components", () => ({
  IntervalClassificationActivity: (props: {
    onSubmit: (value: unknown) => Promise<void>;
  }) => {
    submit = props.onSubmit;
    return (
      <button
        onClick={() =>
          void props.onSubmit({
            contractVersion: "practice.v1",
            activityId:
              "math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs.guided_practice",
            mode: "guided_practice",
            status: "submitted",
            attemptNumber: 1,
            submittedAt: "2026-09-08T00:00:00.000Z",
            answers: {
              increasingIntervals: "[0,3]",
              decreasingIntervals: "[3,7]",
              constantIntervals: "[7,10]",
            },
            parts: [],
          })
        }
      >
        Submit fixture
      </button>
    );
  },
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
import { PrecalculusMasteryAdvantagePilot } from "@/components/student/PrecalculusMasteryAdvantagePilot";
const create = {
  submissionId: "activity_submissions:1",
  score: 3,
  maxScore: 3,
  attemptOrdinal: 1,
  feedback: "Saved.",
};
const evidence = {
  persisted: true,
  masteryApplied: false,
  kstApplied: false,
  delivery: "new",
  decision: {
    idempotency: "new",
    exposureState: "introduced",
    eligible: false,
    reason: "ungraded_evidence",
    masteryBearing: false,
  },
};
const response = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
afterEach(() => {
  vi.unstubAllGlobals();
  submit = undefined;
});

it.each([
  [{ ...create, submissionId: "" }],
  [{ ...create, score: Number.NaN }],
  [{ ...create, score: 4 }],
  [{ ...create, maxScore: 0 }],
  [{ ...create, extra: true }],
])(
  "rejects a malformed successful submission receipt and does not deliver evidence",
  async (malformed) => {
    const fetchMock = vi.fn().mockResolvedValue(response(malformed));
    vi.stubGlobal("fetch", fetchMock);
    render(<PrecalculusMasteryAdvantagePilot />);
    fireEvent.click(screen.getByText("Submit fixture"));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /unable to save/i,
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Start new attempt")).not.toBeInTheDocument();
  },
);

it.each([
  [{}],
  [
    {
      ...evidence,
      decision: { ...evidence.decision, reason: ["ungraded_evidence"] },
    },
  ],
  [
    {
      persisted: true,
      masteryApplied: true,
      kstApplied: false,
      delivery: "new",
      decision: {
        idempotency: "new",
        exposureState: "introduced",
        eligible: true,
        reason: "eligible",
        masteryBearing: true,
      },
    },
  ],
  [{ ...evidence, extra: true }],
  [
    {
      ...evidence,
      decision: { ...evidence.decision, reason: "eligible", eligible: false },
    },
  ],
])(
  "keeps the opaque submission for retry after malformed evidence",
  async (malformed) => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response(create))
      .mockResolvedValueOnce(response(malformed))
      .mockResolvedValueOnce(response(evidence));
    vi.stubGlobal("fetch", fetchMock);
    render(<PrecalculusMasteryAdvantagePilot />);
    fireEvent.click(screen.getByText("Submit fixture"));
    fireEvent.click(
      await screen.findByRole("button", { name: "Retry evidence delivery" }),
    );
    await waitFor(() =>
      expect(screen.getByText("Start new attempt")).toBeInTheDocument(),
    );
    expect(fetchMock.mock.calls.map((call) => call[0])).toEqual([
      "/api/activities/precalculus-pilot/submissions",
      "/api/learning-evidence/precalculus-pilot",
      "/api/learning-evidence/precalculus-pilot",
    ]);
  },
);

it("locks two synchronous selected submissions before React renders", async () => {
  let resolveCreate!: (value: Response) => void;
  const pending = new Promise<Response>((resolve) => {
    resolveCreate = resolve;
  });
  const fetchMock = vi
    .fn()
    .mockReturnValueOnce(pending)
    .mockResolvedValueOnce(response(evidence));
  vi.stubGlobal("fetch", fetchMock);
  render(<PrecalculusMasteryAdvantagePilot />);
  await act(async () => {
    const value = {
      contractVersion: "practice.v1",
      activityId:
        "math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs.guided_practice",
      mode: "guided_practice",
    };
    void submit?.(value);
    void submit?.(value);
  });
  expect(fetchMock).toHaveBeenCalledTimes(1);
  resolveCreate(response(create));
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
});
