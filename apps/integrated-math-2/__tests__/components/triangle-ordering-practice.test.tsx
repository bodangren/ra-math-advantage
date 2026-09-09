import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { TriangleOrderingPractice } from "@/components/student/TriangleOrderingPractice";
const item = {
  activityId: "a",
  mode: "guided_practice",
  problem: 8,
  figure: "/x.png",
  alt: "Triangle ABC",
  prompt: "Order",
  currentPart: {
    id: "measure_order",
    prompt: "Measure",
    kind: "choice" as const,
    choices: [
      { id: "choice-1", text: "right" },
      { id: "choice-2", text: "wrong" },
    ],
  },
  acceptedAnswers: {},
  hintsUsed: 0,
  revealStepsSeen: 0,
};
const graded = {
  kind: "graded",
  submissionId: "submission-1",
  score: 1,
  maxScore: 1,
  complete: false,
  finalPart: false,
  acceptedAnswers: { measure_order: "choice-1" },
  hintsUsed: 0,
  revealStepsSeen: 0,
  feedback: "Correct.",
  evidencePersisted: false,
  nextPart: {
    id: "opposite_correspondence",
    prompt: "Match opposites",
    kind: "choice",
    choices: [
      { id: "choice-1", text: "right" },
      { id: "choice-2", text: "wrong" },
    ],
  },
};
describe("TriangleOrderingPractice", () => {
  it("freezes a failed body and key until the exact retry succeeds", async () => {
    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(new Response("", { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(graded)));
    render(<TriangleOrderingPractice items={[item]} />);
    fireEvent.change(screen.getByLabelText("Measure"), {
      target: { value: "choice-1" },
    });
    fireEvent.click(screen.getByText("Check answer"));
    await screen.findByText(
      "Your response was not saved. Submit the same response again.",
    );
    const first = fetchMock.mock.calls[0][1]!;
    expect(screen.getByLabelText("Measure")).toBeDisabled();
    fireEvent.click(screen.getByText("Check answer"));
    await screen.findByLabelText("Match opposites");
    const second = fetchMock.mock.calls[1][1]!;
    expect(second.body).toBe(first.body);
    expect((second.headers as Record<string, string>)["Idempotency-Key"]).toBe(
      (first.headers as Record<string, string>)["Idempotency-Key"],
    );
    fetchMock.mockRestore();
  });
  it("blocks a duplicate click and keeps retry identity for an invalid receipt", async () => {
    let resolve!: (value: Response) => void;
    const deferred = new Promise<Response>((done) => {
      resolve = done;
    });
    const fetchMock = vi.spyOn(global, "fetch").mockReturnValue(deferred);
    render(<TriangleOrderingPractice items={[item]} />);
    fireEvent.change(screen.getByLabelText("Measure"), {
      target: { value: "choice-1" },
    });
    const button = screen.getByText("Check answer");
    fireEvent.click(button);
    fireEvent.click(button);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    resolve(new Response(JSON.stringify({ kind: "graded", complete: true })));
    await screen.findByText("The saved response is invalid. Submit it again.");
    expect(screen.getByLabelText("Measure")).toBeDisabled();
    fetchMock.mockRestore();
  });
  it("requires a valid Worked acknowledgement before advancing", async () => {
    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ kind: "acknowledged" })),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            kind: "acknowledged",
            submissionId: "s1",
            evidencePersisted: false,
          }),
        ),
      );
    render(
      <TriangleOrderingPractice
        items={[
          {
            ...item,
            mode: "worked_example",
            authoredLabel: "Authored solution",
            answer: "answer",
            solutionSteps: ["step"],
            currentPart: undefined,
          },
        ]}
      />,
    );
    fireEvent.click(screen.getByText("Continue"));
    await screen.findByText("The saved response is invalid. Submit it again.");
    fireEvent.click(screen.getByText("Continue"));
    await screen.findByText("Practice complete.");
    fetchMock.mockRestore();
  });
  it.each([
    [
      "missing complete fields",
      {
        kind: "graded",
        submissionId: "s",
        complete: true,
        finalPart: true,
        acceptedAnswers: {},
        hintsUsed: 0,
        revealStepsSeen: 0,
        feedback: "Correct.",
        evidencePersisted: false,
      },
    ],
    ["negative counters", { ...graded, hintsUsed: -1 }],
    ["inflated hint counter", { ...graded, hintsUsed: 99 }],
    ["inflated reveal counter", { ...graded, revealStepsSeen: 99 }],
    ["malformed answers", { ...graded, acceptedAnswers: { measure_order: 3 } }],
    [
      "arbitrary next part",
      { ...graded, nextPart: { ...graded.nextPart, id: "future_part" } },
    ],
    ["private extra field", { ...graded, answerKey: "choice-1" }],
  ])("keeps the retry for a %s receipt", async (_name, receipt) => {
    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValue(new Response(JSON.stringify(receipt)));
    render(<TriangleOrderingPractice items={[item]} />);
    fireEvent.change(screen.getByLabelText("Measure"), {
      target: { value: "choice-1" },
    });
    fireEvent.click(screen.getByText("Check answer"));
    await screen.findByText("The saved response is invalid. Submit it again.");
    expect(screen.getByLabelText("Measure")).toBeDisabled();
    fireEvent.click(screen.getByText("Check answer"));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock.mock.calls[1][1]).toEqual(fetchMock.mock.calls[0][1]);
    fetchMock.mockRestore();
  });
  it("advances only for a coherent complete receipt", async () => {
    const completeItem = {
      ...item,
      mode: "independent_practice",
      currentPart: { ...item.currentPart, id: "final_order", prompt: "Final" },
    };
    const receipt = {
      kind: "graded",
      submissionId: "s",
      score: 1,
      maxScore: 1,
      feedback: "Correct.",
      finalPart: true,
      complete: true,
      acceptedAnswers: { final_order: "choice-1" },
      hintsUsed: 0,
      revealStepsSeen: 0,
      evidencePersisted: false,
      parts: [
        {
          partId: "final_order",
          rawAnswer: "choice-1",
          isCorrect: true,
          score: 1,
          maxScore: 1,
          feedback: "Correct.",
        },
      ],
    };
    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValue(new Response(JSON.stringify(receipt)));
    render(<TriangleOrderingPractice items={[completeItem]} />);
    fireEvent.change(screen.getByLabelText("Final"), {
      target: { value: "choice-1" },
    });
    fireEvent.click(screen.getByText("Check answer"));
    await screen.findByText("Practice complete.");
    fetchMock.mockRestore();
  });
  it("completes the full three-part Guided sequence", async () => {
    const second = {
      id: "opposite_correspondence",
      prompt: "Match",
      kind: "choice",
      choices: [
        { id: "choice-1", text: "right" },
        { id: "choice-2", text: "wrong" },
      ],
    };
    const third = {
      id: "final_order",
      prompt: "Final",
      kind: "choice",
      choices: [
        { id: "choice-1", text: "right" },
        { id: "choice-2", text: "wrong" },
      ],
    };
    const answers = {
      measure_order: "choice-1",
      opposite_correspondence: "choice-1",
      final_order: "choice-1",
    };
    const base = {
      kind: "graded",
      submissionId: "s",
      feedback: "Correct.",
      finalPart: false,
      complete: false,
      hintsUsed: 0,
      revealStepsSeen: 0,
      evidencePersisted: false,
    };
    const complete = {
      ...base,
      submissionId: "s3",
      score: 3,
      maxScore: 3,
      finalPart: true,
      complete: true,
      acceptedAnswers: answers,
      parts: Object.entries(answers).map(([partId, rawAnswer]) => ({
        partId,
        rawAnswer,
        isCorrect: true,
        score: 1,
        maxScore: 1,
        feedback: "Correct.",
      })),
    };
    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            ...base,
            score: 1,
            maxScore: 1,
            acceptedAnswers: { measure_order: "choice-1" },
            nextPart: second,
          }),
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            ...base,
            submissionId: "s2",
            score: 1,
            maxScore: 1,
            acceptedAnswers: {
              measure_order: "choice-1",
              opposite_correspondence: "choice-1",
            },
            nextPart: third,
          }),
        ),
      )
      .mockResolvedValueOnce(new Response(JSON.stringify(complete)));
    render(<TriangleOrderingPractice items={[item]} />);
    for (const label of ["Measure", "Match", "Final"]) {
      fireEvent.change(await screen.findByLabelText(label), {
        target: { value: "choice-1" },
      });
      fireEvent.click(screen.getByText("Check answer"));
    }
    await screen.findByText("Practice complete.");
    expect(fetchMock).toHaveBeenCalledTimes(3);
    fetchMock.mockRestore();
  });
  it("completes Problem 10 after its accepted missing-angle prefix", async () => {
    const finalPart = {
      id: "final_order",
      prompt: "Order sides",
      kind: "choice",
      choices: [
        { id: "choice-1", text: "right" },
        { id: "choice-2", text: "wrong" },
      ],
    };
    const first = {
      kind: "graded",
      submissionId: "p1",
      score: 1,
      maxScore: 1,
      feedback: "Correct.",
      finalPart: false,
      complete: false,
      acceptedAnswers: { missing_angle: "66" },
      hintsUsed: 0,
      revealStepsSeen: 0,
      evidencePersisted: false,
      nextPart: finalPart,
    };
    const parts = [
      {
        partId: "missing_angle",
        rawAnswer: "66",
        isCorrect: true,
        score: 1,
        maxScore: 1,
        feedback: "Correct.",
      },
      {
        partId: "final_order",
        rawAnswer: "choice-1",
        isCorrect: true,
        score: 1,
        maxScore: 1,
        feedback: "Correct.",
      },
    ];
    const second = {
      kind: "graded",
      submissionId: "p2",
      score: 2,
      maxScore: 2,
      feedback: "Correct.",
      finalPart: true,
      complete: true,
      acceptedAnswers: { missing_angle: "66", final_order: "choice-1" },
      hintsUsed: 0,
      revealStepsSeen: 0,
      evidencePersisted: false,
      parts,
    };
    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify(first)))
      .mockResolvedValueOnce(new Response(JSON.stringify(second)));
    render(
      <TriangleOrderingPractice
        items={[
          {
            ...item,
            mode: "independent_practice",
            problem: 10,
            currentPart: {
              id: "missing_angle",
              prompt: "Missing angle",
              kind: "numeric" as const,
            },
          },
        ]}
      />,
    );
    fireEvent.change(screen.getByLabelText("Missing angle"), {
      target: { value: "66" },
    });
    fireEvent.click(screen.getByText("Check answer"));
    fireEvent.change(await screen.findByLabelText("Order sides"), {
      target: { value: "choice-1" },
    });
    fireEvent.click(screen.getByText("Check answer"));
    await screen.findByText("Practice complete.");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    fetchMock.mockRestore();
  });
});
