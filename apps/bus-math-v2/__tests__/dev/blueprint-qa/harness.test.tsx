import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useState } from "react";

const registryMocks = vi.hoisted(() => ({
  getActivityComponent: vi.fn(),
  renderedProps: [] as Array<Record<string, unknown>>,
}));

vi.mock("@math-platform/activity-components/registry", () => ({
  getActivityComponent: registryMocks.getActivityComponent,
  registerActivity: vi.fn(),
  getRegisteredActivityKeys: vi.fn(() => []),
  clearActivityRegistry: vi.fn(),
}));

import type { SkillNode, SubmissionEntry } from "@/app/(dev)/blueprint-qa/types";
import type {
  KnowledgeBlueprint,
  ProjectedActivity,
} from "@math-platform/knowledge-space-practice";

function makeSkillNode(overrides: Partial<SkillNode> = {}): SkillNode {
  return {
    id: "math.im3.skill.1.1.test-skill",
    kind: "skill",
    title: "Test Skill",
    domain: "math.im3",
    reviewStatus: "draft",
    metadata: { module: "1", lesson: "1" },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// GeneratorPanel component tests
// ---------------------------------------------------------------------------

vi.mock("@math-platform/math-content/knowledge-space", () => ({
  getGenerator: vi.fn(),
  GENERATOR_KEYS: [],
}));

import { getGenerator } from "@math-platform/math-content/knowledge-space";
import { GeneratorPanel } from "@/app/(dev)/blueprint-qa/components/GeneratorPanel";

const mockGetGenerator = getGenerator as ReturnType<typeof vi.fn>;

describe("GeneratorPanel", () => {
  beforeEach(() => {
    mockGetGenerator.mockReset();
  });

  const defaultHarnessState = {
    selectedNodeId: "math.im3.skill.1.1.test-skill",
    seed: 42,
    difficulty: 0.5,
    mode: "independent_practice" as const,
    generatorOutput: null,
    generatorError: null,
    lastSubmission: null,
  };

  const defaultNode = makeSkillNode({
    generatorKey: "test-generator",
    rendererKey: "test-renderer",
  });

  const defaultBlueprint: KnowledgeBlueprint = {
    nodeId: "math.im3.skill.1.1.test-skill",
    sourceNodeIds: [],
    alignmentNodeIds: [],
    rendererKey: "test-renderer",
    rendererModeMap: {},
    reviewStatus: "draft",
    metadata: {},
    generatorKey: "test-generator",
  };

  it("renders prompt when no node is selected", () => {
    render(
      <GeneratorPanel
        state={{ ...defaultHarnessState, selectedNodeId: null }}
        selectedNode={null}
        selectedBlueprint={null}
        onUpdateState={vi.fn()}
      />,
    );
    expect(
      screen.getByText("Select a skill from the sidebar to generate output."),
    ).toBeInTheDocument();
  });

  it("shows warning when no generator key is assigned", () => {
    render(
      <GeneratorPanel
        state={defaultHarnessState}
        selectedNode={{ ...defaultNode, generatorKey: undefined }}
        selectedBlueprint={{ ...defaultBlueprint, generatorKey: undefined }}
        onUpdateState={vi.fn()}
      />,
    );
    expect(screen.getByText(/No generator key assigned/)).toBeInTheDocument();
  });

  it("renders seed, difficulty, and mode controls when generator key exists", () => {
    render(
      <GeneratorPanel
        state={defaultHarnessState}
        selectedNode={defaultNode}
        selectedBlueprint={defaultBlueprint}
        onUpdateState={vi.fn()}
      />,
    );
    expect(screen.getByText("test-generator")).toBeInTheDocument();
    expect(screen.getByDisplayValue("42")).toBeInTheDocument();
    expect(screen.getByRole("slider")).toBeInTheDocument();
  });

  it("displays generator error with stack trace", async () => {
    const onUpdateState = vi.fn();
    mockGetGenerator.mockImplementation(() => {
      const err = new Error("Generator failed");
      err.stack = "Error: Generator failed\n    at generate (test.ts:1)";
      throw err;
    });

    render(
      <GeneratorPanel
        state={defaultHarnessState}
        selectedNode={defaultNode}
        selectedBlueprint={defaultBlueprint}
        onUpdateState={onUpdateState}
      />,
    );

    // Wait for debounced generator call
    await waitFor(() => {
      expect(onUpdateState).toHaveBeenCalledWith(
        expect.objectContaining({
          generatorError: expect.stringContaining("Generator failed"),
        }),
      );
    });

    // Verify stack trace is included (not just message)
    const errorCall = onUpdateState.mock.calls.find(
      (call: unknown[]) => (call[0] as Record<string, unknown>)?.generatorError != null,
    );
    expect(errorCall).toBeDefined();
    expect((errorCall![0] as Record<string, unknown>).generatorError).toContain(
      "Error: Generator failed",
    );
    expect((errorCall![0] as Record<string, unknown>).generatorError).toContain("at generate");
  });

  it("displays JSON output when generator succeeds", () => {
    const onUpdateState = vi.fn();
    const generatorOutput = {
      prompt: "Test prompt",
      data: { a: 1, b: 2 },
      expectedAnswer: { result: 42 },
      solutionSteps: [],
      gradingMetadata: {
        partAnswers: { result: 42 },
        partMaxScores: { result: 5 },
        partGradingRules: { result: "exact_match" },
      },
    };
    mockGetGenerator.mockReturnValue({
      generate: () => generatorOutput,
    });

    render(
      <GeneratorPanel
        state={{
          ...defaultHarnessState,
          generatorOutput: generatorOutput as unknown as Record<string, unknown>,
        }}
        selectedNode={defaultNode}
        selectedBlueprint={defaultBlueprint}
        onUpdateState={onUpdateState}
      />,
    );

    expect(screen.getByText("Output")).toBeInTheDocument();
  });

  it("calls onUpdateState when seed changes", () => {
    const onUpdateState = vi.fn();
    render(
      <GeneratorPanel
        state={defaultHarnessState}
        selectedNode={defaultNode}
        selectedBlueprint={defaultBlueprint}
        onUpdateState={onUpdateState}
      />,
    );
    const seedInput = screen.getByDisplayValue("42");
    fireEvent.change(seedInput, { target: { value: "100" } });
    expect(onUpdateState).toHaveBeenCalledWith({ seed: 100 });
  });

  it("calls onUpdateState when difficulty changes", () => {
    const onUpdateState = vi.fn();
    render(
      <GeneratorPanel
        state={defaultHarnessState}
        selectedNode={defaultNode}
        selectedBlueprint={defaultBlueprint}
        onUpdateState={onUpdateState}
      />,
    );
    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "0.7" } });
    expect(onUpdateState).toHaveBeenCalledWith({ difficulty: 0.7 });
  });
});

// ---------------------------------------------------------------------------
// RendererPreview component tests
// ---------------------------------------------------------------------------

import { RendererPreview } from "@/app/(dev)/blueprint-qa/components/RendererPreview";

describe("RendererPreview", () => {
  function StudentActivityProbe(props: Record<string, unknown>) {
    registryMocks.renderedProps.push(props);
    return <div>Registered student activity</div>;
  }

  function StatefulStudentActivityProbe() {
    const [answer, setAnswer] = useState("initial answer");
    return (
      <input
        aria-label="student answer"
        value={answer}
        onChange={(event) => setAnswer(event.target.value)}
      />
    );
  }

  function CompletingStudentActivityProbe(props: Record<string, unknown>) {
    const onSubmit = props.onSubmit as ((payload: unknown) => void) | undefined;
    const onComplete = props.onComplete as (() => void) | undefined;
    const envelope = {
      version: "practice.v1",
      activityId: "math.im3.skill.1.1.test-skill.guided_practice",
      mode: "guided_practice",
      answers: { response: { answer: "guided answer" } },
    };

    return (
      <button
        type="button"
        onClick={() => {
          onSubmit?.(envelope);
          onComplete?.();
        }}
      >
        Submit activity
      </button>
    );
  }

  const defaultHarnessState = {
    selectedNodeId: "math.im3.skill.1.1.test-skill",
    seed: 42,
    difficulty: 0.5,
    mode: "independent_practice" as const,
    generatorOutput: null,
    generatorError: null,
    lastSubmission: null,
  };

  const makeActivity = (
    mode: ProjectedActivity["mode"] = "independent_practice",
    props: Record<string, unknown> = { equation: "y = x^2 - 4" },
    rendererKey = "graphing-explorer",
  ): ProjectedActivity => ({
    stableActivityId: `math.im3.skill.1.1.test-skill.${mode}`,
    nodeId: "math.im3.skill.1.1.test-skill",
    sourceNodeIds: [],
    rendererKey,
    mode,
    alignmentNodeIds: [],
    props,
    gradingConfig: {},
    srsEligible: mode === "independent_practice",
  });

  beforeEach(() => {
    registryMocks.renderedProps.length = 0;
    registryMocks.getActivityComponent.mockReset();
    registryMocks.getActivityComponent.mockImplementation((key: string) =>
      key === "unregistered-component" ? undefined : StudentActivityProbe,
    );
  });

  it("renders prompt when no node selected", () => {
    render(
      <RendererPreview
        state={{ ...defaultHarnessState, selectedNodeId: null }}
        selectedNode={null}
        activity={null}
        onIntercept={vi.fn()}
      />,
    );
    expect(
      screen.getByText("Select a skill to preview its student component."),
    ).toBeInTheDocument();
  });

  it("shows an unavailable state when the modality projection is missing", () => {
    render(
      <RendererPreview
        state={defaultHarnessState}
        selectedNode={makeSkillNode()}
        activity={null}
        onIntercept={vi.fn()}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Student view unavailable");
    expect(screen.getByRole("alert")).toHaveTextContent("activity projection is missing");
  });

  it("shows the exact schema mismatch instead of fallback content", () => {
    render(
      <RendererPreview
        state={defaultHarnessState}
        selectedNode={makeSkillNode({ rendererKey: "graphing-explorer" })}
        activity={makeActivity("worked_example", {
          prompt: "Graph the source function.",
          givens: ["f(x) = x^2 - 4"],
        })}
        onIntercept={vi.fn()}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Student view unavailable");
    expect(screen.getByRole("alert")).toHaveTextContent("equation");
    expect(screen.queryByText("Registered student activity")).not.toBeInTheDocument();
    expect(registryMocks.renderedProps).toHaveLength(0);
  });

  it.each([
    ["worked_example", "teaching"],
    ["guided_practice", "guided"],
    ["independent_practice", "practice"],
  ] as const)("renders the registered student component for %s", (projectionMode, runtimeMode) => {
    const activity = makeActivity(projectionMode);
    render(
      <RendererPreview
        state={{
          ...defaultHarnessState,
          mode: projectionMode,
        }}
        selectedNode={makeSkillNode({ rendererKey: "graphing-explorer" })}
        activity={activity}
        onIntercept={vi.fn()}
      />,
    );

    expect(screen.getByText("Registered student activity")).toBeInTheDocument();
    expect(registryMocks.renderedProps.at(-1)).toMatchObject({
      equation: "y = x^2 - 4",
      activityId: activity.stableActivityId,
      stableActivityId: activity.stableActivityId,
      mode: runtimeMode,
    });
  });

  it("remounts the student activity when the projected activity changes", () => {
    registryMocks.getActivityComponent.mockReturnValue(StatefulStudentActivityProbe);
    const guidedActivity = makeActivity("guided_practice");
    const independentActivity = makeActivity("independent_practice");
    const { rerender } = render(
      <RendererPreview
        state={{ ...defaultHarnessState, mode: "guided_practice" }}
        selectedNode={makeSkillNode({ rendererKey: "graphing-explorer" })}
        activity={guidedActivity}
        onIntercept={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "guided answer" } });
    expect(screen.getByRole("textbox")).toHaveValue("guided answer");

    rerender(
      <RendererPreview
        state={{ ...defaultHarnessState, mode: "independent_practice" }}
        selectedNode={makeSkillNode({ rendererKey: "graphing-explorer" })}
        activity={independentActivity}
        onIntercept={vi.fn()}
      />,
    );

    expect(screen.getByRole("textbox")).toHaveValue("initial answer");
  });

  it("keeps the submitted practice envelope after completion", () => {
    registryMocks.getActivityComponent.mockReturnValue(CompletingStudentActivityProbe);
    function PreviewHarness() {
      const [lastSubmission, setLastSubmission] = useState<SubmissionEntry | null>(null);
      return (
        <RendererPreview
          state={{
            ...defaultHarnessState,
            lastSubmission,
          }}
          selectedNode={makeSkillNode({ rendererKey: "graphing-explorer" })}
          activity={makeActivity("guided_practice")}
          onIntercept={setLastSubmission}
        />
      );
    }

    render(<PreviewHarness />);
    fireEvent.click(screen.getByRole("button", { name: "Submit activity" }));

    expect(screen.getByText("Submission log")).toBeInTheDocument();
    expect(screen.getByText(/practice\.v1/)).toBeInTheDocument();
    expect(screen.getByText(/guided answer/)).toBeInTheDocument();
    expect(screen.queryByText("__complete__")).not.toBeInTheDocument();
  });

  it("does not invent a graphing equation when the projection omits one", () => {
    render(
      <RendererPreview
        state={defaultHarnessState}
        selectedNode={makeSkillNode({ rendererKey: "graphing-explorer" })}
        activity={makeActivity("independent_practice", {})}
        onIntercept={vi.fn()}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Student view unavailable");
    expect(registryMocks.renderedProps).toHaveLength(0);
  });

  it("labels intercepted work as captured instead of grading it in the browser", () => {
    render(
      <RendererPreview
        state={{
          ...defaultHarnessState,
          lastSubmission: { partId: "submission", rawAnswer: { answer: 42 }, isCorrect: false },
        }}
        selectedNode={makeSkillNode({ rendererKey: "graphing-explorer" })}
        activity={makeActivity()}
        onIntercept={vi.fn()}
      />,
    );

    expect(screen.getByText("Submission log")).toBeInTheDocument();
    expect(screen.getByText("Captured")).toBeInTheDocument();
    expect(screen.queryByText("Incorrect")).not.toBeInTheDocument();
  });
});
