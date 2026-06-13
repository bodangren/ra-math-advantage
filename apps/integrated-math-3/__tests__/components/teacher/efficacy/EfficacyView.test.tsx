/**
 * Phase 4 Red — EfficacyView component (Task 1 of Phase 4).
 *
 * Pinned contract (test-strategy §6 Phase 4 + §4 Phase 4 edge cases):
 *
 *   <EfficacyView claims cohort={...} experiments={...} />
 *     - renders the page title "Efficacy Dashboard"
 *     - renders four cohort metric tiles (retention, time-to-mastery,
 *       accuracy, review-success) when cohort.status === 'ok'
 *     - renders a suppression banner with `n` + `threshold` (and NO metric
 *       values) when cohort.status === 'suppressed' (privacy contract from
 *       Phase 2 suppression.test.ts)
 *     - renders an empty state when cohort is null AND experiments is empty
 *     - renders each active experiment row with experiment id, per-variant
 *       `n`, and significance indicator ('none' | 'weak' | 'strong')
 *     - returns null (renders nothing) when guardEfficacyAccess(claims) is null
 *       — defense-in-depth per test-strategy §4 Phase 4 unauthorized-role case
 *     - payload contains NO PII: no `stu_*` ids, no `studentId`, no
 *       `displayName` / `username` / `email` / `password` keys in any prop
 *
 * No live Convex calls per test-strategy §6 Phase 4 — props are pre-computed
 * Phase 1–3 outputs passed directly to the component.
 *
 * Module under test: `@/components/teacher/efficacy/EfficacyView`
 * (does not exist at HEAD).
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { SessionClaims } from '@math-platform/core-auth';
import {
  EfficacyView,
  type EfficacyCohortView,
  type EfficacyExperimentView,
} from '@/components/teacher/efficacy/EfficacyView';

const teacherClaims: SessionClaims = {
  sub: 'user_teacher_001',
  username: 'alice.teacher',
  role: 'teacher',
  organizationId: 'org_001',
  iat: 1_700_000_000,
  exp: 1_700_003_600,
};

const adminClaims: SessionClaims = {
  sub: 'user_admin_001',
  username: 'admin.user',
  role: 'admin',
  organizationId: 'org_001',
  iat: 1_700_000_000,
  exp: 1_700_003_600,
};

const studentClaims: SessionClaims = {
  sub: 'user_student_001',
  username: 'student.user',
  role: 'student',
  organizationId: 'org_001',
  iat: 1_700_000_000,
  exp: 1_700_003_600,
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const WINDOW_START_MS = Date.UTC(2026, 3, 1, 0, 0, 0);

const okCohort: EfficacyCohortView = {
  status: 'ok',
  classId: 'class_red_001',
  n: 24,
  windowStartMs: WINDOW_START_MS,
  windowEndMs: WINDOW_START_MS + 30 * MS_PER_DAY,
  retention: [
    {
      bucketStartMs: WINDOW_START_MS,
      bucketEndMs: WINDOW_START_MS + MS_PER_DAY,
      averageRetention: 0.85,
      cardCount: 50,
    },
    {
      bucketStartMs: WINDOW_START_MS + MS_PER_DAY,
      bucketEndMs: WINDOW_START_MS + 2 * MS_PER_DAY,
      averageRetention: 0.78,
      cardCount: 48,
    },
  ],
  timeToMastery: [
    { objectiveId: 'obj_polynomial_roots', daysToMastery: 4.5, reviewsToMastery: 6, reachedMastery: true },
    { objectiveId: 'obj_quadratic_formula', daysToMastery: 6.2, reviewsToMastery: 8, reachedMastery: true },
  ],
  accuracy: [
    {
      bucketStartMs: WINDOW_START_MS,
      bucketEndMs: WINDOW_START_MS + MS_PER_DAY,
      firstAttemptAccuracy: 0.72,
      firstAttemptCount: 60,
    },
  ],
  reviewSuccess: {
    successCount: 140,
    totalCount: 160,
    successRate: 0.875,
    ratingBreakdown: { Again: 20, Hard: 30, Good: 80, Easy: 30 },
  },
};

const suppressedCohort: EfficacyCohortView = {
  status: 'suppressed',
  classId: 'class_red_002',
  n: 4,
  threshold: 10,
  windowStartMs: WINDOW_START_MS,
  windowEndMs: WINDOW_START_MS + 30 * MS_PER_DAY,
};

const twoVariantExperiment: EfficacyExperimentView = {
  experimentId: 'exp_srs_interval_v1',
  status: 'active',
  variants: {
    control: { n: 100, mean: 0.62 },
    treatment: { n: 100, mean: 0.74 },
  },
  significance: 'strong',
};

const noEffectExperiment: EfficacyExperimentView = {
  experimentId: 'exp_hint_density_v1',
  status: 'active',
  variants: {
    sparse: { n: 50, mean: 0.65 },
    dense: { n: 50, mean: 0.66 },
  },
  significance: 'none',
};

describe('EfficacyView', () => {
  describe('layout', () => {
    it('renders the page title', () => {
      render(<EfficacyView claims={teacherClaims} cohort={okCohort} experiments={[]} />);

      expect(screen.getByRole('heading', { level: 1, name: /Efficacy Dashboard/i })).toBeInTheDocument();
    });

    it('renders the cohort metrics section heading', () => {
      render(<EfficacyView claims={teacherClaims} cohort={okCohort} experiments={[]} />);

      expect(screen.getByRole('heading', { level: 2, name: /Cohort Metrics/i })).toBeInTheDocument();
    });

    it('renders the active experiments section heading', () => {
      render(<EfficacyView claims={teacherClaims} cohort={okCohort} experiments={[]} />);

      expect(screen.getByRole('heading', { level: 2, name: /Active Experiments/i })).toBeInTheDocument();
    });
  });

  describe('cohort metrics tiles (status === "ok")', () => {
    it('renders all four metric tiles', () => {
      render(<EfficacyView claims={teacherClaims} cohort={okCohort} experiments={[]} />);

      expect(screen.getByText(/Retention/i)).toBeInTheDocument();
      expect(screen.getByText(/Time to Mastery/i)).toBeInTheDocument();
      expect(screen.getByText(/First-Attempt Accuracy/i)).toBeInTheDocument();
      expect(screen.getByText(/Review Success Rate/i)).toBeInTheDocument();
    });

    it('displays the cohort sample size', () => {
      render(<EfficacyView claims={teacherClaims} cohort={okCohort} experiments={[]} />);

      expect(screen.getByText(/24/)).toBeInTheDocument();
    });

    it('displays the review-success rate percentage', () => {
      render(<EfficacyView claims={teacherClaims} cohort={okCohort} experiments={[]} />);

      expect(screen.getByText(/88%/)).toBeInTheDocument();
    });

    it('displays the first-attempt accuracy percentage', () => {
      render(<EfficacyView claims={teacherClaims} cohort={okCohort} experiments={[]} />);

      expect(screen.getByText(/72%/)).toBeInTheDocument();
    });

    it('displays the average retention percentage', () => {
      render(<EfficacyView claims={teacherClaims} cohort={okCohort} experiments={[]} />);

      expect(screen.getByText(/82%/)).toBeInTheDocument();
    });
  });

  describe('cohort metrics tiles (status === "suppressed")', () => {
    it('renders a suppression banner with n + threshold (no metric values)', () => {
      render(<EfficacyView claims={teacherClaims} cohort={suppressedCohort} experiments={[]} />);

      expect(screen.getByText(/too small to display/i)).toBeInTheDocument();
      expect(screen.getByText(/4/)).toBeInTheDocument();
      expect(screen.getByText(/10/)).toBeInTheDocument();
    });

    it('does NOT render any retention or accuracy values when suppressed (privacy)', () => {
      render(<EfficacyView claims={teacherClaims} cohort={suppressedCohort} experiments={[]} />);

      expect(screen.queryByText(/82%/)).not.toBeInTheDocument();
      expect(screen.queryByText(/72%/)).not.toBeInTheDocument();
      expect(screen.queryByText(/88%/)).not.toBeInTheDocument();
    });
  });

  describe('active experiments list', () => {
    it('renders one row per experiment', () => {
      render(
        <EfficacyView
          claims={teacherClaims}
          cohort={okCohort}
          experiments={[twoVariantExperiment, noEffectExperiment]}
        />,
      );

      expect(screen.getByText(/exp_srs_interval_v1/)).toBeInTheDocument();
      expect(screen.getByText(/exp_hint_density_v1/)).toBeInTheDocument();
    });

    it('renders per-variant sample sizes', () => {
      render(
        <EfficacyView
          claims={teacherClaims}
          cohort={okCohort}
          experiments={[twoVariantExperiment]}
        />,
      );

      const rows = screen.getAllByText(/n=100/);
      expect(rows.length).toBeGreaterThanOrEqual(2);
    });

    it('renders the significance indicator for a "strong" experiment', () => {
      render(
        <EfficacyView
          claims={teacherClaims}
          cohort={okCohort}
          experiments={[twoVariantExperiment]}
        />,
      );

      expect(screen.getByText(/strong/i)).toBeInTheDocument();
    });

    it('renders the significance indicator for a "none" experiment', () => {
      render(
        <EfficacyView
          claims={teacherClaims}
          cohort={okCohort}
          experiments={[noEffectExperiment]}
        />,
      );

      expect(screen.getByText(/no significant effect/i)).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows an empty state when cohort is null and experiments is empty', () => {
      render(<EfficacyView claims={teacherClaims} cohort={null} experiments={[]} />);

      expect(screen.getByText(/No efficacy data available/i)).toBeInTheDocument();
    });

    it('does NOT show the empty state when cohort is present', () => {
      render(<EfficacyView claims={teacherClaims} cohort={okCohort} experiments={[]} />);

      expect(screen.queryByText(/No efficacy data available/i)).not.toBeInTheDocument();
    });
  });

  describe('role gate (defense-in-depth)', () => {
    it('renders nothing when claims.role is "student"', () => {
      const { container } = render(
        <EfficacyView claims={studentClaims} cohort={okCohort} experiments={[twoVariantExperiment]} />,
      );

      expect(container).toBeEmptyDOMElement();
    });

    it('renders nothing when claims is null', () => {
      const { container } = render(
        <EfficacyView claims={null} cohort={okCohort} experiments={[]} />,
      );

      expect(container).toBeEmptyDOMElement();
    });

    it('renders the dashboard for an admin session (admin is teacher-compatible)', () => {
      render(<EfficacyView claims={adminClaims} cohort={okCohort} experiments={[]} />);

      expect(screen.getByRole('heading', { level: 1, name: /Efficacy Dashboard/i })).toBeInTheDocument();
    });
  });

  describe('PII safety', () => {
    it('does not render any stu_* student ids', () => {
      render(
        <EfficacyView
          claims={teacherClaims}
          cohort={okCohort}
          experiments={[twoVariantExperiment]}
        />,
      );

      expect(screen.queryByText(/stu_/)).not.toBeInTheDocument();
    });

    it('does not render any displayName, username, email, or password keys', () => {
      render(
        <EfficacyView
          claims={teacherClaims}
          cohort={okCohort}
          experiments={[twoVariantExperiment]}
        />,
      );

      expect(screen.queryByText(/displayName/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/username/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/email/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/password/i)).not.toBeInTheDocument();
    });
  });
});