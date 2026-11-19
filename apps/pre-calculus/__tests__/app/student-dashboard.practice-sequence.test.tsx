import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireStudentSessionClaims: vi.fn(),
  fetchInternalQuery: vi.fn(),
  masteryAdvantage: vi.fn(),
  physicalWorked: vi.fn(),
  physicalPractice: vi.fn(),
  orderingWorked: vi.fn(),
  orderingPractice: vi.fn(),
  pointwiseWorked: vi.fn(),
  pointwisePractice: vi.fn(),
  graphWorked: vi.fn(),
  graphPractice: vi.fn(),
  negativeRateContextWorked: vi.fn(),
  negativeRateContextPractice: vi.fn(),
  quadraticNegativeRateIntervalWorked: vi.fn(),
  quadraticNegativeRateIntervalPractice: vi.fn(),
  topic12Worked: vi.fn(),
  topic12Practice: vi.fn(),
  topic13Worked: vi.fn(),
  topic13Practice: vi.fn(),
  concavityWorked: vi.fn(),
  concavityPractice: vi.fn(),
  polynomialDegreeLeadingCoefficientWorked: vi.fn(),
  polynomialDegreeLeadingCoefficientPractice: vi.fn(),
  polynomialExtremaWorked: vi.fn(),
  polynomialExtremaPractice: vi.fn(),
  rateSignAndTrendWorked: vi.fn(),
  rateSignAndTrendPractice: vi.fn(),
  polynomialEndBehaviorWorked: vi.fn(),
  polynomialEndBehaviorPractice: vi.fn(),
  realZerosAndMultiplicitiesWorked: vi.fn(),
  realZerosAndMultiplicitiesPractice: vi.fn(),
  leastPolynomialDegreeWorked: vi.fn(),
  leastPolynomialDegreePractice: vi.fn(),
  polynomialInequalityWorked: vi.fn(),
  polynomialInequalityPractice: vi.fn(),
  topic16Worked: vi.fn(),
  topic16Practice: vi.fn(),
  approvedTopic11Pilot: [] as Array<Record<string, unknown>>,
}));

vi.mock("@/lib/auth/server", () => ({
  requireStudentSessionClaims: mocks.requireStudentSessionClaims,
}));

vi.mock("@/lib/convex/server", () => ({
  fetchInternalQuery: (ref: unknown, args: unknown) =>
    ref === "student:getDashboardData"
      ? Promise.resolve({ assignments: [], dueReviews: [] })
      : ref === "activities:getApprovedPrecalculusPilot"
        ? Promise.resolve(mocks.approvedTopic11Pilot)
        : mocks.fetchInternalQuery(ref, args),
  internal: {
    student: { getDashboardData: "student:getDashboardData" },
    activities: { getApprovedPrecalculusPilot: "activities:getApprovedPrecalculusPilot" },
    learningEvidence: {
      getPrecalculusPilotKnowledgeState: "learningEvidence:getPrecalculusPilotKnowledgeState",
      getPrecalculusPhysicalContextKnowledgeState:
        "learningEvidence:getPrecalculusPhysicalContextKnowledgeState",
      getPrecalculusTopic12PointwiseRateOrderingKnowledgeState:
        "learningEvidence:getPrecalculusTopic12PointwiseRateOrderingKnowledgeState",
      getPrecalculusTopic12PointwiseLeastRateKnowledgeState:
        "learningEvidence:getPrecalculusTopic12PointwiseLeastRateKnowledgeState",
      getPrecalculusTopic12GraphAverageRateKnowledgeState:
        "learningEvidence:getPrecalculusTopic12GraphAverageRateKnowledgeState",
      getPrecalculusTopic12NegativeRateContextKnowledgeState:
        "learningEvidence:getPrecalculusTopic12NegativeRateContextKnowledgeState",
      getPrecalculusTopic12QuadraticNegativeRateIntervalKnowledgeState:
        "learningEvidence:getPrecalculusTopic12QuadraticNegativeRateIntervalKnowledgeState",
      getPrecalculusTopic12KnowledgeState: "learningEvidence:getPrecalculusTopic12KnowledgeState",
      getPrecalculusTopic13RatePatternClassificationKnowledgeState:
        "learningEvidence:getPrecalculusTopic13RatePatternClassificationKnowledgeState",
      getPrecalculusTopic13ConcavityKnowledgeState:
        "learningEvidence:getPrecalculusTopic13ConcavityKnowledgeState",
      getTopic14PolynomialDegreeLeadingCoefficientKnowledgeState:
        "learningEvidence:getTopic14PolynomialDegreeLeadingCoefficientKnowledgeState",
      getPrecalculusTopic14PolynomialExtremaKnowledgeState:
        "learningEvidence:getPrecalculusTopic14PolynomialExtremaKnowledgeState",
      getPrecalculusTopic14RateSignAndTrendKnowledgeState:
        "learningEvidence:getPrecalculusTopic14RateSignAndTrendKnowledgeState",
      getPrecalculusTopic14PolynomialEndBehaviorKnowledgeState:
        "learningEvidence:getPrecalculusTopic14PolynomialEndBehaviorKnowledgeState",
      getPrecalculusTopic15RealZerosAndMultiplicitiesKnowledgeState:
        "learningEvidence:getPrecalculusTopic15RealZerosAndMultiplicitiesKnowledgeState",
      getPrecalculusTopic15LeastPolynomialDegreeKnowledgeState:
        "learningEvidence:getPrecalculusTopic15LeastPolynomialDegreeKnowledgeState",
      getPrecalculusTopic15PolynomialInequalityKnowledgeState:
        "learningEvidence:getPrecalculusTopic15PolynomialInequalityKnowledgeState",
      getPrecalculusTopic16PolynomialEquationEndBehaviorKnowledgeState:
        "learningEvidence:getPrecalculusTopic16PolynomialEquationEndBehaviorKnowledgeState",
    },
  },
}));

vi.mock("@/components/student/PrecalculusTopic11DailyCurriculumPilot", () => ({
  PrecalculusTopic11DailyCurriculumPilot: () => (
    <section data-testid="worked-example">
      <h2>Worked Example: Find Increasing Intervals</h2>
    </section>
  ),
}));

vi.mock("@/components/student/PrecalculusPhysicalContextWorkedPilot", () => ({
  PrecalculusPhysicalContextWorkedPilot: mocks.physicalWorked.mockImplementation(() => (
    <section data-testid="physical-worked-example">
      <h2>Worked Example: Select a Physical-Context Graph</h2>
    </section>
  )),
}));

vi.mock("@/components/student/PrecalculusPhysicalContextPracticePilot", () => ({
  PrecalculusPhysicalContextPracticePilot: mocks.physicalPractice.mockImplementation(
    (props: {
      knowledgeState: { nodeId: string; status: string; readiness: string };
      mode?: "guided_practice" | "independent_practice";
    }) => (
      <section data-testid={`physical-${props.mode ?? "guided_practice"}`}>
        <h2>
          {props.mode === "independent_practice"
            ? "Independent Practice: Select a Physical-Context Graph"
            : "Guided Practice: Select a Physical-Context Graph"}
        </h2>
        <output>{JSON.stringify(props)}</output>
      </section>
    ),
  ),
}));

vi.mock("@/components/student/PrecalculusMasteryAdvantagePilot", () => ({
  PrecalculusMasteryAdvantagePilot: mocks.masteryAdvantage.mockImplementation(
    (props: {
      knowledgeState: { nodeId: string; status: string; readiness: string };
      mode?: "guided_practice" | "independent_practice";
      seed?: number;
    }) => (
      <section data-testid={`mastery-${props.mode ?? "guided_practice"}`}>
        <h2>
          {props.mode === "independent_practice"
            ? "Independent Practice: Classify Graph Intervals"
            : "Guided Practice: Classify Graph Intervals"}
        </h2>
        <output>{JSON.stringify(props)}</output>
      </section>
    ),
  ),
}));

vi.mock("@/components/student/PrecalculusTopic12WorkedPilot", () => ({
  PrecalculusTopic12WorkedPilot: mocks.topic12Worked.mockImplementation(() => (
    <section data-testid="topic-1-2-worked-example">
      <h2>Worked Example: Compare Average Rates of Change</h2>
    </section>
  )),
}));

vi.mock("@/components/student/PrecalculusTopic12GraphWorkedPilot", () => ({
  PrecalculusTopic12GraphWorkedPilot: mocks.graphWorked.mockImplementation(() => (
    <section data-testid="topic-1-2-graph-worked-example">
      <h2>Worked Example: Compare Average Rates of Change (Graph)</h2>
    </section>
  )),
}));

vi.mock("@/components/student/PrecalculusTopic12PointwiseWorkedPilot", () => ({
  PrecalculusTopic12PointwiseWorkedPilot: mocks.pointwiseWorked.mockImplementation(() => (
    <section data-testid="topic-1-2-pointwise-worked-example">
      <h2>Worked Example: Find the Least Pointwise Rate</h2>
    </section>
  )),
}));

vi.mock("@/components/student/PrecalculusTopic12PointwiseOrderingWorkedPilot", () => ({
  PrecalculusTopic12PointwiseOrderingWorkedPilot: mocks.orderingWorked.mockImplementation(() => (
    <section data-testid="topic-1-2-pointwise-ordering-worked-example">
      <h2>Worked Example: Order Pointwise Rates</h2>
    </section>
  )),
}));

vi.mock("@/components/student/PrecalculusTopic12PointwiseOrderingPracticePilot", () => ({
  PrecalculusTopic12PointwiseOrderingPracticePilot: mocks.orderingPractice.mockImplementation(
    (props: { knowledgeState?: unknown; mode?: "guided_practice" | "independent_practice" }) => (
      <section data-testid={`topic-1-2-pointwise-ordering-${props.mode ?? "guided_practice"}`}>
        <h2>
          {props.mode === "independent_practice"
            ? "Independent Practice: Order Pointwise Rates"
            : "Guided Practice: Order Pointwise Rates"}
        </h2>
        <output>{JSON.stringify(props)}</output>
      </section>
    ),
  ),
}));

vi.mock("@/components/student/PrecalculusTopic12PointwisePracticePilot", () => ({
  PrecalculusTopic12PointwisePracticePilot: mocks.pointwisePractice.mockImplementation(
    (props: { knowledgeState?: unknown; mode?: "guided_practice" | "independent_practice" }) => (
      <section data-testid={`topic-1-2-pointwise-${props.mode ?? "guided_practice"}`}>
        <h2>
          {props.mode === "independent_practice"
            ? "Independent Practice: Find the Least Pointwise Rate"
            : "Guided Practice: Find the Least Pointwise Rate"}
        </h2>
        <output>{JSON.stringify(props)}</output>
      </section>
    ),
  ),
}));

vi.mock("@/components/student/PrecalculusTopic12GraphPracticePilot", () => ({
  PrecalculusTopic12GraphPracticePilot: mocks.graphPractice.mockImplementation(
    (props: { knowledgeState?: unknown; mode?: "guided_practice" | "independent_practice" }) => (
      <section data-testid={`topic-1-2-graph-${props.mode ?? "guided_practice"}`}>
        <h2>
          {props.mode === "independent_practice"
            ? "Independent Practice: Compare Average Rates of Change (Graph)"
            : "Guided Practice: Compare Average Rates of Change (Graph)"}
        </h2>
      </section>
    ),
  ),
}));

vi.mock("@/components/student/PrecalculusTopic12NegativeRateContextWorkedPilot", () => ({
  PrecalculusTopic12NegativeRateContextWorkedPilot:
    mocks.negativeRateContextWorked.mockImplementation(() => (
      <section data-testid="topic-1-2-negative-rate-context-worked-example">
        <h2>Worked Example: Model a Negative Rate Context</h2>
      </section>
    )),
}));

vi.mock("@/components/student/PrecalculusTopic12NegativeRateContextPracticePilot", () => ({
  PrecalculusTopic12NegativeRateContextPracticePilot:
    mocks.negativeRateContextPractice.mockImplementation(
      (props: {
        knowledgeState: { nodeId: string; title: string; status: string; readiness: string };
        mode?: "guided_practice" | "independent_practice";
      }) => (
        <section data-testid={`topic-1-2-negative-rate-context-${props.mode ?? "guided_practice"}`}>
          <h2>
            {props.mode === "independent_practice"
              ? "Independent Practice: Model a Negative Rate Context"
              : "Guided Practice: Model a Negative Rate Context"}
          </h2>
          <output>{JSON.stringify(props)}</output>
        </section>
      ),
    ),
}));

vi.mock("@/components/student/PrecalculusTopic12QuadraticNegativeRateIntervalWorkedPilot", () => ({
  PrecalculusTopic12QuadraticNegativeRateIntervalWorkedPilot:
    mocks.quadraticNegativeRateIntervalWorked.mockImplementation(() => (
      <section data-testid="topic-1-2-quadratic-negative-rate-interval-worked-example">
        <h2>Worked Example: Identify Negative-Rate Intervals</h2>
      </section>
    )),
}));

vi.mock(
  "@/components/student/PrecalculusTopic12QuadraticNegativeRateIntervalPracticePilot",
  () => ({
    PrecalculusTopic12QuadraticNegativeRateIntervalPracticePilot:
      mocks.quadraticNegativeRateIntervalPractice.mockImplementation(
        (props: { knowledgeState: unknown; mode?: "guided_practice" | "independent_practice" }) => (
          <section data-testid={`topic-1-2-quadratic-negative-rate-interval-${props.mode}`}>
            <h2>
              {props.mode === "independent_practice"
                ? "Independent Practice: Identify Negative-Rate Intervals"
                : "Guided Practice: Identify Negative-Rate Intervals"}
            </h2>
            <output>{JSON.stringify(props)}</output>
          </section>
        ),
      ),
  }),
);

vi.mock("@/components/student/PrecalculusTopic12PracticePilot", () => ({
  PrecalculusTopic12PracticePilot: mocks.topic12Practice.mockImplementation(
    (props: { mode?: "guided_practice" | "independent_practice" }) => (
      <section data-testid={`topic-1-2-${props.mode ?? "guided_practice"}`}>
        <h2>
          {props.mode === "independent_practice"
            ? "Independent Practice: Compare Average Rates of Change"
            : "Guided Practice: Compare Average Rates of Change"}
        </h2>
      </section>
    ),
  ),
}));

vi.mock("@/components/student/PrecalculusTopic13RatePatternClassificationWorkedPilot", () => ({
  PrecalculusTopic13RatePatternClassificationWorkedPilot: mocks.topic13Worked.mockImplementation(
    () => (
      <section data-testid="topic-1-3-rate-pattern-classification-worked-example">
        <h2>Worked Example: Classify Rate Patterns</h2>
      </section>
    ),
  ),
}));

vi.mock("@/components/student/PrecalculusTopic13RatePatternClassificationPracticePilot", () => ({
  PrecalculusTopic13RatePatternClassificationPracticePilot:
    mocks.topic13Practice.mockImplementation(
      (props: { knowledgeState: unknown; mode?: "guided_practice" | "independent_practice" }) => (
        <section data-testid={`topic-1-3-rate-pattern-classification-${props.mode}`}>
          <h2>
            {props.mode === "independent_practice"
              ? "Independent Practice: Classify Rate Patterns"
              : "Guided Practice: Classify Rate Patterns"}
          </h2>
          <output>{JSON.stringify(props)}</output>
        </section>
      ),
    ),
}));

vi.mock("@/components/student/PrecalculusTopic13ConcavityWorkedPilot", () => ({
  PrecalculusTopic13ConcavityWorkedPilot: mocks.concavityWorked.mockImplementation(() => (
    <section data-testid="topic-1-3-concavity-worked-example">
      <h2>Worked Example: Determine Concavity</h2>
    </section>
  )),
}));

vi.mock("@/components/student/PrecalculusTopic13ConcavityPracticePilot", () => ({
  PrecalculusTopic13ConcavityPracticePilot: mocks.concavityPractice.mockImplementation(
    (props: { knowledgeState: unknown; mode?: "guided_practice" | "independent_practice" }) => (
      <section data-testid={`topic-1-3-concavity-${props.mode}`}>
        <h2>
          {props.mode === "independent_practice"
            ? "Independent Practice: Determine Concavity"
            : "Guided Practice: Determine Concavity"}
        </h2>
        <output>{JSON.stringify(props)}</output>
      </section>
    ),
  ),
}));

vi.mock(
  "@/components/student/PrecalculusTopic14PolynomialDegreeLeadingCoefficientWorkedPilot",
  () => ({
    PrecalculusTopic14PolynomialDegreeLeadingCoefficientWorkedPilot:
      mocks.polynomialDegreeLeadingCoefficientWorked.mockImplementation(() => (
        <section data-testid="topic-1-4-polynomial-degree-leading-coefficient-worked-example">
          <h2>Worked Example: Degree and Leading Coefficient</h2>
        </section>
      )),
  }),
);

vi.mock(
  "@/components/student/PrecalculusTopic14PolynomialDegreeLeadingCoefficientPracticePilot",
  () => ({
    PrecalculusTopic14PolynomialDegreeLeadingCoefficientPracticePilot:
      mocks.polynomialDegreeLeadingCoefficientPractice.mockImplementation(
        (props: { knowledgeState: unknown; mode?: "guided_practice" | "independent_practice" }) => (
          <section data-testid={`topic-1-4-polynomial-degree-leading-coefficient-${props.mode}`}>
            <h2>
              {props.mode === "independent_practice"
                ? "Independent Practice: Degree and Leading Coefficient"
                : "Guided Practice: Degree and Leading Coefficient"}
            </h2>
            <output>{JSON.stringify(props)}</output>
          </section>
        ),
      ),
  }),
);

vi.mock("@/components/student/PrecalculusTopic14PolynomialExtremaWorkedPilot", () => ({
  PrecalculusTopic14PolynomialExtremaWorkedPilot: mocks.polynomialExtremaWorked.mockImplementation(
    () => (
      <section data-testid="topic-1-4-polynomial-extrema-worked-example">
        <h2>Worked Example: Identify Extrema from a Graph</h2>
      </section>
    ),
  ),
}));

vi.mock("@/components/student/PrecalculusTopic14PolynomialExtremaPracticePilot", () => ({
  PrecalculusTopic14PolynomialExtremaPracticePilot:
    mocks.polynomialExtremaPractice.mockImplementation(
      (props: { knowledgeState: unknown; mode?: "guided_practice" | "independent_practice" }) => (
        <section data-testid={`topic-1-4-polynomial-extrema-${props.mode}`}>
          <h2>
            {props.mode === "independent_practice"
              ? "Independent Practice: Identify Extrema from a Graph"
              : "Guided Practice: Identify Extrema from a Graph"}
          </h2>
          <output>{JSON.stringify(props)}</output>
        </section>
      ),
    ),
}));

vi.mock("@/components/student/PrecalculusTopic14RateSignAndTrendWorkedPilot", () => ({
  PrecalculusTopic14RateSignAndTrendWorkedPilot: mocks.rateSignAndTrendWorked.mockImplementation(
    () => (
      <section data-testid="topic-1-4-rate-sign-and-trend-worked-example">
        <h2>Worked Example: Rate Sign and Trend</h2>
      </section>
    ),
  ),
}));

vi.mock("@/components/student/PrecalculusTopic14RateSignAndTrendPracticePilot", () => ({
  PrecalculusTopic14RateSignAndTrendPracticePilot:
    mocks.rateSignAndTrendPractice.mockImplementation(
      (props: { knowledgeState: unknown; mode?: "guided_practice" | "independent_practice" }) => (
        <section data-testid={`topic-1-4-rate-sign-and-trend-${props.mode}`}>
          <h2>
            {props.mode === "independent_practice"
              ? "Independent Practice: Rate Sign and Trend"
              : "Guided Practice: Rate Sign and Trend"}
          </h2>
          <output>{JSON.stringify(props)}</output>
        </section>
      ),
    ),
}));

vi.mock("@/components/student/PrecalculusTopic14PolynomialEndBehaviorWorkedPilot", () => ({
  PrecalculusTopic14PolynomialEndBehaviorWorkedPilot:
    mocks.polynomialEndBehaviorWorked.mockImplementation(() => (
      <section data-testid="topic-1-4-polynomial-end-behavior-worked-example">
        <h2>Worked Example: Polynomial End Behavior</h2>
      </section>
    )),
}));

vi.mock("@/components/student/PrecalculusTopic14PolynomialEndBehaviorPracticePilot", () => ({
  PrecalculusTopic14PolynomialEndBehaviorPracticePilot:
    mocks.polynomialEndBehaviorPractice.mockImplementation(
      (props: { knowledgeState: unknown; mode?: "guided_practice" | "independent_practice" }) => (
        <section data-testid={`topic-1-4-polynomial-end-behavior-${props.mode}`}>
          <h2>
            {props.mode === "independent_practice"
              ? "Independent Practice: Polynomial End Behavior"
              : "Guided Practice: Polynomial End Behavior"}
          </h2>
          <output>{JSON.stringify(props)}</output>
        </section>
      ),
    ),
}));

vi.mock("@/components/student/PrecalculusTopic15RealZerosAndMultiplicitiesWorkedPilot", () => ({
  PrecalculusTopic15RealZerosAndMultiplicitiesWorkedPilot:
    mocks.realZerosAndMultiplicitiesWorked.mockImplementation(() => (
      <section data-testid="topic-1-5-real-zeros-and-multiplicities-worked-example">
        <h2>Worked Example: Real Zeros and Multiplicities</h2>
      </section>
    )),
}));

vi.mock("@/components/student/PrecalculusTopic15RealZerosAndMultiplicitiesPracticePilot", () => ({
  PrecalculusTopic15RealZerosAndMultiplicitiesPracticePilot:
    mocks.realZerosAndMultiplicitiesPractice.mockImplementation(
      (props: { knowledgeState: unknown; mode?: "guided_practice" | "independent_practice" }) => (
        <section data-testid={`topic-1-5-real-zeros-and-multiplicities-${props.mode}`}>
          <h2>
            {props.mode === "independent_practice"
              ? "Independent Practice: Real Zeros and Multiplicities"
              : "Guided Practice: Real Zeros and Multiplicities"}
          </h2>
          <output>{JSON.stringify(props)}</output>
        </section>
      ),
    ),
}));

vi.mock("@/components/student/PrecalculusTopic15LeastPolynomialDegreeWorkedPilot", () => ({
  PrecalculusTopic15LeastPolynomialDegreeWorkedPilot:
    mocks.leastPolynomialDegreeWorked.mockImplementation(() => (
      <section data-testid="topic-1-5-least-polynomial-degree-worked-example">
        <h2>Worked Example: Least Polynomial Degree</h2>
      </section>
    )),
}));

vi.mock("@/components/student/PrecalculusTopic15LeastPolynomialDegreePracticePilot", () => ({
  PrecalculusTopic15LeastPolynomialDegreePracticePilot:
    mocks.leastPolynomialDegreePractice.mockImplementation(
      (props: { knowledgeState: unknown; mode?: "guided_practice" | "independent_practice" }) => (
        <section data-testid={`topic-1-5-least-polynomial-degree-${props.mode}`}>
          <h2>
            {props.mode === "independent_practice"
              ? "Independent Practice: Least Polynomial Degree"
              : "Guided Practice: Least Polynomial Degree"}
          </h2>
        </section>
      ),
    ),
}));

vi.mock("@/components/student/PrecalculusTopic15PolynomialInequalityWorkedPilot", () => ({
  PrecalculusTopic15PolynomialInequalityWorkedPilot:
    mocks.polynomialInequalityWorked.mockImplementation(() => (
      <section data-testid="topic-1-5-polynomial-inequality-worked-example">
        <h2>Worked Example: Polynomial Inequality Sign Chart</h2>
      </section>
    )),
}));

vi.mock("@/components/student/PrecalculusTopic15PolynomialInequalityPracticePilot", () => ({
  PrecalculusTopic15PolynomialInequalityPracticePilot:
    mocks.polynomialInequalityPractice.mockImplementation(
      (props: {
        knowledgeState: { nodeId: string; title: string; status: string; readiness: string };
        mode?: "guided_practice" | "independent_practice";
      }) => (
        <section data-testid={`topic-1-5-polynomial-inequality-${props.mode}`}>
          <h2>
            {props.mode === "independent_practice"
              ? "Independent Practice: Polynomial Inequality Sign Chart"
              : "Guided Practice: Polynomial Inequality Sign Chart"}
          </h2>
          <output>{JSON.stringify(props)}</output>
        </section>
      ),
    ),
}));

vi.mock("@/components/student/PrecalculusTopic16EquationEndBehaviorWorkedPilot", () => ({
  PrecalculusTopic16EquationEndBehaviorWorkedPilot: mocks.topic16Worked.mockImplementation(() => (
    <section data-testid="topic-1-6-equation-end-behavior-worked-example">
      <h2>Worked Example: Polynomial Equation End Behavior</h2>
    </section>
  )),
}));

vi.mock("@/components/student/PrecalculusTopic16EquationEndBehaviorPracticePilot", () => ({
  PrecalculusTopic16EquationEndBehaviorPracticePilot: mocks.topic16Practice.mockImplementation(
    (props: {
      knowledgeState: {
        nodeId: string;
        title: string;
        status: "not_started" | "in_progress" | "mastered" | "decaying";
        readiness: "ready";
      };
      mode?: "guided_practice" | "independent_practice";
    }) => (
      <section data-testid={`topic-1-6-equation-end-behavior-${props.mode}`}>
        <h2>
          {props.mode === "independent_practice"
            ? "Independent Practice: Polynomial Equation End Behavior"
            : "Guided Practice: Polynomial Equation End Behavior"}
        </h2>
      </section>
    ),
  ),
}));

import StudentDashboard from "@/app/student/dashboard/page";

const knowledgeState = {
  nodeId: "math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs",
  status: "in_progress",
  readiness: "ready",
};

const physicalKnowledgeState = {
  nodeId: "math.precalc.skill.1.1.select-a-graph-that-models-a-physical-context",
  status: "not_started",
  readiness: "ready",
};
const graphKnowledgeState = {
  nodeId: "math.precalc.skill.1.2.compute-and-interpret-average-rate-of-change",
  title: "Compute and interpret the average rate of change",
  status: "not_started",
  readiness: "ready",
};
const negativeRateContextKnowledgeState = {
  nodeId: "math.precalc.skill.1.2.model-negative-rate-contexts",
  title: "Model negative-rate contexts",
  status: "not_started",
  readiness: "ready",
};
const quadraticNegativeRateIntervalKnowledgeState = {
  nodeId: "math.precalc.skill.1.2.determine-negative-rate-intervals-for-quadratics",
  title: "Determine negative-rate intervals for quadratics",
  status: "not_started",
  readiness: "ready",
};
const pointwiseKnowledgeState = {
  nodeId: "math.precalc.skill.1.2.identify-least-pointwise-rate-of-change-from-graphs",
  title: "Identify the least pointwise rate of change from graphs",
  status: "not_started",
  readiness: "ready",
};
const orderingKnowledgeState = {
  nodeId: "math.precalc.skill.1.2.compare-pointwise-rates-of-change-from-graphs",
  title: "Compare pointwise rates of change from graphs",
  status: "not_started",
  readiness: "ready",
};
const topic12KnowledgeState = {
  nodeId: "math.precalc.skill.1.2.compare-rates-of-change-across-intervals",
  title: "Compare average rates of change across intervals",
  status: "not_started",
  readiness: "ready",
};
const ratePatternClassificationKnowledgeState = {
  nodeId: "math.precalc.skill.1.3.classify-linear-vs-quadratic-from-rate-patterns",
  title: "Classify linear vs quadratic functions from rate-of-change patterns",
  status: "not_started",
  readiness: "ready",
};
const concavityKnowledgeState = {
  nodeId: "math.precalc.skill.1.3.determine-concavity-from-rate-of-change",
  title: "Determine concavity from rate-of-change behavior",
  status: "not_started",
  readiness: "ready",
};
const polynomialDegreeLeadingCoefficientKnowledgeState = {
  nodeId: "math.precalc.skill.1.4.identify-polynomial-degree-and-leading-coefficient",
  title: "Identify polynomial degree and leading coefficient",
  status: "not_started",
  readiness: "ready",
};
const polynomialExtremaKnowledgeState = {
  nodeId: "math.precalc.skill.1.4.identify-relative-and-absolute-extrema-from-graphs",
  title: "Identify relative and absolute extrema from graphs",
  status: "not_started",
  readiness: "ready",
};
const rateSignAndTrendKnowledgeState = {
  nodeId: "math.precalc.skill.1.4.describe-rate-of-change-behavior-on-intervals",
  title: "Describe rate-of-change behavior on intervals using precise language",
  status: "not_started",
  readiness: "ready",
};
const polynomialEndBehaviorKnowledgeState = {
  nodeId: "math.precalc.skill.1.4.determine-end-behavior-from-leading-term",
  title: "Determine polynomial end behavior from the leading term",
  status: "not_started",
  readiness: "ready",
};
const realZerosAndMultiplicitiesKnowledgeState = {
  nodeId: "math.precalc.skill.1.5.find-real-zeros-and-multiplicities-from-factored-form",
  title: "Find real zeros and multiplicities from factored form",
  status: "not_started",
  readiness: "ready",
};
const leastPolynomialDegreeKnowledgeState = {
  nodeId: "math.precalc.skill.1.5.determine-least-polynomial-degree-from-zeros-and-conjugate-pairs",
  title: "Determine least polynomial degree from zeros and conjugate pairs",
  status: "not_started",
  readiness: "ready",
};
const polynomialInequalityKnowledgeState = {
  nodeId: "precalc:topic-1-5-polynomial-inequality",
  title: "Solve polynomial inequalities using sign charts",
  status: "practicing",
  readiness: "ready",
};
const topic16EquationEndBehaviorKnowledgeState = {
  nodeId: "math.precalc.skill.1.6.determine-polynomial-end-behavior-from-equations",
  title: "Determine polynomial end behavior from equations",
  status: "not_started",
  readiness: "ready",
};

describe("AP Precalculus student dashboard practice sequence", () => {
  beforeEach(() => {
    mocks.approvedTopic11Pilot = [
      { stableActivityId: "worked", mode: "worked_example", props: {} },
      { stableActivityId: "guided", mode: "guided_practice", props: {} },
      { stableActivityId: "independent", mode: "independent_practice", props: {} },
    ];
    mocks.requireStudentSessionClaims.mockReset();
    mocks.requireStudentSessionClaims.mockResolvedValue({
      sub: "profiles:dashboard-student",
      role: "student",
    });
    mocks.fetchInternalQuery.mockReset();
    mocks.fetchInternalQuery
      .mockResolvedValueOnce(knowledgeState)
      .mockResolvedValueOnce(physicalKnowledgeState)
      .mockResolvedValueOnce(orderingKnowledgeState)
      .mockResolvedValueOnce(pointwiseKnowledgeState)
      .mockResolvedValueOnce(graphKnowledgeState)
      .mockResolvedValueOnce(negativeRateContextKnowledgeState)
      .mockResolvedValueOnce(quadraticNegativeRateIntervalKnowledgeState)
      .mockResolvedValueOnce(topic12KnowledgeState)
      .mockResolvedValueOnce(ratePatternClassificationKnowledgeState)
      .mockResolvedValueOnce(concavityKnowledgeState)
      .mockResolvedValueOnce(polynomialDegreeLeadingCoefficientKnowledgeState)
      .mockResolvedValueOnce(polynomialExtremaKnowledgeState)
      .mockResolvedValueOnce(rateSignAndTrendKnowledgeState)
      .mockResolvedValueOnce(polynomialEndBehaviorKnowledgeState)
      .mockResolvedValueOnce(realZerosAndMultiplicitiesKnowledgeState)
      .mockResolvedValueOnce(leastPolynomialDegreeKnowledgeState)
      .mockResolvedValueOnce(polynomialInequalityKnowledgeState)
      .mockResolvedValueOnce(topic16EquationEndBehaviorKnowledgeState);
    mocks.masteryAdvantage.mockClear();
    mocks.physicalWorked.mockClear();
    mocks.physicalPractice.mockClear();
    mocks.orderingWorked.mockClear();
    mocks.orderingPractice.mockClear();
    mocks.pointwiseWorked.mockClear();
    mocks.pointwisePractice.mockClear();
    mocks.graphWorked.mockClear();
    mocks.graphPractice.mockClear();
    mocks.negativeRateContextWorked.mockClear();
    mocks.negativeRateContextPractice.mockClear();
    mocks.quadraticNegativeRateIntervalWorked.mockClear();
    mocks.quadraticNegativeRateIntervalPractice.mockClear();
    mocks.topic12Worked.mockClear();
    mocks.topic12Practice.mockClear();
    mocks.topic13Worked.mockClear();
    mocks.topic13Practice.mockClear();
    mocks.concavityWorked.mockClear();
    mocks.concavityPractice.mockClear();
    mocks.polynomialDegreeLeadingCoefficientWorked.mockClear();
    mocks.polynomialDegreeLeadingCoefficientPractice.mockClear();
    mocks.polynomialExtremaWorked.mockClear();
    mocks.polynomialExtremaPractice.mockClear();
    mocks.rateSignAndTrendWorked.mockClear();
    mocks.rateSignAndTrendPractice.mockClear();
    mocks.polynomialEndBehaviorWorked.mockClear();
    mocks.polynomialEndBehaviorPractice.mockClear();
    mocks.realZerosAndMultiplicitiesWorked.mockClear();
    mocks.realZerosAndMultiplicitiesPractice.mockClear();
    mocks.leastPolynomialDegreeWorked.mockClear();
    mocks.leastPolynomialDegreePractice.mockClear();
    mocks.polynomialInequalityWorked.mockClear();
    mocks.polynomialInequalityPractice.mockClear();
    mocks.topic16Worked.mockClear();
    mocks.topic16Practice.mockClear();
  });

  it("does not show Topic 1.1 pilot activities when the publication query returns no rows", async () => {
    mocks.approvedTopic11Pilot = [];
    render(await StudentDashboard());

    expect(screen.queryByTestId("worked-example")).toBeNull();
    expect(screen.queryByTestId("mastery-guided_practice")).toBeNull();
    expect(screen.queryByTestId("mastery-independent_practice")).toBeNull();
  });

  it("authenticates first, queries all states at one request time, and renders all source sequences", async () => {
    render(await StudentDashboard());

    expect(
      screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent),
    ).toEqual([
      "Assigned lessons",
      "Due reviews",
      "Worked Example: Select a Physical-Context Graph",
      "Guided Practice: Select a Physical-Context Graph",
      "Independent Practice: Select a Physical-Context Graph",
      "Worked Example: Find Increasing Intervals",
      "Guided Practice: Classify Graph Intervals",
      "Independent Practice: Classify Graph Intervals",
      "Worked Example: Order Pointwise Rates",
      "Guided Practice: Order Pointwise Rates",
      "Independent Practice: Order Pointwise Rates",
      "Worked Example: Find the Least Pointwise Rate",
      "Guided Practice: Find the Least Pointwise Rate",
      "Independent Practice: Find the Least Pointwise Rate",
      "Worked Example: Compare Average Rates of Change (Graph)",
      "Guided Practice: Compare Average Rates of Change (Graph)",
      "Independent Practice: Compare Average Rates of Change (Graph)",
      "Worked Example: Model a Negative Rate Context",
      "Guided Practice: Model a Negative Rate Context",
      "Independent Practice: Model a Negative Rate Context",
      "Worked Example: Identify Negative-Rate Intervals",
      "Guided Practice: Identify Negative-Rate Intervals",
      "Independent Practice: Identify Negative-Rate Intervals",
      "Worked Example: Compare Average Rates of Change",
      "Guided Practice: Compare Average Rates of Change",
      "Independent Practice: Compare Average Rates of Change",
      "Worked Example: Classify Rate Patterns",
      "Guided Practice: Classify Rate Patterns",
      "Independent Practice: Classify Rate Patterns",
      "Worked Example: Determine Concavity",
      "Guided Practice: Determine Concavity",
      "Independent Practice: Determine Concavity",
      "Worked Example: Degree and Leading Coefficient",
      "Guided Practice: Degree and Leading Coefficient",
      "Independent Practice: Degree and Leading Coefficient",
      "Worked Example: Identify Extrema from a Graph",
      "Guided Practice: Identify Extrema from a Graph",
      "Independent Practice: Identify Extrema from a Graph",
      "Worked Example: Rate Sign and Trend",
      "Guided Practice: Rate Sign and Trend",
      "Independent Practice: Rate Sign and Trend",
      "Worked Example: Polynomial End Behavior",
      "Guided Practice: Polynomial End Behavior",
      "Independent Practice: Polynomial End Behavior",
      "Worked Example: Real Zeros and Multiplicities",
      "Guided Practice: Real Zeros and Multiplicities",
      "Independent Practice: Real Zeros and Multiplicities",
      "Worked Example: Least Polynomial Degree",
      "Guided Practice: Least Polynomial Degree",
      "Independent Practice: Least Polynomial Degree",
      "Worked Example: Polynomial Inequality Sign Chart",
      "Guided Practice: Polynomial Inequality Sign Chart",
      "Independent Practice: Polynomial Inequality Sign Chart",
      "Worked Example: Polynomial Equation End Behavior",
      "Guided Practice: Polynomial Equation End Behavior",
      "Independent Practice: Polynomial Equation End Behavior",
    ]);
    expect(
      screen.getByText(
        "Review the Topic 1.1 through Topic 1.6 source examples. Complete Guided Practice. Then finish Independent Practice.",
      ),
    ).toBeInTheDocument();
    expect(mocks.requireStudentSessionClaims).toHaveBeenCalledOnce();
    expect(mocks.fetchInternalQuery).toHaveBeenCalledTimes(18);
    expect(mocks.requireStudentSessionClaims.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.fetchInternalQuery.mock.invocationCallOrder[0],
    );
    const queryCalls = mocks.fetchInternalQuery.mock.calls;
    expect(queryCalls[0]).toEqual([
      "learningEvidence:getPrecalculusPilotKnowledgeState",
      { learnerId: "profiles:dashboard-student", now: expect.any(Number) },
    ]);
    expect(queryCalls[1]).toEqual([
      "learningEvidence:getPrecalculusPhysicalContextKnowledgeState",
      { learnerId: "profiles:dashboard-student", now: queryCalls[0]?.[1].now },
    ]);
    expect(queryCalls[2]).toEqual([
      "learningEvidence:getPrecalculusTopic12PointwiseRateOrderingKnowledgeState",
      { learnerId: "profiles:dashboard-student", now: queryCalls[0]?.[1].now },
    ]);
    expect(queryCalls[3]).toEqual([
      "learningEvidence:getPrecalculusTopic12PointwiseLeastRateKnowledgeState",
      { learnerId: "profiles:dashboard-student", now: queryCalls[0]?.[1].now },
    ]);
    expect(queryCalls[4]).toEqual([
      "learningEvidence:getPrecalculusTopic12GraphAverageRateKnowledgeState",
      { learnerId: "profiles:dashboard-student", now: queryCalls[0]?.[1].now },
    ]);
    expect(queryCalls[5]).toEqual([
      "learningEvidence:getPrecalculusTopic12NegativeRateContextKnowledgeState",
      { learnerId: "profiles:dashboard-student", now: queryCalls[0]?.[1].now },
    ]);
    expect(queryCalls[6]).toEqual([
      "learningEvidence:getPrecalculusTopic12QuadraticNegativeRateIntervalKnowledgeState",
      { learnerId: "profiles:dashboard-student", now: queryCalls[0]?.[1].now },
    ]);
    expect(queryCalls[7]).toEqual([
      "learningEvidence:getPrecalculusTopic12KnowledgeState",
      { learnerId: "profiles:dashboard-student", now: queryCalls[0]?.[1].now },
    ]);
    expect(queryCalls[8]).toEqual([
      "learningEvidence:getPrecalculusTopic13RatePatternClassificationKnowledgeState",
      { learnerId: "profiles:dashboard-student", now: queryCalls[0]?.[1].now },
    ]);
    expect(queryCalls[9]).toEqual([
      "learningEvidence:getPrecalculusTopic13ConcavityKnowledgeState",
      { learnerId: "profiles:dashboard-student", now: queryCalls[0]?.[1].now },
    ]);
    expect(queryCalls[10]).toEqual([
      "learningEvidence:getTopic14PolynomialDegreeLeadingCoefficientKnowledgeState",
      { learnerId: "profiles:dashboard-student", now: queryCalls[0]?.[1].now },
    ]);
    expect(queryCalls[11]).toEqual([
      "learningEvidence:getPrecalculusTopic14PolynomialExtremaKnowledgeState",
      { learnerId: "profiles:dashboard-student", now: queryCalls[0]?.[1].now },
    ]);
    expect(queryCalls[12]).toEqual([
      "learningEvidence:getPrecalculusTopic14RateSignAndTrendKnowledgeState",
      { learnerId: "profiles:dashboard-student", now: queryCalls[0]?.[1].now },
    ]);
    expect(queryCalls[13]).toEqual([
      "learningEvidence:getPrecalculusTopic14PolynomialEndBehaviorKnowledgeState",
      { learnerId: "profiles:dashboard-student", now: queryCalls[0]?.[1].now },
    ]);
    expect(queryCalls[14]).toEqual([
      "learningEvidence:getPrecalculusTopic15RealZerosAndMultiplicitiesKnowledgeState",
      { learnerId: "profiles:dashboard-student", now: queryCalls[0]?.[1].now },
    ]);
    expect(queryCalls[15]).toEqual([
      "learningEvidence:getPrecalculusTopic15LeastPolynomialDegreeKnowledgeState",
      { learnerId: "profiles:dashboard-student", now: queryCalls[0]?.[1].now },
    ]);
    expect(queryCalls[16]).toEqual([
      "learningEvidence:getPrecalculusTopic15PolynomialInequalityKnowledgeState",
      { learnerId: "profiles:dashboard-student", now: queryCalls[0]?.[1].now },
    ]);
    expect(queryCalls[17]).toEqual([
      "learningEvidence:getPrecalculusTopic16PolynomialEquationEndBehaviorKnowledgeState",
      { learnerId: "profiles:dashboard-student", now: queryCalls[0]?.[1].now },
    ]);
    expect(queryCalls.map((call) => call[0])).toEqual([
      "learningEvidence:getPrecalculusPilotKnowledgeState",
      "learningEvidence:getPrecalculusPhysicalContextKnowledgeState",
      "learningEvidence:getPrecalculusTopic12PointwiseRateOrderingKnowledgeState",
      "learningEvidence:getPrecalculusTopic12PointwiseLeastRateKnowledgeState",
      "learningEvidence:getPrecalculusTopic12GraphAverageRateKnowledgeState",
      "learningEvidence:getPrecalculusTopic12NegativeRateContextKnowledgeState",
      "learningEvidence:getPrecalculusTopic12QuadraticNegativeRateIntervalKnowledgeState",
      "learningEvidence:getPrecalculusTopic12KnowledgeState",
      "learningEvidence:getPrecalculusTopic13RatePatternClassificationKnowledgeState",
      "learningEvidence:getPrecalculusTopic13ConcavityKnowledgeState",
      "learningEvidence:getTopic14PolynomialDegreeLeadingCoefficientKnowledgeState",
      "learningEvidence:getPrecalculusTopic14PolynomialExtremaKnowledgeState",
      "learningEvidence:getPrecalculusTopic14RateSignAndTrendKnowledgeState",
      "learningEvidence:getPrecalculusTopic14PolynomialEndBehaviorKnowledgeState",
      "learningEvidence:getPrecalculusTopic15RealZerosAndMultiplicitiesKnowledgeState",
      "learningEvidence:getPrecalculusTopic15LeastPolynomialDegreeKnowledgeState",
      "learningEvidence:getPrecalculusTopic15PolynomialInequalityKnowledgeState",
      "learningEvidence:getPrecalculusTopic16PolynomialEquationEndBehaviorKnowledgeState",
    ]);
    for (const call of queryCalls) {
      expect(call[1]).toEqual({
        learnerId: "profiles:dashboard-student",
        now: queryCalls[0]?.[1].now,
      });
    }
    expect(Number.isFinite(queryCalls[0]?.[1].now)).toBe(true);
    expect(mocks.physicalWorked).toHaveBeenCalledOnce();
    expect(mocks.physicalWorked).toHaveBeenCalledWith({}, undefined);
    expect(mocks.physicalPractice).toHaveBeenCalledTimes(2);
    expect(mocks.physicalPractice).toHaveBeenNthCalledWith(
      1,
      {
        knowledgeState: physicalKnowledgeState,
        mode: "guided_practice",
      },
      undefined,
    );
    expect(mocks.physicalPractice).toHaveBeenNthCalledWith(
      2,
      {
        knowledgeState: physicalKnowledgeState,
        mode: "independent_practice",
      },
      undefined,
    );
    expect(mocks.masteryAdvantage).toHaveBeenCalledTimes(2);
    expect(mocks.masteryAdvantage).toHaveBeenNthCalledWith(
      1,
      {
        activityProps: {},
        knowledgeState,
        mode: "guided_practice",
        seed: 0,
        stableActivityId: "guided",
      },
      undefined,
    );
    expect(mocks.masteryAdvantage).toHaveBeenNthCalledWith(
      2,
      {
        activityProps: {},
        knowledgeState,
        mode: "independent_practice",
        seed: 2,
        stableActivityId: "independent",
      },
      undefined,
    );
    expect(screen.getByTestId("mastery-guided_practice")).toBeInTheDocument();
    expect(screen.getByTestId("mastery-independent_practice")).toBeInTheDocument();
    expect(screen.getByTestId("physical-guided_practice")).toBeInTheDocument();
    expect(screen.getByTestId("physical-independent_practice")).toBeInTheDocument();
    expect(mocks.pointwiseWorked).toHaveBeenCalledOnce();
    expect(mocks.pointwiseWorked).toHaveBeenCalledWith({}, undefined);
    expect(mocks.pointwisePractice).toHaveBeenCalledTimes(2);
    expect(mocks.pointwisePractice).toHaveBeenNthCalledWith(
      1,
      {
        knowledgeState: pointwiseKnowledgeState,
        mode: "guided_practice",
      },
      undefined,
    );
    expect(mocks.pointwisePractice).toHaveBeenNthCalledWith(
      2,
      {
        knowledgeState: pointwiseKnowledgeState,
        mode: "independent_practice",
      },
      undefined,
    );
    expect(mocks.pointwisePractice.mock.calls[0]?.[0].knowledgeState).toBe(pointwiseKnowledgeState);
    expect(mocks.pointwisePractice.mock.calls[1]?.[0].knowledgeState).toBe(pointwiseKnowledgeState);
    expect(screen.getByTestId("topic-1-2-pointwise-guided_practice")).toBeInTheDocument();
    expect(screen.getByTestId("topic-1-2-pointwise-independent_practice")).toBeInTheDocument();
    expect(mocks.orderingWorked).toHaveBeenCalledOnce();
    expect(mocks.orderingWorked).toHaveBeenCalledWith({}, undefined);
    expect(mocks.orderingPractice).toHaveBeenCalledTimes(2);
    expect(mocks.orderingPractice).toHaveBeenNthCalledWith(
      1,
      {
        knowledgeState: orderingKnowledgeState,
        mode: "guided_practice",
      },
      undefined,
    );
    expect(mocks.orderingPractice).toHaveBeenNthCalledWith(
      2,
      {
        knowledgeState: orderingKnowledgeState,
        mode: "independent_practice",
      },
      undefined,
    );
    expect(mocks.orderingPractice.mock.calls[0]?.[0].knowledgeState).toBe(orderingKnowledgeState);
    expect(mocks.orderingPractice.mock.calls[1]?.[0].knowledgeState).toBe(orderingKnowledgeState);
    expect(screen.getByTestId("topic-1-2-pointwise-ordering-guided_practice")).toBeInTheDocument();
    expect(
      screen.getByTestId("topic-1-2-pointwise-ordering-independent_practice"),
    ).toBeInTheDocument();
    expect(mocks.graphWorked).toHaveBeenCalledOnce();
    expect(mocks.graphWorked).toHaveBeenCalledWith({}, undefined);
    expect(mocks.graphPractice).toHaveBeenCalledTimes(2);
    expect(mocks.graphPractice).toHaveBeenNthCalledWith(
      1,
      {
        knowledgeState: graphKnowledgeState,
        mode: "guided_practice",
      },
      undefined,
    );
    expect(mocks.graphPractice).toHaveBeenNthCalledWith(
      2,
      {
        knowledgeState: graphKnowledgeState,
        mode: "independent_practice",
      },
      undefined,
    );
    expect(mocks.graphPractice.mock.calls[0]?.[0].knowledgeState).toBe(graphKnowledgeState);
    expect(mocks.graphPractice.mock.calls[1]?.[0].knowledgeState).toBe(graphKnowledgeState);
    expect(screen.getByTestId("topic-1-2-graph-guided_practice")).toBeInTheDocument();
    expect(screen.getByTestId("topic-1-2-graph-independent_practice")).toBeInTheDocument();
    expect(mocks.negativeRateContextWorked).toHaveBeenCalledOnce();
    expect(mocks.negativeRateContextWorked).toHaveBeenCalledWith({}, undefined);
    expect(mocks.negativeRateContextPractice).toHaveBeenCalledTimes(2);
    expect(mocks.negativeRateContextPractice).toHaveBeenNthCalledWith(
      1,
      {
        knowledgeState: negativeRateContextKnowledgeState,
        mode: "guided_practice",
      },
      undefined,
    );
    expect(mocks.negativeRateContextPractice).toHaveBeenNthCalledWith(
      2,
      {
        knowledgeState: negativeRateContextKnowledgeState,
        mode: "independent_practice",
      },
      undefined,
    );
    expect(mocks.negativeRateContextPractice.mock.calls[0]?.[0].knowledgeState).toBe(
      negativeRateContextKnowledgeState,
    );
    expect(mocks.negativeRateContextPractice.mock.calls[1]?.[0].knowledgeState).toBe(
      negativeRateContextKnowledgeState,
    );
    expect(
      screen.getByTestId("topic-1-2-negative-rate-context-guided_practice"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("topic-1-2-negative-rate-context-independent_practice"),
    ).toBeInTheDocument();
    expect(mocks.quadraticNegativeRateIntervalWorked).toHaveBeenCalledOnce();
    expect(mocks.quadraticNegativeRateIntervalWorked).toHaveBeenCalledWith({}, undefined);
    expect(mocks.quadraticNegativeRateIntervalPractice).toHaveBeenCalledTimes(2);
    expect(mocks.quadraticNegativeRateIntervalPractice).toHaveBeenNthCalledWith(
      1,
      {
        knowledgeState: quadraticNegativeRateIntervalKnowledgeState,
        mode: "guided_practice",
      },
      undefined,
    );
    expect(mocks.quadraticNegativeRateIntervalPractice).toHaveBeenNthCalledWith(
      2,
      {
        knowledgeState: quadraticNegativeRateIntervalKnowledgeState,
        mode: "independent_practice",
      },
      undefined,
    );
    expect(mocks.quadraticNegativeRateIntervalPractice.mock.calls[0]?.[0].knowledgeState).toBe(
      quadraticNegativeRateIntervalKnowledgeState,
    );
    expect(mocks.quadraticNegativeRateIntervalPractice.mock.calls[1]?.[0].knowledgeState).toBe(
      quadraticNegativeRateIntervalKnowledgeState,
    );
    expect(
      screen.getByTestId("topic-1-2-quadratic-negative-rate-interval-worked-example"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("topic-1-2-quadratic-negative-rate-interval-guided_practice"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("topic-1-2-quadratic-negative-rate-interval-independent_practice"),
    ).toBeInTheDocument();
    expect(mocks.topic12Worked).toHaveBeenCalledOnce();
    expect(mocks.topic12Worked).toHaveBeenCalledWith({}, undefined);
    expect(mocks.topic12Practice).toHaveBeenCalledTimes(2);
    expect(mocks.topic12Practice).toHaveBeenNthCalledWith(
      1,
      {
        knowledgeState: topic12KnowledgeState,
        mode: "guided_practice",
      },
      undefined,
    );
    expect(mocks.topic12Practice).toHaveBeenNthCalledWith(
      2,
      {
        knowledgeState: topic12KnowledgeState,
        mode: "independent_practice",
      },
      undefined,
    );
    expect(mocks.topic12Practice.mock.calls[0]?.[0].knowledgeState).toBe(topic12KnowledgeState);
    expect(mocks.topic12Practice.mock.calls[1]?.[0].knowledgeState).toBe(topic12KnowledgeState);
    expect(screen.getByTestId("topic-1-2-guided_practice")).toBeInTheDocument();
    expect(screen.getByTestId("topic-1-2-independent_practice")).toBeInTheDocument();
    expect(mocks.topic13Worked).toHaveBeenCalledOnce();
    expect(mocks.topic13Worked).toHaveBeenCalledWith({}, undefined);
    expect(mocks.topic13Practice).toHaveBeenCalledTimes(2);
    expect(mocks.topic13Practice).toHaveBeenNthCalledWith(
      1,
      {
        knowledgeState: ratePatternClassificationKnowledgeState,
        mode: "guided_practice",
      },
      undefined,
    );
    expect(mocks.topic13Practice).toHaveBeenNthCalledWith(
      2,
      {
        knowledgeState: ratePatternClassificationKnowledgeState,
        mode: "independent_practice",
      },
      undefined,
    );
    expect(mocks.topic13Practice.mock.calls[0]?.[0].knowledgeState).toBe(
      ratePatternClassificationKnowledgeState,
    );
    expect(mocks.topic13Practice.mock.calls[1]?.[0].knowledgeState).toBe(
      ratePatternClassificationKnowledgeState,
    );
    expect(
      screen.getByTestId("topic-1-3-rate-pattern-classification-worked-example"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("topic-1-3-rate-pattern-classification-guided_practice"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("topic-1-3-rate-pattern-classification-independent_practice"),
    ).toBeInTheDocument();
    expect(mocks.concavityWorked).toHaveBeenCalledOnce();
    expect(mocks.concavityWorked).toHaveBeenCalledWith({}, undefined);
    expect(mocks.concavityPractice).toHaveBeenCalledTimes(2);
    expect(mocks.concavityPractice).toHaveBeenNthCalledWith(
      1,
      {
        knowledgeState: concavityKnowledgeState,
        mode: "guided_practice",
      },
      undefined,
    );
    expect(mocks.concavityPractice).toHaveBeenNthCalledWith(
      2,
      {
        knowledgeState: concavityKnowledgeState,
        mode: "independent_practice",
      },
      undefined,
    );
    expect(mocks.concavityPractice.mock.calls[0]?.[0].knowledgeState).toBe(concavityKnowledgeState);
    expect(mocks.concavityPractice.mock.calls[1]?.[0].knowledgeState).toBe(concavityKnowledgeState);
    expect(screen.getByTestId("topic-1-3-concavity-worked-example")).toBeInTheDocument();
    expect(screen.getByTestId("topic-1-3-concavity-guided_practice")).toBeInTheDocument();
    expect(screen.getByTestId("topic-1-3-concavity-independent_practice")).toBeInTheDocument();
    expect(mocks.polynomialDegreeLeadingCoefficientWorked).toHaveBeenCalledOnce();
    expect(mocks.polynomialDegreeLeadingCoefficientWorked).toHaveBeenCalledWith({}, undefined);
    expect(mocks.polynomialDegreeLeadingCoefficientPractice).toHaveBeenCalledTimes(2);
    expect(mocks.polynomialDegreeLeadingCoefficientPractice).toHaveBeenNthCalledWith(
      1,
      {
        knowledgeState: polynomialDegreeLeadingCoefficientKnowledgeState,
        mode: "guided_practice",
      },
      undefined,
    );
    expect(mocks.polynomialDegreeLeadingCoefficientPractice).toHaveBeenNthCalledWith(
      2,
      {
        knowledgeState: polynomialDegreeLeadingCoefficientKnowledgeState,
        mode: "independent_practice",
      },
      undefined,
    );
    expect(mocks.polynomialDegreeLeadingCoefficientPractice.mock.calls[0]?.[0].knowledgeState).toBe(
      polynomialDegreeLeadingCoefficientKnowledgeState,
    );
    expect(mocks.polynomialDegreeLeadingCoefficientPractice.mock.calls[1]?.[0].knowledgeState).toBe(
      polynomialDegreeLeadingCoefficientKnowledgeState,
    );
    expect(
      screen.getByTestId("topic-1-4-polynomial-degree-leading-coefficient-worked-example"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("topic-1-4-polynomial-degree-leading-coefficient-guided_practice"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("topic-1-4-polynomial-degree-leading-coefficient-independent_practice"),
    ).toBeInTheDocument();
    expect(mocks.polynomialExtremaWorked).toHaveBeenCalledOnce();
    expect(mocks.polynomialExtremaWorked).toHaveBeenCalledWith({}, undefined);
    expect(mocks.polynomialExtremaPractice).toHaveBeenCalledTimes(2);
    expect(mocks.polynomialExtremaPractice).toHaveBeenNthCalledWith(
      1,
      {
        knowledgeState: polynomialExtremaKnowledgeState,
        mode: "guided_practice",
      },
      undefined,
    );
    expect(mocks.polynomialExtremaPractice).toHaveBeenNthCalledWith(
      2,
      {
        knowledgeState: polynomialExtremaKnowledgeState,
        mode: "independent_practice",
      },
      undefined,
    );
    expect(mocks.polynomialExtremaPractice.mock.calls[0]?.[0].knowledgeState).toBe(
      polynomialExtremaKnowledgeState,
    );
    expect(mocks.polynomialExtremaPractice.mock.calls[1]?.[0].knowledgeState).toBe(
      polynomialExtremaKnowledgeState,
    );
    expect(screen.getByTestId("topic-1-4-polynomial-extrema-worked-example")).toBeInTheDocument();
    expect(screen.getByTestId("topic-1-4-polynomial-extrema-guided_practice")).toBeInTheDocument();
    expect(
      screen.getByTestId("topic-1-4-polynomial-extrema-independent_practice"),
    ).toBeInTheDocument();
    expect(mocks.rateSignAndTrendWorked).toHaveBeenCalledOnce();
    expect(mocks.rateSignAndTrendWorked).toHaveBeenCalledWith({}, undefined);
    expect(mocks.rateSignAndTrendPractice).toHaveBeenCalledTimes(2);
    expect(mocks.rateSignAndTrendPractice).toHaveBeenNthCalledWith(
      1,
      {
        knowledgeState: rateSignAndTrendKnowledgeState,
        mode: "guided_practice",
      },
      undefined,
    );
    expect(mocks.rateSignAndTrendPractice).toHaveBeenNthCalledWith(
      2,
      {
        knowledgeState: rateSignAndTrendKnowledgeState,
        mode: "independent_practice",
      },
      undefined,
    );
    expect(mocks.rateSignAndTrendPractice.mock.calls[0]?.[0].knowledgeState).toBe(
      rateSignAndTrendKnowledgeState,
    );
    expect(mocks.rateSignAndTrendPractice.mock.calls[1]?.[0].knowledgeState).toBe(
      rateSignAndTrendKnowledgeState,
    );
    expect(screen.getByTestId("topic-1-4-rate-sign-and-trend-worked-example")).toBeInTheDocument();
    expect(screen.getByTestId("topic-1-4-rate-sign-and-trend-guided_practice")).toBeInTheDocument();
    expect(
      screen.getByTestId("topic-1-4-rate-sign-and-trend-independent_practice"),
    ).toBeInTheDocument();
    expect(mocks.polynomialEndBehaviorWorked).toHaveBeenCalledOnce();
    expect(mocks.polynomialEndBehaviorWorked).toHaveBeenCalledWith({}, undefined);
    expect(mocks.polynomialEndBehaviorPractice).toHaveBeenCalledTimes(2);
    expect(mocks.polynomialEndBehaviorPractice).toHaveBeenNthCalledWith(
      1,
      {
        knowledgeState: polynomialEndBehaviorKnowledgeState,
        mode: "guided_practice",
      },
      undefined,
    );
    expect(mocks.polynomialEndBehaviorPractice).toHaveBeenNthCalledWith(
      2,
      {
        knowledgeState: polynomialEndBehaviorKnowledgeState,
        mode: "independent_practice",
      },
      undefined,
    );
    expect(mocks.polynomialEndBehaviorPractice.mock.calls[0]?.[0].knowledgeState).toBe(
      polynomialEndBehaviorKnowledgeState,
    );
    expect(mocks.polynomialEndBehaviorPractice.mock.calls[1]?.[0].knowledgeState).toBe(
      polynomialEndBehaviorKnowledgeState,
    );
    expect(
      screen.getByTestId("topic-1-4-polynomial-end-behavior-worked-example"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("topic-1-4-polynomial-end-behavior-guided_practice"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("topic-1-4-polynomial-end-behavior-independent_practice"),
    ).toBeInTheDocument();
    expect(mocks.realZerosAndMultiplicitiesWorked).toHaveBeenCalledOnce();
    expect(mocks.realZerosAndMultiplicitiesWorked).toHaveBeenCalledWith({}, undefined);
    expect(mocks.realZerosAndMultiplicitiesPractice).toHaveBeenCalledTimes(2);
    expect(mocks.realZerosAndMultiplicitiesPractice).toHaveBeenNthCalledWith(
      1,
      {
        knowledgeState: realZerosAndMultiplicitiesKnowledgeState,
        mode: "guided_practice",
      },
      undefined,
    );
    expect(mocks.realZerosAndMultiplicitiesPractice).toHaveBeenNthCalledWith(
      2,
      {
        knowledgeState: realZerosAndMultiplicitiesKnowledgeState,
        mode: "independent_practice",
      },
      undefined,
    );
    expect(
      screen.getByTestId("topic-1-5-real-zeros-and-multiplicities-worked-example"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("topic-1-5-real-zeros-and-multiplicities-guided_practice"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("topic-1-5-real-zeros-and-multiplicities-independent_practice"),
    ).toBeInTheDocument();
    expect(mocks.realZerosAndMultiplicitiesPractice.mock.calls[0]?.[0].knowledgeState).toBe(
      realZerosAndMultiplicitiesKnowledgeState,
    );
    expect(mocks.realZerosAndMultiplicitiesPractice.mock.calls[1]?.[0].knowledgeState).toBe(
      realZerosAndMultiplicitiesKnowledgeState,
    );
    expect(mocks.leastPolynomialDegreeWorked).toHaveBeenCalledOnce();
    expect(mocks.leastPolynomialDegreeWorked).toHaveBeenCalledWith({}, undefined);
    expect(mocks.leastPolynomialDegreePractice).toHaveBeenCalledTimes(2);
    expect(mocks.leastPolynomialDegreePractice).toHaveBeenNthCalledWith(
      1,
      {
        knowledgeState: leastPolynomialDegreeKnowledgeState,
        mode: "guided_practice",
      },
      undefined,
    );
    expect(mocks.leastPolynomialDegreePractice).toHaveBeenNthCalledWith(
      2,
      {
        knowledgeState: leastPolynomialDegreeKnowledgeState,
        mode: "independent_practice",
      },
      undefined,
    );
    expect(mocks.leastPolynomialDegreePractice.mock.calls[0]?.[0].knowledgeState).toBe(
      leastPolynomialDegreeKnowledgeState,
    );
    expect(mocks.leastPolynomialDegreePractice.mock.calls[1]?.[0].knowledgeState).toBe(
      leastPolynomialDegreeKnowledgeState,
    );
    expect(
      screen.getByTestId("topic-1-5-least-polynomial-degree-worked-example"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("topic-1-5-least-polynomial-degree-guided_practice"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("topic-1-5-least-polynomial-degree-independent_practice"),
    ).toBeInTheDocument();
    expect(mocks.polynomialInequalityWorked).toHaveBeenCalledOnce();
    expect(mocks.polynomialInequalityWorked).toHaveBeenCalledWith({}, undefined);
    expect(mocks.polynomialInequalityPractice).toHaveBeenCalledTimes(2);
    expect(mocks.polynomialInequalityPractice).toHaveBeenNthCalledWith(
      1,
      {
        knowledgeState: polynomialInequalityKnowledgeState,
        mode: "guided_practice",
      },
      undefined,
    );
    expect(mocks.polynomialInequalityPractice).toHaveBeenNthCalledWith(
      2,
      {
        knowledgeState: polynomialInequalityKnowledgeState,
        mode: "independent_practice",
      },
      undefined,
    );
    expect(mocks.polynomialInequalityPractice.mock.calls[0]?.[0].knowledgeState).toBe(
      polynomialInequalityKnowledgeState,
    );
    expect(mocks.polynomialInequalityPractice.mock.calls[1]?.[0].knowledgeState).toBe(
      polynomialInequalityKnowledgeState,
    );
    expect(
      screen.getByTestId("topic-1-5-polynomial-inequality-worked-example"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("topic-1-5-polynomial-inequality-guided_practice"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("topic-1-5-polynomial-inequality-independent_practice"),
    ).toBeInTheDocument();
    expect(mocks.topic16Worked).toHaveBeenCalledOnce();
    expect(mocks.topic16Worked).toHaveBeenCalledWith({}, undefined);
    expect(mocks.topic16Practice).toHaveBeenCalledTimes(2);
    expect(mocks.topic16Practice).toHaveBeenNthCalledWith(
      1,
      {
        knowledgeState: topic16EquationEndBehaviorKnowledgeState,
        mode: "guided_practice",
      },
      undefined,
    );
    expect(mocks.topic16Practice).toHaveBeenNthCalledWith(
      2,
      {
        knowledgeState: topic16EquationEndBehaviorKnowledgeState,
        mode: "independent_practice",
      },
      undefined,
    );
    expect(mocks.topic16Practice.mock.calls[0]?.[0].knowledgeState).toBe(
      topic16EquationEndBehaviorKnowledgeState,
    );
    expect(mocks.topic16Practice.mock.calls[1]?.[0].knowledgeState).toBe(
      topic16EquationEndBehaviorKnowledgeState,
    );
    expect(
      screen.getByTestId("topic-1-6-equation-end-behavior-worked-example"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("topic-1-6-equation-end-behavior-guided_practice"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("topic-1-6-equation-end-behavior-independent_practice"),
    ).toBeInTheDocument();
  });

  it("renders the rate-sign and end-behavior sequences when the end-behavior query is absent", async () => {
    mocks.fetchInternalQuery.mockReset();
    mocks.fetchInternalQuery
      .mockResolvedValueOnce(knowledgeState)
      .mockResolvedValueOnce(physicalKnowledgeState)
      .mockResolvedValueOnce(orderingKnowledgeState)
      .mockResolvedValueOnce(pointwiseKnowledgeState)
      .mockResolvedValueOnce(graphKnowledgeState)
      .mockResolvedValueOnce(negativeRateContextKnowledgeState)
      .mockResolvedValueOnce(quadraticNegativeRateIntervalKnowledgeState)
      .mockResolvedValueOnce(topic12KnowledgeState)
      .mockResolvedValueOnce(ratePatternClassificationKnowledgeState)
      .mockResolvedValueOnce(concavityKnowledgeState)
      .mockResolvedValueOnce(polynomialDegreeLeadingCoefficientKnowledgeState)
      .mockResolvedValueOnce(polynomialExtremaKnowledgeState)
      .mockResolvedValueOnce(rateSignAndTrendKnowledgeState)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(realZerosAndMultiplicitiesKnowledgeState)
      .mockResolvedValueOnce(leastPolynomialDegreeKnowledgeState)
      .mockResolvedValueOnce(polynomialInequalityKnowledgeState)
      .mockResolvedValueOnce(topic16EquationEndBehaviorKnowledgeState);

    render(await StudentDashboard());

    expect(mocks.polynomialExtremaWorked).toHaveBeenCalledOnce();
    expect(mocks.polynomialExtremaPractice).toHaveBeenNthCalledWith(
      1,
      {
        knowledgeState: polynomialExtremaKnowledgeState,
        mode: "guided_practice",
      },
      undefined,
    );
    expect(mocks.polynomialExtremaPractice).toHaveBeenNthCalledWith(
      2,
      {
        knowledgeState: polynomialExtremaKnowledgeState,
        mode: "independent_practice",
      },
      undefined,
    );
    expect(screen.getByTestId("topic-1-4-polynomial-extrema-worked-example")).toBeInTheDocument();
    expect(screen.getByTestId("topic-1-4-polynomial-extrema-guided_practice")).toBeInTheDocument();
    expect(
      screen.getByTestId("topic-1-4-polynomial-extrema-independent_practice"),
    ).toBeInTheDocument();
    expect(mocks.rateSignAndTrendWorked).toHaveBeenCalledOnce();
    expect(mocks.rateSignAndTrendPractice).toHaveBeenNthCalledWith(
      1,
      {
        knowledgeState: rateSignAndTrendKnowledgeState,
        mode: "guided_practice",
      },
      undefined,
    );
    expect(mocks.rateSignAndTrendPractice).toHaveBeenNthCalledWith(
      2,
      {
        knowledgeState: rateSignAndTrendKnowledgeState,
        mode: "independent_practice",
      },
      undefined,
    );
    expect(screen.getByTestId("topic-1-4-rate-sign-and-trend-worked-example")).toBeInTheDocument();
    expect(screen.getByTestId("topic-1-4-rate-sign-and-trend-guided_practice")).toBeInTheDocument();
    expect(
      screen.getByTestId("topic-1-4-rate-sign-and-trend-independent_practice"),
    ).toBeInTheDocument();
    expect(mocks.fetchInternalQuery).toHaveBeenCalledTimes(18);
    expect(mocks.fetchInternalQuery.mock.calls[13]).toEqual([
      "learningEvidence:getPrecalculusTopic14PolynomialEndBehaviorKnowledgeState",
      {
        learnerId: "profiles:dashboard-student",
        now: mocks.fetchInternalQuery.mock.calls[0]?.[1].now,
      },
    ]);
    expect(mocks.fetchInternalQuery.mock.calls[14]).toEqual([
      "learningEvidence:getPrecalculusTopic15RealZerosAndMultiplicitiesKnowledgeState",
      {
        learnerId: "profiles:dashboard-student",
        now: mocks.fetchInternalQuery.mock.calls[0]?.[1].now,
      },
    ]);
    expect(mocks.fetchInternalQuery.mock.calls[15]).toEqual([
      "learningEvidence:getPrecalculusTopic15LeastPolynomialDegreeKnowledgeState",
      {
        learnerId: "profiles:dashboard-student",
        now: mocks.fetchInternalQuery.mock.calls[0]?.[1].now,
      },
    ]);
    expect(mocks.fetchInternalQuery.mock.calls[16]).toEqual([
      "learningEvidence:getPrecalculusTopic15PolynomialInequalityKnowledgeState",
      {
        learnerId: "profiles:dashboard-student",
        now: mocks.fetchInternalQuery.mock.calls[0]?.[1].now,
      },
    ]);
    expect(mocks.fetchInternalQuery.mock.calls[17]).toEqual([
      "learningEvidence:getPrecalculusTopic16PolynomialEquationEndBehaviorKnowledgeState",
      {
        learnerId: "profiles:dashboard-student",
        now: mocks.fetchInternalQuery.mock.calls[0]?.[1].now,
      },
    ]);
    expect(mocks.polynomialEndBehaviorWorked).toHaveBeenCalledOnce();
    expect(mocks.polynomialEndBehaviorWorked).toHaveBeenCalledWith({}, undefined);
    expect(mocks.polynomialEndBehaviorPractice).toHaveBeenNthCalledWith(
      1,
      {
        knowledgeState: undefined,
        mode: "guided_practice",
      },
      undefined,
    );
    expect(mocks.polynomialEndBehaviorPractice).toHaveBeenNthCalledWith(
      2,
      {
        knowledgeState: undefined,
        mode: "independent_practice",
      },
      undefined,
    );
    expect(mocks.polynomialEndBehaviorPractice.mock.calls[0]?.[0].knowledgeState).toBeUndefined();
    expect(mocks.polynomialEndBehaviorPractice.mock.calls[1]?.[0].knowledgeState).toBeUndefined();
    expect(
      screen.getByTestId("topic-1-4-polynomial-end-behavior-worked-example"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("topic-1-4-polynomial-end-behavior-guided_practice"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("topic-1-4-polynomial-end-behavior-independent_practice"),
    ).toBeInTheDocument();
    expect(mocks.realZerosAndMultiplicitiesWorked).toHaveBeenCalledOnce();
    expect(mocks.realZerosAndMultiplicitiesWorked).toHaveBeenCalledWith({}, undefined);
    expect(mocks.realZerosAndMultiplicitiesPractice).toHaveBeenCalledTimes(2);
    expect(mocks.realZerosAndMultiplicitiesPractice).toHaveBeenNthCalledWith(
      1,
      {
        knowledgeState: realZerosAndMultiplicitiesKnowledgeState,
        mode: "guided_practice",
      },
      undefined,
    );
    expect(mocks.realZerosAndMultiplicitiesPractice).toHaveBeenNthCalledWith(
      2,
      {
        knowledgeState: realZerosAndMultiplicitiesKnowledgeState,
        mode: "independent_practice",
      },
      undefined,
    );
    expect(mocks.realZerosAndMultiplicitiesPractice.mock.calls[0]?.[0].knowledgeState).toBe(
      realZerosAndMultiplicitiesKnowledgeState,
    );
    expect(mocks.realZerosAndMultiplicitiesPractice.mock.calls[1]?.[0].knowledgeState).toBe(
      realZerosAndMultiplicitiesKnowledgeState,
    );
    expect(
      screen.getByTestId("topic-1-5-real-zeros-and-multiplicities-worked-example"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("topic-1-5-real-zeros-and-multiplicities-guided_practice"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("topic-1-5-real-zeros-and-multiplicities-independent_practice"),
    ).toBeInTheDocument();
    expect(mocks.leastPolynomialDegreeWorked).toHaveBeenCalledOnce();
    expect(mocks.leastPolynomialDegreeWorked).toHaveBeenCalledWith({}, undefined);
    expect(mocks.leastPolynomialDegreePractice).toHaveBeenCalledTimes(2);
    expect(mocks.leastPolynomialDegreePractice).toHaveBeenNthCalledWith(
      1,
      {
        knowledgeState: leastPolynomialDegreeKnowledgeState,
        mode: "guided_practice",
      },
      undefined,
    );
    expect(mocks.leastPolynomialDegreePractice).toHaveBeenNthCalledWith(
      2,
      {
        knowledgeState: leastPolynomialDegreeKnowledgeState,
        mode: "independent_practice",
      },
      undefined,
    );
  });
});
