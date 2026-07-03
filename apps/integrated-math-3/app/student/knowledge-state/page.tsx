import { requireStudentSessionClaims } from '@/lib/auth/server';
import { fetchInternalQuery } from '@/lib/convex/server';

interface VisualNodeV1 {
  nodeId: string;
  title: string;
  description?: string;
  state: 'mastered' | 'ready' | 'blocked' | 'review_due' | 'unknown';
  difficulty?: number;
  domain?: string;
}

interface StudentVisualizationV1 {
  schemaVersion: 'v1';
  mastered: VisualNodeV1[];
  ready: VisualNodeV1[];
  blocked: VisualNodeV1[];
  reviewDue: VisualNodeV1[];
  recommendedNext: VisualNodeV1[];
  edges: ReadonlyArray<unknown>;
  activeMisconceptionCount: number;
}

const QUERY_REF = 'internal.student.getStudentKnowledgeState';

function emptyVisualization(): StudentVisualizationV1 {
  return {
    schemaVersion: 'v1',
    mastered: [],
    ready: [],
    blocked: [],
    reviewDue: [],
    recommendedNext: [],
    edges: [],
    activeMisconceptionCount: 0,
  };
}

/**
 * Renders the student's knowledge-state dashboard derived from the
 * KST pipeline (SRS cards → bridge → getKnowledgeState → getOuterFringe
 * → visualization projection).
 *
 * Phase 4 verification route — displays mastered skills count,
 * ready-to-learn (fringe) skills, and review-due (decaying) skills.
 *
 * Authorization: gated by requireStudentSessionClaims (student-only).
 * The Convex call uses a pending API ref — once Convex deploys pick up
 * convex/student/knowledge-state.ts, replace QUERY_REF with
 * `internal.student.getStudentKnowledgeState`.
 */
export default async function StudentKnowledgeStatePage() {
  const claims = await requireStudentSessionClaims('/auth/login');

  let visualization: StudentVisualizationV1;
  try {
    visualization = (await fetchInternalQuery(
      QUERY_REF,
      { studentId: claims.sub },
    )) as StudentVisualizationV1 | null;

    if (!visualization) {
      visualization = emptyVisualization();
    }
  } catch {
    visualization = emptyVisualization();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-8">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground font-mono-num">
          Welcome, {claims.username}
        </p>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Knowledge State
        </h1>
        <p className="text-sm text-muted-foreground">
          KST-derived mastery tracking — Phase 4 production wiring
          verification.
        </p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Mastered',
            value: visualization.mastered.length,
          },
          {
            label: 'Ready',
            value: visualization.ready.length,
          },
          {
            label: 'Review Due',
            value: visualization.reviewDue.length,
          },
          {
            label: 'Blocked',
            value: visualization.blocked.length,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="card-workbook p-4 space-y-1 text-center"
          >
            <p className="font-mono-num text-2xl font-bold text-primary">
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Mastered skills */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold text-foreground">
          Mastered Skills
        </h2>
        {visualization.mastered.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No skills mastered yet. Complete practice activities to build
            mastery.
          </p>
        ) : (
          <div className="space-y-2">
            {visualization.mastered.map((skill) => (
              <div
                key={skill.nodeId}
                className="rounded-lg border border-border bg-card p-3"
                data-testid="mastered-skill"
              >
                <span className="text-sm font-medium text-foreground">
                  {skill.title}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Ready to learn (fringe) */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold text-foreground">
          Ready to Learn
        </h2>
        {visualization.ready.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No skills ready to learn. Complete prerequisites to unlock new
            skills.
          </p>
        ) : (
          <div className="space-y-2">
            {visualization.ready.map((skill) => (
              <div
                key={skill.nodeId}
                className="rounded-lg border border-accent/30 bg-accent/5 p-3"
                data-testid="ready-skill"
              >
                <span className="text-sm font-medium text-foreground">
                  {skill.title}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Review due (decaying) */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold text-foreground">
          Review Due
        </h2>
        {visualization.reviewDue.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No skills need review. Keep practicing to maintain mastery.
          </p>
        ) : (
          <div className="space-y-2">
            {visualization.reviewDue.map((skill) => (
              <div
                key={skill.nodeId}
                className="rounded-lg border border-destructive/30 bg-destructive/5 p-3"
                data-testid="review-due-skill"
              >
                <span className="text-sm font-medium text-foreground">
                  {skill.title}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recommended next */}
      {visualization.recommendedNext.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-foreground">
            Recommended Next
          </h2>
          <div className="space-y-2">
            {visualization.recommendedNext.map((skill) => (
              <div
                key={skill.nodeId}
                className="rounded-lg border border-primary/30 bg-primary/5 p-3"
                data-testid="recommended-skill"
              >
                <span className="text-sm font-medium text-foreground">
                  {skill.title}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
