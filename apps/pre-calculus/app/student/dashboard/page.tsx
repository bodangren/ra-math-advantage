import Link from 'next/link';

import { PrecalculusPhysicalContextPracticePilot } from "@/components/student/PrecalculusPhysicalContextPracticePilot";
import { PrecalculusPhysicalContextWorkedPilot } from "@/components/student/PrecalculusPhysicalContextWorkedPilot";
import { PrecalculusTopic11DailyCurriculumPilot } from "@/components/student/PrecalculusTopic11DailyCurriculumPilot";
import { PrecalculusTopic12PointwisePracticePilot } from "@/components/student/PrecalculusTopic12PointwisePracticePilot";
import { PrecalculusTopic12PointwiseWorkedPilot } from "@/components/student/PrecalculusTopic12PointwiseWorkedPilot";
import { PrecalculusTopic12PointwiseOrderingPracticePilot } from "@/components/student/PrecalculusTopic12PointwiseOrderingPracticePilot";
import { PrecalculusTopic12PointwiseOrderingWorkedPilot } from "@/components/student/PrecalculusTopic12PointwiseOrderingWorkedPilot";
import { PrecalculusTopic12GraphPracticePilot } from "@/components/student/PrecalculusTopic12GraphPracticePilot";
import { PrecalculusTopic12GraphWorkedPilot } from "@/components/student/PrecalculusTopic12GraphWorkedPilot";
import { PrecalculusTopic12NegativeRateContextPracticePilot } from "@/components/student/PrecalculusTopic12NegativeRateContextPracticePilot";
import { PrecalculusTopic12NegativeRateContextWorkedPilot } from "@/components/student/PrecalculusTopic12NegativeRateContextWorkedPilot";
import { PrecalculusTopic12QuadraticNegativeRateIntervalPracticePilot } from "@/components/student/PrecalculusTopic12QuadraticNegativeRateIntervalPracticePilot";
import { PrecalculusTopic12QuadraticNegativeRateIntervalWorkedPilot } from "@/components/student/PrecalculusTopic12QuadraticNegativeRateIntervalWorkedPilot";
import { PrecalculusTopic13RatePatternClassificationPracticePilot } from "@/components/student/PrecalculusTopic13RatePatternClassificationPracticePilot";
import { PrecalculusTopic13RatePatternClassificationWorkedPilot } from "@/components/student/PrecalculusTopic13RatePatternClassificationWorkedPilot";
import { PrecalculusTopic13ConcavityPracticePilot } from "@/components/student/PrecalculusTopic13ConcavityPracticePilot";
import { PrecalculusTopic13ConcavityWorkedPilot } from "@/components/student/PrecalculusTopic13ConcavityWorkedPilot";
import { PrecalculusTopic14PolynomialDegreeLeadingCoefficientPracticePilot } from "@/components/student/PrecalculusTopic14PolynomialDegreeLeadingCoefficientPracticePilot";
import { PrecalculusTopic14PolynomialDegreeLeadingCoefficientWorkedPilot } from "@/components/student/PrecalculusTopic14PolynomialDegreeLeadingCoefficientWorkedPilot";
import { PrecalculusTopic14PolynomialExtremaPracticePilot } from "@/components/student/PrecalculusTopic14PolynomialExtremaPracticePilot";
import { PrecalculusTopic14PolynomialExtremaWorkedPilot } from "@/components/student/PrecalculusTopic14PolynomialExtremaWorkedPilot";
import { PrecalculusTopic14RateSignAndTrendPracticePilot } from "@/components/student/PrecalculusTopic14RateSignAndTrendPracticePilot";
import { PrecalculusTopic14RateSignAndTrendWorkedPilot } from "@/components/student/PrecalculusTopic14RateSignAndTrendWorkedPilot";
import { PrecalculusTopic14PolynomialEndBehaviorPracticePilot } from "@/components/student/PrecalculusTopic14PolynomialEndBehaviorPracticePilot";
import { PrecalculusTopic14PolynomialEndBehaviorWorkedPilot } from "@/components/student/PrecalculusTopic14PolynomialEndBehaviorWorkedPilot";
import { PrecalculusTopic15RealZerosAndMultiplicitiesPracticePilot } from "@/components/student/PrecalculusTopic15RealZerosAndMultiplicitiesPracticePilot";
import { PrecalculusTopic15RealZerosAndMultiplicitiesWorkedPilot } from "@/components/student/PrecalculusTopic15RealZerosAndMultiplicitiesWorkedPilot";
import { PrecalculusTopic15LeastPolynomialDegreePracticePilot } from "@/components/student/PrecalculusTopic15LeastPolynomialDegreePracticePilot";
import { PrecalculusTopic15LeastPolynomialDegreeWorkedPilot } from "@/components/student/PrecalculusTopic15LeastPolynomialDegreeWorkedPilot";
import { PrecalculusTopic15PolynomialInequalityPracticePilot } from "@/components/student/PrecalculusTopic15PolynomialInequalityPracticePilot";
import { PrecalculusTopic15PolynomialInequalityWorkedPilot } from "@/components/student/PrecalculusTopic15PolynomialInequalityWorkedPilot";
import { PrecalculusTopic16EquationEndBehaviorPracticePilot } from "@/components/student/PrecalculusTopic16EquationEndBehaviorPracticePilot";
import { PrecalculusTopic16EquationEndBehaviorWorkedPilot } from "@/components/student/PrecalculusTopic16EquationEndBehaviorWorkedPilot";
import { PrecalculusTopic12PracticePilot } from "@/components/student/PrecalculusTopic12PracticePilot";
import { PrecalculusTopic12WorkedPilot } from "@/components/student/PrecalculusTopic12WorkedPilot";
import { PrecalculusMasteryAdvantagePilot } from "@/components/student/PrecalculusMasteryAdvantagePilot";
import { requireStudentSessionClaims } from "@/lib/auth/server";
import { fetchInternalQuery, internal } from "@/lib/convex/server";
import type { IntervalClassificationProps } from '@math-platform/math-content/schemas';

export default async function StudentDashboard() {
  const claims = await requireStudentSessionClaims('/student/dashboard');
  const dashboard = await fetchInternalQuery(internal.student.getDashboardData, { userId: claims.sub });
  const [approvedTopic11Pilot, topic11Worked, topic11DeliveryState] = await Promise.all([
    fetchInternalQuery(internal.activities.getApprovedPrecalculusPilot, {}) as Promise<Array<{
      stableActivityId: string;
      mode: 'worked_example' | 'guided_practice' | 'independent_practice';
      props: IntervalClassificationProps;
    }>>,
    fetchInternalQuery(internal.activities.getApprovedTopic11WorkedSource, {}),
    fetchInternalQuery(internal.activities.getTopic11LearnerDeliveryState, { learnerId: claims.sub }),
  ]);
  const topic11Guided = approvedTopic11Pilot.find((item) => item.mode === 'guided_practice');
  const topic11Independent = approvedTopic11Pilot.find((item) => item.mode === 'independent_practice');
  // oxlint-disable-next-line react-hooks-js/purity -- These server queries need one request time for KST decay.
  const now = Date.now();
  const [knowledgeState, physicalKnowledgeState, orderingKnowledgeState, pointwiseKnowledgeState, graphKnowledgeState, negativeRateContextKnowledgeState, quadraticNegativeRateIntervalKnowledgeState, topic12KnowledgeState, ratePatternClassificationKnowledgeState, concavityKnowledgeState, polynomialDegreeLeadingCoefficientKnowledgeState, polynomialExtremaKnowledgeState, rateSignAndTrendKnowledgeState, polynomialEndBehaviorKnowledgeState, realZerosAndMultiplicitiesKnowledgeState, leastPolynomialDegreeKnowledgeState, polynomialInequalityKnowledgeState, topic16EquationEndBehaviorKnowledgeState] = await Promise.all([
    fetchInternalQuery(
      internal.learningEvidence.getPrecalculusPilotKnowledgeState,
      { learnerId: claims.sub as `profiles:${string}`, now },
    ),
    fetchInternalQuery(
      internal.learningEvidence.getPrecalculusPhysicalContextKnowledgeState,
      { learnerId: claims.sub as `profiles:${string}`, now },
    ),
    fetchInternalQuery(
      internal.learningEvidence.getPrecalculusTopic12PointwiseRateOrderingKnowledgeState,
      { learnerId: claims.sub as `profiles:${string}`, now },
    ),
    fetchInternalQuery(
      internal.learningEvidence.getPrecalculusTopic12PointwiseLeastRateKnowledgeState,
      { learnerId: claims.sub as `profiles:${string}`, now },
    ),
    fetchInternalQuery(
      internal.learningEvidence.getPrecalculusTopic12GraphAverageRateKnowledgeState,
      { learnerId: claims.sub as `profiles:${string}`, now },
    ),
    fetchInternalQuery(
      internal.learningEvidence.getPrecalculusTopic12NegativeRateContextKnowledgeState,
      { learnerId: claims.sub as `profiles:${string}`, now },
    ),
    fetchInternalQuery(
      internal.learningEvidence.getPrecalculusTopic12QuadraticNegativeRateIntervalKnowledgeState,
      { learnerId: claims.sub as `profiles:${string}`, now },
    ),
    fetchInternalQuery(
      internal.learningEvidence.getPrecalculusTopic12KnowledgeState,
      { learnerId: claims.sub as `profiles:${string}`, now },
    ),
    fetchInternalQuery(
      internal.learningEvidence.getPrecalculusTopic13RatePatternClassificationKnowledgeState,
      { learnerId: claims.sub as `profiles:${string}`, now },
    ),
    fetchInternalQuery(
      internal.learningEvidence.getPrecalculusTopic13ConcavityKnowledgeState,
      { learnerId: claims.sub as `profiles:${string}`, now },
    ),
    fetchInternalQuery(
      internal.learningEvidence.getTopic14PolynomialDegreeLeadingCoefficientKnowledgeState,
      { learnerId: claims.sub as `profiles:${string}`, now },
    ),
    fetchInternalQuery(
      internal.learningEvidence.getPrecalculusTopic14PolynomialExtremaKnowledgeState,
      { learnerId: claims.sub as `profiles:${string}`, now },
    ),
    fetchInternalQuery(
      internal.learningEvidence.getPrecalculusTopic14RateSignAndTrendKnowledgeState,
      { learnerId: claims.sub as `profiles:${string}`, now },
    ),
    fetchInternalQuery(
      internal.learningEvidence.getPrecalculusTopic14PolynomialEndBehaviorKnowledgeState,
      { learnerId: claims.sub as `profiles:${string}`, now },
    ),
    fetchInternalQuery(
      internal.learningEvidence.getPrecalculusTopic15RealZerosAndMultiplicitiesKnowledgeState,
      { learnerId: claims.sub as `profiles:${string}`, now },
    ),
    fetchInternalQuery(
      internal.learningEvidence.getPrecalculusTopic15LeastPolynomialDegreeKnowledgeState,
      { learnerId: claims.sub as `profiles:${string}`, now },
    ),
    fetchInternalQuery(
      internal.learningEvidence.getPrecalculusTopic15PolynomialInequalityKnowledgeState,
      { learnerId: claims.sub as `profiles:${string}`, now },
    ),
    fetchInternalQuery(
      internal.learningEvidence.getPrecalculusTopic16PolynomialEquationEndBehaviorKnowledgeState,
      { learnerId: claims.sub as `profiles:${string}`, now },
    ),
  ]);

  return (
    <div className="max-w-content mx-auto px-6 py-16">
      <section className="border border-subtle rounded-panel p-6 my-6">
        <h1>Your course</h1><Link href="/student/lessons" className="underline">Open all published lessons</Link>
        <h2 className="mt-4">Assigned lessons</h2>
        {dashboard.assignments.length === 0 && <p>No lessons are assigned.</p>}
        <ul>{dashboard.assignments.map((lesson: { id: string; topic: string; title: string; className: string }) => <li key={lesson.id}><Link className="underline" href={`/student/lessons/${lesson.topic}`}>{lesson.className}: {lesson.topic} {lesson.title}</Link></li>)}</ul>
        <h2 className="mt-4">Due reviews</h2>
        {dashboard.dueReviews.length === 0 && <p>No practice reviews are due.</p>}
        <ul>{dashboard.dueReviews.map((review: { id: string; title: string; nodeId: string; mode: string }) => <li key={review.id}><a className="underline" href={`#${review.nodeId}-${review.mode}`}>{review.title} ({review.mode.replaceAll('_', ' ')})</a></li>)}</ul>
      </section>

      <div className="text-center py-20">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-panel mb-6"
          style={{ backgroundColor: "rgba(94, 106, 210, 0.15)" }}
        >
          <span className="text-3xl" aria-hidden="true">📚</span>
        </div>
        <h1
          className="text-primary-text mb-4"
          style={{ fontSize: '32px', fontWeight: 510 }}
        >
          Student Dashboard
        </h1>
        <p className="text-secondary-text text-lg mb-8 max-w-md mx-auto">
          Review the Topic 1.1 through Topic 1.6 source examples. Complete Guided Practice. Then finish Independent Practice.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/curriculum" className="btn-secondary">
            View Curriculum
          </Link>
          <Link href="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
      <PrecalculusPhysicalContextWorkedPilot />
      <PrecalculusPhysicalContextPracticePilot
        knowledgeState={physicalKnowledgeState}
        mode="guided_practice"
      />
      <PrecalculusPhysicalContextPracticePilot
        knowledgeState={physicalKnowledgeState}
        mode="independent_practice"
      />
      {topic11DeliveryState === 'needs_acknowledgement' && topic11Worked && <PrecalculusTopic11DailyCurriculumPilot
        stableActivityId={topic11Worked.stableActivityId}
        activityProps={topic11Worked.props as IntervalClassificationProps}
      />}
      {topic11DeliveryState === 'awaiting_teacher_confirmation' && <p role="status">Your acknowledgement is saved. Wait for your teacher to confirm the lesson before you start practice.
        {/* oxlint-disable-next-line next/no-html-link-for-pages -- Request current teacher state from the server on this same lesson URL. */}
        <a className="underline" href="/student/lessons/1.1">Check lesson status</a></p>}
      {topic11DeliveryState === 'ready_for_practice' && topic11Guided && <PrecalculusMasteryAdvantagePilot
        knowledgeState={knowledgeState}
        mode="guided_practice"
        seed={0}
        stableActivityId={topic11Guided.stableActivityId}
        activityProps={topic11Guided.props as IntervalClassificationProps}
      />}
      {topic11DeliveryState === 'ready_for_practice' && topic11Independent && <PrecalculusMasteryAdvantagePilot
        knowledgeState={knowledgeState}
        mode="independent_practice"
        seed={2}
        stableActivityId={topic11Independent.stableActivityId}
        activityProps={topic11Independent.props as IntervalClassificationProps}
      />}
      <PrecalculusTopic12PointwiseOrderingWorkedPilot />
      <PrecalculusTopic12PointwiseOrderingPracticePilot
        knowledgeState={orderingKnowledgeState}
        mode="guided_practice"
      />
      <PrecalculusTopic12PointwiseOrderingPracticePilot
        knowledgeState={orderingKnowledgeState}
        mode="independent_practice"
      />
      <PrecalculusTopic12PointwiseWorkedPilot />
      <PrecalculusTopic12PointwisePracticePilot
        knowledgeState={pointwiseKnowledgeState}
        mode="guided_practice"
      />
      <PrecalculusTopic12PointwisePracticePilot
        knowledgeState={pointwiseKnowledgeState}
        mode="independent_practice"
      />
      <PrecalculusTopic12GraphWorkedPilot />
      <PrecalculusTopic12GraphPracticePilot
        knowledgeState={graphKnowledgeState}
        mode="guided_practice"
      />
      <PrecalculusTopic12GraphPracticePilot
        knowledgeState={graphKnowledgeState}
        mode="independent_practice"
      />
      <PrecalculusTopic12NegativeRateContextWorkedPilot />
      <PrecalculusTopic12NegativeRateContextPracticePilot
        knowledgeState={negativeRateContextKnowledgeState}
        mode="guided_practice"
      />
      <PrecalculusTopic12NegativeRateContextPracticePilot
        knowledgeState={negativeRateContextKnowledgeState}
        mode="independent_practice"
      />
      <PrecalculusTopic12QuadraticNegativeRateIntervalWorkedPilot />
      <PrecalculusTopic12QuadraticNegativeRateIntervalPracticePilot
        knowledgeState={quadraticNegativeRateIntervalKnowledgeState}
        mode="guided_practice"
      />
      <PrecalculusTopic12QuadraticNegativeRateIntervalPracticePilot
        knowledgeState={quadraticNegativeRateIntervalKnowledgeState}
        mode="independent_practice"
      />
      <PrecalculusTopic12WorkedPilot />
      <PrecalculusTopic12PracticePilot
        knowledgeState={topic12KnowledgeState}
        mode="guided_practice"
      />
      <PrecalculusTopic12PracticePilot
        knowledgeState={topic12KnowledgeState}
        mode="independent_practice"
      />
      <PrecalculusTopic13RatePatternClassificationWorkedPilot />
      <PrecalculusTopic13RatePatternClassificationPracticePilot
        knowledgeState={ratePatternClassificationKnowledgeState}
        mode="guided_practice"
      />
      <PrecalculusTopic13RatePatternClassificationPracticePilot
        knowledgeState={ratePatternClassificationKnowledgeState}
        mode="independent_practice"
      />
      <PrecalculusTopic13ConcavityWorkedPilot />
      <PrecalculusTopic13ConcavityPracticePilot
        knowledgeState={concavityKnowledgeState}
        mode="guided_practice"
      />
      <PrecalculusTopic13ConcavityPracticePilot
        knowledgeState={concavityKnowledgeState}
        mode="independent_practice"
      />
      <PrecalculusTopic14PolynomialDegreeLeadingCoefficientWorkedPilot />
      <PrecalculusTopic14PolynomialDegreeLeadingCoefficientPracticePilot
        knowledgeState={polynomialDegreeLeadingCoefficientKnowledgeState}
        mode="guided_practice"
      />
      <PrecalculusTopic14PolynomialDegreeLeadingCoefficientPracticePilot
        knowledgeState={polynomialDegreeLeadingCoefficientKnowledgeState}
        mode="independent_practice"
      />
      <PrecalculusTopic14PolynomialExtremaWorkedPilot />
      <PrecalculusTopic14PolynomialExtremaPracticePilot
        knowledgeState={polynomialExtremaKnowledgeState}
        mode="guided_practice"
      />
      <PrecalculusTopic14PolynomialExtremaPracticePilot
        knowledgeState={polynomialExtremaKnowledgeState}
        mode="independent_practice"
      />
      <PrecalculusTopic14RateSignAndTrendWorkedPilot />
      <PrecalculusTopic14RateSignAndTrendPracticePilot
        knowledgeState={rateSignAndTrendKnowledgeState}
        mode="guided_practice"
      />
      <PrecalculusTopic14RateSignAndTrendPracticePilot
        knowledgeState={rateSignAndTrendKnowledgeState}
        mode="independent_practice"
      />
      <PrecalculusTopic14PolynomialEndBehaviorWorkedPilot />
      <PrecalculusTopic14PolynomialEndBehaviorPracticePilot
        knowledgeState={polynomialEndBehaviorKnowledgeState}
        mode="guided_practice"
      />
      <PrecalculusTopic14PolynomialEndBehaviorPracticePilot
        knowledgeState={polynomialEndBehaviorKnowledgeState}
        mode="independent_practice"
      />
      <PrecalculusTopic15RealZerosAndMultiplicitiesWorkedPilot />
      <PrecalculusTopic15RealZerosAndMultiplicitiesPracticePilot
        knowledgeState={realZerosAndMultiplicitiesKnowledgeState}
        mode="guided_practice"
      />
      <PrecalculusTopic15RealZerosAndMultiplicitiesPracticePilot
        knowledgeState={realZerosAndMultiplicitiesKnowledgeState}
        mode="independent_practice"
      />
      <PrecalculusTopic15LeastPolynomialDegreeWorkedPilot />
      <PrecalculusTopic15LeastPolynomialDegreePracticePilot
        knowledgeState={leastPolynomialDegreeKnowledgeState}
        mode="guided_practice"
      />
      <PrecalculusTopic15LeastPolynomialDegreePracticePilot
        knowledgeState={leastPolynomialDegreeKnowledgeState}
        mode="independent_practice"
      />
      <PrecalculusTopic15PolynomialInequalityWorkedPilot />
      <PrecalculusTopic15PolynomialInequalityPracticePilot
        knowledgeState={polynomialInequalityKnowledgeState}
        mode="guided_practice"
      />
      <PrecalculusTopic15PolynomialInequalityPracticePilot
        knowledgeState={polynomialInequalityKnowledgeState}
        mode="independent_practice"
      />
      <PrecalculusTopic16EquationEndBehaviorWorkedPilot />
      <PrecalculusTopic16EquationEndBehaviorPracticePilot
        knowledgeState={topic16EquationEndBehaviorKnowledgeState}
        mode="guided_practice"
      />
      <PrecalculusTopic16EquationEndBehaviorPracticePilot
        knowledgeState={topic16EquationEndBehaviorKnowledgeState}
        mode="independent_practice"
      />
    </div>
  );
}
